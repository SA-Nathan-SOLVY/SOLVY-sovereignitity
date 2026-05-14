/**
 * SOLVY Metrics Server — AggregatedMetric Model
 * Data Sovereignty Principle: This model only handles aggregate totals.
 * Individual transaction data is never stored, received, or processed.
 */

const db = require('../db');

class AggregatedMetric {
  /**
   * Create a new aggregated metric record
   * @param {Object} data
   * @param {string} data.memberIdHash — SHA-256 hash (never raw email)
   * @param {string} data.timestamp — ISO string when data was computed
   * @param {number} data.totalVolume — total spending volume
   * @param {number} data.transactionCount — number of transactions
   * @param {Object} data.categorySums — { category: amount }
   * @param {number} data.totalInterchange — estimated interchange revenue
   * @param {number} data.memberPoolShare — 70% of interchange
   * @param {string} data.periodStart — ISO date
   * @param {string} data.periodEnd — ISO date
   * @param {string} [data.clientVersion] — client app version
   * @returns {Object} Inserted record with id
   */
  static create(data) {
    const stmt = db.prepare(`
      INSERT INTO member_aggregates (
        member_id_hash, timestamp, total_volume, transaction_count,
        category_sums, total_interchange, member_pool_share,
        period_start, period_end, client_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.memberIdHash,
      data.timestamp,
      data.totalVolume,
      data.transactionCount,
      JSON.stringify(data.categorySums || {}),
      data.totalInterchange,
      data.memberPoolShare,
      data.periodStart,
      data.periodEnd,
      data.clientVersion || null
    );

    return {
      id: result.lastInsertRowid,
      ...data,
      receivedAt: new Date().toISOString()
    };
  }

  /**
   * Find all records with optional filtering
   * @param {Object} filters
   * @param {string} [filters.memberIdHash]
   * @param {string} [filters.startDate]
   * @param {string} [filters.endDate]
   * @param {number} [filters.limit=100]
   * @param {number} [filters.offset=0]
   * @returns {Array}
   */
  static findAll(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.memberIdHash) {
      conditions.push('member_id_hash = ?');
      params.push(filters.memberIdHash);
    }
    if (filters.startDate) {
      conditions.push('timestamp >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('timestamp <= ?');
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    const limit = Math.min(parseInt(filters.limit, 10) || 100, 1000);
    const offset = parseInt(filters.offset, 10) || 0;

    const stmt = db.prepare(`
      SELECT
        id,
        member_id_hash as memberIdHash,
        timestamp,
        total_volume as totalVolume,
        transaction_count as transactionCount,
        category_sums as categorySums,
        total_interchange as totalInterchange,
        member_pool_share as memberPoolShare,
        period_start as periodStart,
        period_end as periodEnd,
        client_version as clientVersion,
        received_at as receivedAt
      FROM member_aggregates
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `);

    const rows = stmt.all(...params, limit, offset);

    // Parse JSON category_sums
    return rows.map(row => ({
      ...row,
      categorySums: JSON.parse(row.categorySums || '{}')
    }));
  }

  /**
   * Count records matching filters
   * @param {Object} filters
   * @returns {number}
   */
  static count(filters = {}) {
    const conditions = [];
    const params = [];

    if (filters.memberIdHash) {
      conditions.push('member_id_hash = ?');
      params.push(filters.memberIdHash);
    }
    if (filters.startDate) {
      conditions.push('timestamp >= ?');
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      conditions.push('timestamp <= ?');
      params.push(filters.endDate);
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    const stmt = db.prepare(`SELECT COUNT(*) as count FROM member_aggregates ${whereClause}`);
    return stmt.get(...params).count;
  }

  /**
   * Get global summary across all members
   * Returns only totals — never individual member data
   * @returns {Object}
   */
  static getSummary() {
    const totals = db.prepare(`
      SELECT
        COUNT(DISTINCT member_id_hash) as totalMembers,
        SUM(total_volume) as totalVolumeAllMembers,
        SUM(total_interchange) as totalInterchangeAllMembers,
        SUM(member_pool_share) as totalMemberPoolAllMembers,
        SUM(transaction_count) as totalTransactionCount
      FROM member_aggregates
    `).get();

    const periodRange = db.prepare(`
      SELECT
        MIN(period_start) as earliestPeriodStart,
        MAX(period_end) as latestPeriodEnd
      FROM member_aggregates
    `).get();

    const totalInterchange = totals.totalInterchangeAllMembers || 0;
    const totalMemberPool = totals.totalMemberPoolAllMembers || 0;

    // Aggregate category sums across all records
    const allRecords = db.prepare('SELECT category_sums FROM member_aggregates').all();
    const categorySums = {};
    for (const record of allRecords) {
      const cats = JSON.parse(record.category_sums || '{}');
      for (const [cat, amount] of Object.entries(cats)) {
        categorySums[cat] = (categorySums[cat] || 0) + amount;
      }
    }

    return {
      totalMembers: totals.totalMembers || 0,
      totalVolumeAllMembers: Math.round((totals.totalVolumeAllMembers || 0) * 100) / 100,
      totalInterchangeAllMembers: Math.round(totalInterchange * 100) / 100,
      totalMemberPoolAllMembers: Math.round(totalMemberPool * 100) / 100,
      totalOperationsFund: Math.round((totalInterchange * 0.20) * 100) / 100,
      totalSovereignFund: Math.round((totalInterchange * 0.10) * 100) / 100,
      totalTransactionCount: totals.totalTransactionCount || 0,
      categorySums: Object.fromEntries(
        Object.entries(categorySums).map(([k, v]) => [k, Math.round(v * 100) / 100])
      ),
      period: {
        start: periodRange.earliestPeriodStart || null,
        end: periodRange.latestPeriodEnd || null
      }
    };
  }

  /**
   * Validate that a request body contains ONLY aggregate data.
   * Rejects any payload that includes individual transaction fields.
   * @param {Object} body
   * @returns {Object|null} — { error: string } if invalid, null if valid
   */
  static validateForIndividualData(body) {
    const forbiddenKeys = [
      'transactions', 'transaction', 'merchant', 'merchants', 'merchantName',
      'merchantNames', 'transactionId', 'transactionIds', 'rawData',
      'individualData', 'purchaseDetails', 'itemized', 'receipt'
    ];

    const bodyKeys = Object.keys(body).map(k => k.toLowerCase());
    const found = forbiddenKeys.filter(fk =>
      bodyKeys.includes(fk.toLowerCase()) ||
      bodyKeys.some(bk => bk.includes(fk.toLowerCase()))
    );

    if (found.length > 0) {
      return {
        error: `Individual transaction data not accepted — only aggregated metrics allowed. Rejected fields: ${found.join(', ')}`
      };
    }

    return null;
  }
}

module.exports = AggregatedMetric;
