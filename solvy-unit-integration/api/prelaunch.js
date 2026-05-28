/**
 * SOLVY Prelaunch Commitment API
 * POST /api/prelaunch/commit  — Submit a new commitment
 * GET  /api/prelaunch/commitments — List all commitments (public)
 */

const { addCommitment, getCommitments, getCommitmentStats } = require('../lib/db');

/**
 * POST /api/prelaunch/commit
 */
function handleCommit(req, res) {
  try {
    const { name, email, pledge } = req.body;

    if (!name || !email || pledge == null) {
      return res.status(400).json({ error: 'Name, email, and pledge are required.' });
    }

    const pledgeNum = parseFloat(pledge);
    if (isNaN(pledgeNum) || pledgeNum < 10) {
      return res.status(400).json({ error: 'Pledge must be at least $10.' });
    }

    const result = addCommitment({ name: name.trim(), email: email.trim(), pledge: pledgeNum });
    const stats = getCommitmentStats();

    console.log('[Prelaunch] New commitment:', result.name, '$' + pledgeNum);

    res.json({
      success: true,
      commitment: result,
      stats,
    });
  } catch (err) {
    console.error('[Prelaunch] Commit error:', err);
    res.status(500).json({ error: 'Failed to record commitment.' });
  }
}

/**
 * GET /api/prelaunch/commitments
 */
function listCommitments(req, res) {
  try {
    const commitments = getCommitments();
    const stats = getCommitmentStats();

    res.json({
      commitments: commitments.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        monthly_pledge: c.monthly_pledge,
        committed_at: c.committed_at,
        status: c.status,
        created_at: c.created_at,
      })),
      stats,
    });
  } catch (err) {
    console.error('[Prelaunch] List error:', err);
    res.status(500).json({ error: 'Failed to load commitments.' });
  }
}

module.exports = { handleCommit, listCommitments };
