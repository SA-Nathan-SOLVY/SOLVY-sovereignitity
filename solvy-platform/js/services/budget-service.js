/**
 * SOLVY Budget Service
 * Local-first budget tracking, expense categorization, and savings goals
 * Vendor-agnostic transaction sync, recurring income detection, AI analysis
 * Prepares anonymized aggregates for AI analysis (DeepSeek integration ready)
 */

const BudgetService = {
  // Default expense categories aligned with common spending patterns
  DEFAULT_CATEGORIES: [
    'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
    'Insurance', 'Debt Payments', 'Savings', 'Entertainment', 'Shopping',
    'Education', 'Childcare', 'Personal Care', 'Gifts', 'Other'
  ],

  // Default income categories
  INCOME_CATEGORIES: [
    'Salary', 'VA Benefits', 'SSDI', 'SSI', 'Business Income',
    'Investment Income', 'Rental Income', 'Freelance', 'Other Income'
  ],

  // Known recurring income source patterns
  RECURRING_PATTERNS: {
    'VA Benefits': { keywords: ['va', 'veterans affairs', 'compensation', 'pension'], frequency: 'monthly', typicalDay: [1, 3] },
    'SSDI': { keywords: ['ssdi', 'social security disability', 'disability insurance'], frequency: 'monthly', typicalDay: [3] },
    'SSI': { keywords: ['ssi', 'supplemental security income'], frequency: 'monthly', typicalDay: [1, 3] },
    'Salary': { keywords: ['payroll', 'direct deposit', 'salary', 'wage'], frequency: 'biweekly', typicalDay: [5, 15] },
    'Business Income': { keywords: ['stripe', 'square', 'paypal', 'shopify', 'reign', 'jewel'], frequency: 'variable' },
    'Freelance': { keywords: ['upwork', 'fiverr', 'freelance', 'consulting', 'contract'], frequency: 'variable' },
    'Rental Income': { keywords: ['rent', 'rental', 'tenant', 'lease'], frequency: 'monthly', typicalDay: [1, 5] },
    'Investment Income': { keywords: ['dividend', 'interest', 'capital gain', 'investment'], frequency: 'quarterly' }
  },

  /**
   * Initialize budget service - seed defaults if first visit
   */
  async init() {
    const budgets = await window.solvyDB.getBudgets();
    if (budgets.length === 0) {
      await this.seedDefaultBudgets();
    }
    console.log('[BudgetService] Initialized');
  },

  /**
   * Seed default budget categories with zero limits
   */
  async seedDefaultBudgets() {
    const defaults = this.DEFAULT_CATEGORIES.map(cat => ({
      category: cat,
      limitAmount: 0,
      period: 'monthly',
      alertThreshold: 0.8,
      createdAt: new Date().toISOString()
    }));

    for (const budget of defaults) {
      await window.solvyDB.setBudget(budget);
    }
    console.log('[BudgetService] Seeded default budgets');
  },

  // ============================================================================
  // DATE UTILITIES
  // ============================================================================

  /**
   * Get current month's date range
   */
  getCurrentMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    return { start, end };
  },

  /**
   * Get previous month's date range
   */
  getPreviousMonthRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    return { start, end };
  },

  /**
   * Get year-to-date range
   */
  getYearToDateRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    return { start, end };
  },

  // ============================================================================
  // DASHBOARD DATA
  // ============================================================================

  /**
   * Get comprehensive budget dashboard data
   */
  async getDashboardData() {
    const { start, end } = this.getCurrentMonthRange();
    const prev = this.getPreviousMonthRange();

    const [
      totalIncome,
      totalExpenses,
      budgetVsActual,
      savingsGoals,
      alerts,
      prevIncome,
      prevExpenses,
      recurringIncome
    ] = await Promise.all([
      window.solvyDB.getTotalIncome(start, end),
      this.getTotalExpenses(start, end),
      window.solvyDB.getBudgetVsActual(start, end),
      window.solvyDB.getSavingsGoals(),
      window.solvyDB.getBudgetAlerts(),
      window.solvyDB.getTotalIncome(prev.start, prev.end),
      this.getTotalExpenses(prev.start, prev.end),
      this.detectRecurringIncome()
    ]);

    const netCashFlow = totalIncome - totalExpenses;
    const totalBudgeted = budgetVsActual.reduce((sum, b) => sum + b.budgeted, 0);
    const overBudgetCategories = budgetVsActual.filter(b => b.overBudget);

    return {
      period: { start, end },
      summary: {
        totalIncome: Math.round(totalIncome * 100) / 100,
        totalExpenses: Math.round(totalExpenses * 100) / 100,
        netCashFlow: Math.round(netCashFlow * 100) / 100,
        totalBudgeted: Math.round(totalBudgeted * 100) / 100,
        budgetUtilization: totalBudgeted > 0 ? Math.round((totalExpenses / totalBudgeted) * 100) : 0
      },
      comparison: {
        incomeChange: prevIncome > 0 ? Math.round(((totalIncome - prevIncome) / prevIncome) * 100) : 0,
        expenseChange: prevExpenses > 0 ? Math.round(((totalExpenses - prevExpenses) / prevExpenses) * 100) : 0
      },
      categories: budgetVsActual.sort((a, b) => b.actual - a.actual),
      overBudgetCount: overBudgetCategories.length,
      savingsGoals: savingsGoals.filter(g => g.status !== 'completed'),
      alerts: alerts.slice(0, 5),
      recurringIncome: recurringIncome.slice(0, 5)
    };
  },

  /**
   * Get total expenses for a date range
   */
  async getTotalExpenses(startDate, endDate) {
    const txs = await window.solvyDB.getTransactionsByDateRange(startDate, endDate);
    return txs.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  },

  /**
   * Get expense breakdown by category
   */
  async getExpenseBreakdown(startDate, endDate) {
    const txs = await window.solvyDB.getTransactionsByDateRange(startDate, endDate);
    const breakdown = {};
    
    txs.forEach(t => {
      const cat = t.category || 'uncategorized';
      breakdown[cat] = (breakdown[cat] || 0) + (parseFloat(t.amount) || 0);
    });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
  },

  /**
   * Get income breakdown by source
   */
  async getIncomeBreakdown(startDate, endDate) {
    const entries = await window.solvyDB.getIncomeByDateRange(startDate, endDate);
    const breakdown = {};
    
    entries.forEach(e => {
      const cat = e.category || 'uncategorized';
      breakdown[cat] = (breakdown[cat] || 0) + (parseFloat(e.amount) || 0);
    });

    return Object.entries(breakdown)
      .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
      .sort((a, b) => b.amount - a.amount);
  },

  // ============================================================================
  // VENDOR-AGNOSTIC TRANSACTION SYNC
  // ============================================================================

  /**
   * Normalize a vendor transaction to SOLVY format
   * Supports Unit.co and Treasury Prime formats
   */
  normalizeTransaction(vendorTx, vendorName) {
    const vendor = vendorName || 'unknown';
    
    // Unit.co format
    if (vendor === 'unit' || vendorTx.attributes) {
      const attrs = vendorTx.attributes || vendorTx;
      return {
        vendorId: vendorTx.id || attrs.id || `${vendor}-${Date.now()}`,
        vendorName: 'unit',
        date: attrs.createdAt || attrs.date || new Date().toISOString(),
        amount: Math.abs(parseFloat(attrs.amount) || 0),
        merchant: attrs.merchant?.name || attrs.merchant || attrs.description || 'Unknown',
        category: this.autoCategorize(attrs.merchant?.name || attrs.merchant || attrs.description || ''),
        status: attrs.status || 'settled',
        cardId: attrs.cardId || null
      };
    }
    
    // Treasury Prime format
    if (vendor === 'treasuryprime' || vendorTx.created_at) {
      return {
        vendorId: vendorTx.id || `${vendor}-${Date.now()}`,
        vendorName: 'treasuryprime',
        date: vendorTx.created_at || vendorTx.date || new Date().toISOString(),
        amount: Math.abs(parseFloat(vendorTx.amount) || 0),
        merchant: vendorTx.description || vendorTx.merchant || 'Unknown',
        category: this.autoCategorize(vendorTx.description || vendorTx.merchant || ''),
        status: vendorTx.status || 'settled',
        cardId: vendorTx.card_id || null
      };
    }
    
    // Generic fallback
    return {
      vendorId: vendorTx.id || vendorTx.vendorId || `${vendor}-${Date.now()}`,
      vendorName: vendor,
      date: vendorTx.date || vendorTx.createdAt || vendorTx.created_at || new Date().toISOString(),
      amount: Math.abs(parseFloat(vendorTx.amount) || 0),
      merchant: vendorTx.merchant || vendorTx.description || vendorTx.payee || 'Unknown',
      category: this.autoCategorize(vendorTx.merchant || vendorTx.description || ''),
      status: vendorTx.status || 'settled',
      cardId: vendorTx.cardId || vendorTx.card_id || null
    };
  },

  /**
   * Sync vendor transactions from banking API into local budget tracker
   * @param {string} accountId - Banking account ID
   * @returns {Promise<Object>} - Sync results
   */
  async syncVendorTransactions(accountId) {
    if (!accountId) {
      console.warn('[BudgetService] No accountId provided for sync');
      return { imported: 0, skipped: 0, errors: 0 };
    }

    try {
      const response = await fetch(`/api/banking/transactions?accountId=${encodeURIComponent(accountId)}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const vendorTxs = data.transactions || [];
      const vendorName = data.vendor || 'unknown';
      
      let imported = 0;
      let skipped = 0;
      let errors = 0;

      for (const vendorTx of vendorTxs) {
        try {
          const normalized = this.normalizeTransaction(vendorTx, vendorName);
          
          // Skip if already exists
          const exists = await window.solvyDB.transactionExists(normalized.vendorId);
          if (exists) {
            skipped++;
            continue;
          }
          
          // Add via budget service for full pipeline (auto-categorize, alerts, goals)
          await this.addCardTransaction(normalized);
          imported++;
        } catch (txError) {
          console.error('[BudgetService] Failed to import transaction:', txError);
          errors++;
        }
      }

      // Store last sync timestamp
      localStorage.setItem('solvy_last_tx_sync', new Date().toISOString());
      localStorage.setItem('solvy_last_tx_account', accountId);

      console.log(`[BudgetService] Sync complete: ${imported} imported, ${skipped} skipped, ${errors} errors`);
      return { imported, skipped, errors, vendor: vendorName };

    } catch (error) {
      console.error('[BudgetService] Transaction sync failed:', error);
      return { imported: 0, skipped: 0, errors: 1, error: error.message };
    }
  },

  /**
   * Poll for new vendor transactions periodically
   */
  startTransactionPolling(accountId, intervalMs = 60000) {
    if (this._txPollInterval) {
      clearInterval(this._txPollInterval);
    }
    
    // Immediate first sync
    this.syncVendorTransactions(accountId);
    
    // Periodic sync
    this._txPollInterval = setInterval(() => {
      this.syncVendorTransactions(accountId);
    }, intervalMs);
    
    console.log(`[BudgetService] Transaction polling started for ${accountId}`);
  },

  /**
   * Stop transaction polling
   */
  stopTransactionPolling() {
    if (this._txPollInterval) {
      clearInterval(this._txPollInterval);
      this._txPollInterval = null;
    }
  },

  // ============================================================================
  // AUTO-CATEGORIZATION
  // ============================================================================

  /**
   * Add a transaction from debit card and auto-categorize
   */
  async addCardTransaction(transaction) {
    // Auto-categorize based on merchant name patterns
    const category = transaction.category || this.autoCategorize(transaction.merchant);
    const tx = { ...transaction, category };
    
    const id = await window.solvyDB.addTransaction(tx);
    
    // Check for budget alerts
    await this.checkBudgetAlerts();
    
    // Auto-allocate to savings goals if configured
    await this.autoAllocateToGoals(transaction.amount);
    
    return id;
  },

  /**
   * Auto-categorize based on merchant name
   */
  autoCategorize(merchant) {
    const merchantLower = (merchant || '').toLowerCase();
    
    const patterns = {
      'Food': ['grocery', 'walmart', 'kroger', 'costco', 'safeway', 'whole foods', 'trader joe', 'restaurant', 'doordash', 'uber eats', 'grubhub', 'chipotle', 'mcdonald', 'taco bell', 'pizza', 'burger', 'taco', 'cafe', 'bakery'],
      'Transportation': ['shell', 'exxon', 'chevron', 'bp', 'gas', 'uber', 'lyft', 'transit', 'toll', 'parking', 'dmv', 'license plate'],
      'Utilities': ['atmos', 'electric', 'gas bill', 'water', 'sewer', 'trash', 'utility', 'verizon', 't-mobile', 'at&t', 'internet', 'phone bill'],
      'Healthcare': ['hospital', 'clinic', 'pharmacy', 'cvs', 'walgreens', 'doctor', 'dental', 'medical', 'health', 'optometry', 'urgent care'],
      'Insurance': ['insurance', 'oneamerica', 'state farm', 'allstate', 'geico', 'progressive', 'liberty mutual', 'health insurance'],
      'Entertainment': ['netflix', 'hulu', 'disney', 'spotify', 'youtube', 'gaming', 'movie', 'theater', 'cinema', 'ticket', 'concert', 'streaming'],
      'Shopping': ['amazon', 'target', 'ebay', 'etsy', 'mall', 'retail', 'fashion', 'clothing', 'shoes', 'department store'],
      'Debt Payments': ['capital one', 'navy federal', 'nfcu', 'usaa', 'credit card', 'loan payment', 'mortgage', 'wyndham', 'indigo', 'creditone', 'platinum', 'gorewards'],
      'Childcare': ['daycare', 'childcare', 'school', 'gymnastics', 'tutor', 'preschool', 'after school', 'kids'],
      'Personal Care': ['salon', 'barber', 'spa', 'beauty', 'evergreen', 'hair', 'nails', 'massage'],
      'Housing': ['rent', 'patriot pointe', 'apartment', 'lease', 'housing', 'hoa', 'property management'],
      'Education': ['tuition', 'university', 'college', 'book', 'course', 'class', 'training', 'certification'],
      'Savings': ['savings', 'transfer to savings', 'deposit to savings', 'investment', 'ira', '401k', 'pua'],
      'Gifts': ['gift', 'present', 'donation', 'charity', 'nonprofit', 'church', 'tithe', 'offering']
    };

    for (const [category, keywords] of Object.entries(patterns)) {
      if (keywords.some(k => merchantLower.includes(k))) {
        return category;
      }
    }
    return 'Other';
  },

  // ============================================================================
  // BUDGET ALERTS
  // ============================================================================

  /**
   * Check budget thresholds and generate alerts
   */
  async checkBudgetAlerts() {
    const { start, end } = this.getCurrentMonthRange();
    const budgetVsActual = await window.solvyDB.getBudgetVsActual(start, end);
    const newAlerts = [];

    for (const item of budgetVsActual) {
      if (item.budgeted <= 0) continue;

      const percentUsed = item.actual / item.budgeted;
      const existingAlerts = await window.solvyDB.db.budget_alerts
        .where({ budgetId: item.id, acknowledged: 0 })
        .toArray();

      // Over budget alert
      if (percentUsed >= 1.0 && !existingAlerts.some(a => a.type === 'over')) {
        const alertId = await window.solvyDB.addBudgetAlert({
          budgetId: item.id,
          type: 'over',
          message: `${item.category} is over budget! Spent $${item.actual.toFixed(2)} of $${item.budgeted.toFixed(2)}`,
          threshold: 1.0
        });
        newAlerts.push({ id: alertId, type: 'over', category: item.category });
      }
      // Warning alert (at threshold)
      else if (percentUsed >= item.alertThreshold && !existingAlerts.some(a => a.type === 'warning')) {
        const alertId = await window.solvyDB.addBudgetAlert({
          budgetId: item.id,
          type: 'warning',
          message: `${item.category} is at ${Math.round(percentUsed * 100)}% of budget`,
          threshold: item.alertThreshold
        });
        newAlerts.push({ id: alertId, type: 'warning', category: item.category });
      }
    }

    return newAlerts;
  },

  // ============================================================================
  // SAVINGS GOALS
  // ============================================================================

  /**
   * Auto-allocate a percentage of transactions to savings goals
   */
  async autoAllocateToGoals(amount) {
    const goals = await window.solvyDB.getSavingsGoals();
    const activeGoals = goals.filter(g => g.status === 'active' && g.autoAllocate);
    
    for (const goal of activeGoals) {
      const allocateAmount = amount * (goal.allocationPercent || 0);
      if (allocateAmount > 0) {
        await window.solvyDB.contributeToSavingsGoal(goal.id, allocateAmount);
      }
    }
  },

  // ============================================================================
  // RECURRING INCOME DETECTION
  // ============================================================================

  /**
   * Detect recurring income patterns from income entries and transactions
   */
  async detectRecurringIncome() {
    const { start, end } = this.getYearToDateRange();
    const entries = await window.solvyDB.getIncomeByDateRange(start, end);
    
    // Group by source/category
    const bySource = {};
    entries.forEach(e => {
      const key = e.source || e.category || 'Unknown';
      if (!bySource[key]) bySource[key] = [];
      bySource[key].push(e);
    });

    const recurring = [];

    for (const [source, items] of Object.entries(bySource)) {
      if (items.length < 2) continue;

      // Sort by date
      items.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate intervals between deposits
      const intervals = [];
      for (let i = 1; i < items.length; i++) {
        const days = (new Date(items[i].date) - new Date(items[i-1].date)) / (1000 * 60 * 60 * 24);
        intervals.push(days);
      }
      
      const avgInterval = intervals.reduce((s, d) => s + d, 0) / intervals.length;
      const amounts = items.map(i => parseFloat(i.amount) || 0);
      const avgAmount = amounts.reduce((s, a) => s + a, 0) / amounts.length;
      const amountVariance = Math.max(...amounts) - Math.min(...amounts);
      const isConsistent = amountVariance / avgAmount < 0.1; // Less than 10% variance
      
      // Determine frequency
      let frequency = 'variable';
      if (avgInterval >= 25 && avgInterval <= 35) frequency = 'monthly';
      else if (avgInterval >= 12 && avgInterval <= 18) frequency = 'biweekly';
      else if (avgInterval >= 85 && avgInterval <= 95) frequency = 'quarterly';
      
      // Detect known patterns
      const detectedCategory = this.detectIncomeCategory(source);
      
      recurring.push({
        source,
        category: detectedCategory,
        frequency,
        avgAmount: Math.round(avgAmount * 100) / 100,
        occurrences: items.length,
        isConsistent,
        avgIntervalDays: Math.round(avgInterval),
        lastDeposit: items[items.length - 1].date,
        nextExpected: this.estimateNextDeposit(items[items.length - 1].date, frequency),
        confidence: isConsistent ? 'high' : 'medium'
      });
    }

    return recurring.sort((a, b) => b.avgAmount - a.avgAmount);
  },

  /**
   * Detect income category from source name
   */
  detectIncomeCategory(source) {
    const sourceLower = (source || '').toLowerCase();
    
    for (const [category, config] of Object.entries(this.RECURRING_PATTERNS)) {
      if (config.keywords.some(k => sourceLower.includes(k))) {
        return category;
      }
    }
    return 'Other Income';
  },

  /**
   * Estimate next deposit date based on frequency
   */
  estimateNextDeposit(lastDate, frequency) {
    const last = new Date(lastDate);
    const next = new Date(last);
    
    switch (frequency) {
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'biweekly':
        next.setDate(next.getDate() + 14);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      default:
        next.setMonth(next.getMonth() + 1);
    }
    
    return next.toISOString();
  },

  /**
   * Auto-detect and suggest recurring income from card deposits
   * Scans transactions for positive amounts that look like income
   */
  async detectIncomeFromTransactions() {
    const { start, end } = this.getYearToDateRange();
    const txs = await window.solvyDB.getTransactionsByDateRange(start, end);
    
    // Look for large positive transactions (deposits/transfers in)
    const deposits = txs.filter(t => {
      const amount = parseFloat(t.amount) || 0;
      return amount > 100; // Significant deposits
    });

    const suggestions = [];
    
    for (const tx of deposits) {
      const category = this.detectIncomeCategory(tx.merchant);
      if (category !== 'Other Income') {
        suggestions.push({
          merchant: tx.merchant,
          category,
          amount: tx.amount,
          date: tx.date,
          suggestion: `Detected ${category} deposit of $${tx.amount}. Add as recurring income?`
        });
      }
    }

    return suggestions;
  },

  // ============================================================================
  // DEBT PAYOFF STRATEGY
  // ============================================================================

  /**
   * Calculate debt payoff strategy
   */
  async getDebtPayoffStrategy() {
    const { start, end } = this.getCurrentMonthRange();
    const prev = this.getPreviousMonthRange();
    
    const [expenseBreakdown, budgetVsActual, incomeBreakdown] = await Promise.all([
      this.getExpenseBreakdown(start, end),
      window.solvyDB.getBudgetVsActual(start, end),
      this.getIncomeBreakdown(start, end)
    ]);

    const debtCategories = ['Debt Payments', 'Credit Card', 'Loan', 'Mortgage'];
    const debts = expenseBreakdown.filter(e => 
      debtCategories.some(dc => e.category.toLowerCase().includes(dc.toLowerCase()))
    );
    
    const totalIncome = incomeBreakdown.reduce((s, i) => s + i.amount, 0);
    const totalDebt = debts.reduce((s, d) => s + d.amount, 0);
    const surplus = totalIncome - expenseBreakdown.reduce((s, e) => s + e.amount, 0);

    // Avalanche method: highest interest first
    // Snowball method: smallest balance first
    const strategies = {
      avalanche: {
        name: 'Avalanche Method',
        description: 'Pay off highest-interest debt first. Saves the most money long-term.',
        priority: debts.sort((a, b) => b.amount - a.amount), // Approximate by payment size
        estimatedMonths: totalDebt > 0 && surplus > 0 ? Math.ceil(totalDebt / surplus) : null
      },
      snowball: {
        name: 'Snowball Method',
        description: 'Pay off smallest debts first. Best for motivation and momentum.',
        priority: debts.sort((a, b) => a.amount - b.amount),
        estimatedMonths: totalDebt > 0 && surplus > 0 ? Math.ceil(totalDebt / surplus) : null
      }
    };

    return {
      totalDebt: Math.round(totalDebt * 100) / 100,
      monthlySurplus: Math.round(surplus * 100) / 100,
      debtToIncomeRatio: totalIncome > 0 ? Math.round((totalDebt / totalIncome) * 100) : 0,
      strategies,
      recommendation: surplus > 0 
        ? `You have $${surplus.toFixed(2)} surplus. Apply this to debt payments.`
        : 'Reduce expenses to create surplus for debt payoff.'
    };
  },

  // ============================================================================
  // SAVINGS RECOMMENDATIONS
  // ============================================================================

  /**
   * Generate personalized savings recommendations
   */
  async getSavingsRecommendations() {
    const { start, end } = this.getCurrentMonthRange();
    const prev = this.getPreviousMonthRange();
    
    const [expenseBreakdown, incomeBreakdown, budgetVsActual] = await Promise.all([
      this.getExpenseBreakdown(start, end),
      this.getIncomeBreakdown(start, end),
      window.solvyDB.getBudgetVsActual(start, end)
    ]);

    const totalIncome = incomeBreakdown.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);
    const surplus = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (surplus / totalIncome) * 100 : 0;

    const recommendations = [];

    // Rule 1: 50/30/20 rule assessment
    const needsCategories = ['Housing', 'Utilities', 'Healthcare', 'Insurance', 'Food', 'Transportation', 'Debt Payments'];
    const wantsCategories = ['Entertainment', 'Shopping', 'Personal Care', 'Dining'];
    
    const needsTotal = expenseBreakdown.filter(e => needsCategories.includes(e.category)).reduce((s, e) => s + e.amount, 0);
    const wantsTotal = expenseBreakdown.filter(e => wantsCategories.includes(e.category)).reduce((s, e) => s + e.amount, 0);
    
    const needsPercent = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : 0;
    const wantsPercent = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : 0;

    if (needsPercent > 50) {
      recommendations.push({
        type: 'needs',
        severity: 'warning',
        message: `Needs are ${needsPercent.toFixed(1)}% of income (target: 50%). Consider reducing housing or utility costs.`,
        actionable: true
      });
    }

    if (wantsPercent > 30) {
      recommendations.push({
        type: 'wants',
        severity: 'info',
        message: `Wants are ${wantsPercent.toFixed(1)}% of income (target: 30%). Opportunity to trim discretionary spending.`,
        actionable: true
      });
    }

    if (savingsRate < 20) {
      recommendations.push({
        type: 'savings',
        severity: 'warning',
        message: `Savings rate is ${savingsRate.toFixed(1)}% (target: 20%).`,
        actionable: true
      });
    } else {
      recommendations.push({
        type: 'savings',
        severity: 'success',
        message: `Great job! Savings rate is ${savingsRate.toFixed(1)}%.`,
        actionable: false
      });
    }

    // Rule 2: Top overspend category
    const overBudget = budgetVsActual.filter(b => b.overBudget);
    if (overBudget.length > 0) {
      recommendations.push({
        type: 'budget',
        severity: 'warning',
        message: `${overBudget[0].category} is over budget by $${Math.abs(overBudget[0].remaining).toFixed(2)}.`,
        actionable: true
      });
    }

    // Rule 3: Emergency fund target
    const monthlyNeeds = needsTotal;
    const emergencyFundTarget = monthlyNeeds * 6;
    
    recommendations.push({
      type: 'emergency',
      severity: 'info',
      message: `Emergency fund target: $${emergencyFundTarget.toFixed(2)} (6 months of needs).`,
      actionable: true
    });

    return {
      savingsRate: Math.round(savingsRate * 100) / 100,
      monthlySurplus: Math.round(surplus * 100) / 100,
      needsPercent: Math.round(needsPercent * 100) / 100,
      wantsPercent: Math.round(wantsPercent * 100) / 100,
      recommendations: recommendations.sort((a, b) => {
        const severityOrder = { warning: 0, info: 1, success: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
    };
  },

  // ============================================================================
  // TAX EXPORT
  // ============================================================================

  /**
   * Export data formatted for tax preparation (anonymized categories only)
   */
  async exportTaxSummary(year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    
    const [incomeBreakdown, expenseBreakdown] = await Promise.all([
      this.getIncomeBreakdown(start, end),
      this.getExpenseBreakdown(start, end)
    ]);

    const totalIncome = incomeBreakdown.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenseBreakdown.reduce((s, e) => s + e.amount, 0);

    return {
      year,
      generatedAt: new Date().toISOString(),
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      incomeByCategory: incomeBreakdown,
      expensesByCategory: expenseBreakdown,
      netIncome: Math.round((totalIncome - totalExpenses) * 100) / 100
    };
  },

  /**
   * Export tax data as CSV
   */
  async exportTaxCSV(year) {
    const summary = await this.exportTaxSummary(year);
    
    let csv = 'SOLVY Tax Export,' + year + '\n';
    csv += 'Generated,' + new Date().toISOString() + '\n\n';
    csv += 'INCOME\n';
    csv += 'Category,Amount\n';
    summary.incomeByCategory.forEach(i => {
      csv += `"${i.category}",${i.amount.toFixed(2)}\n`;
    });
    csv += `Total Income,${summary.totalIncome.toFixed(2)}\n\n`;
    
    csv += 'EXPENSES\n';
    csv += 'Category,Amount\n';
    summary.expensesByCategory.forEach(e => {
      csv += `"${e.category}",${e.amount.toFixed(2)}\n`;
    });
    csv += `Total Expenses,${summary.totalExpenses.toFixed(2)}\n\n`;
    csv += `NET INCOME,${summary.netIncome.toFixed(2)}\n`;
    
    return csv;
  },

  /**
   * Export all transactions for a year as CSV (detailed)
   */
  async exportTransactionsCSV(year) {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31, 23, 59, 59);
    
    const [txs, incomeEntries] = await Promise.all([
      window.solvyDB.getTransactionsByDateRange(start, end),
      window.solvyDB.getIncomeByDateRange(start, end)
    ]);

    let csv = 'Date,Type,Category,Merchant/Source,Amount,Status\n';
    
    // Expenses
    txs.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-US');
      csv += `${date},Expense,"${t.category || 'Other'}","${(t.merchant || '').replace(/"/g, '""')}",${(parseFloat(t.amount) || 0).toFixed(2)},${t.status || 'settled'}\n`;
    });
    
    // Income
    incomeEntries.forEach(i => {
      const date = new Date(i.date).toLocaleDateString('en-US');
      csv += `${date},Income,"${i.category || 'Other'}","${(i.source || '').replace(/"/g, '""')}",${(parseFloat(i.amount) || 0).toFixed(2)},received\n`;
    });

    return csv;
  },

  // ============================================================================
  // AI ANALYSIS
  // ============================================================================

  /**
   * Prepare anonymized data payload for AI analysis (DeepSeek ready)
   * NEVER includes individual transactions - only aggregates
   */
  async prepareAIDataPayload() {
    const { start, end } = this.getCurrentMonthRange();
    const prev = this.getPreviousMonthRange();
    const ytd = this.getYearToDateRange();

    const [
      incomeBreakdown,
      expenseBreakdown,
      budgetVsActual,
      savingsGoals,
      debtStrategy,
      savingsRecs
    ] = await Promise.all([
      this.getIncomeBreakdown(start, end),
      this.getExpenseBreakdown(start, end),
      window.solvyDB.getBudgetVsActual(start, end),
      window.solvyDB.getSavingsGoals(),
      this.getDebtPayoffStrategy(),
      this.getSavingsRecommendations()
    ]);

    // Get previous month for comparison
    const prevExpenses = await this.getExpenseBreakdown(prev.start, prev.end);
    const prevIncome = await this.getIncomeBreakdown(prev.start, prev.end);
    const ytdIncome = await window.solvyDB.getTotalIncome(ytd.start, ytd.end);
    const ytdExpenses = await this.getTotalExpenses(ytd.start, ytd.end);

    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        period: { start: start.toISOString(), end: end.toISOString() },
        dataType: 'anonymized_aggregates',
        version: '2.0'
      },
      financialSummary: {
        totalIncome: incomeBreakdown.reduce((s, i) => s + i.amount, 0),
        totalExpenses: expenseBreakdown.reduce((s, e) => s + e.amount, 0),
        incomeCategories: incomeBreakdown.map(i => ({ category: i.category, amount: i.amount })),
        expenseCategories: expenseBreakdown.map(e => ({ category: e.category, amount: e.amount })),
        budgetPerformance: budgetVsActual.map(b => ({
          category: b.category,
          budgeted: b.budgeted,
          actual: b.actual,
          percentUsed: b.percentUsed
        }))
      },
      trends: {
        previousMonthIncome: prevIncome.reduce((s, i) => s + i.amount, 0),
        previousMonthExpenses: prevExpenses.reduce((s, e) => s + e.amount, 0),
        ytdIncome,
        ytdExpenses,
        incomeCategoriesChange: this.calculateCategoryChanges(prevIncome, incomeBreakdown),
        expenseCategoriesChange: this.calculateCategoryChanges(prevExpenses, expenseBreakdown)
      },
      analysis: {
        debtStrategy: {
          totalDebt: debtStrategy.totalDebt,
          monthlySurplus: debtStrategy.monthlySurplus,
          debtToIncomeRatio: debtStrategy.debtToIncomeRatio
        },
        savings: {
          savingsRate: savingsRecs.savingsRate,
          needsPercent: savingsRecs.needsPercent,
          wantsPercent: savingsRecs.wantsPercent,
          topRecommendations: savingsRecs.recommendations.slice(0, 3)
        }
      },
      goals: savingsGoals.map(g => ({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        percentComplete: g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0,
        deadline: g.deadline
      }))
    };
  },

  /**
   * Calculate month-over-month category changes
   */
  calculateCategoryChanges(prev, current) {
    const changes = {};
    const allCats = new Set([...prev.map(p => p.category), ...current.map(c => c.category)]);
    
    allCats.forEach(cat => {
      const prevAmount = prev.find(p => p.category === cat)?.amount || 0;
      const currAmount = current.find(c => c.category === cat)?.amount || 0;
      changes[cat] = prevAmount > 0 
        ? Math.round(((currAmount - prevAmount) / prevAmount) * 100)
        : currAmount > 0 ? 100 : 0;
    });
    
    return changes;
  },

  /**
   * Send anonymized data to AI analysis endpoint
   * @param {string} analysisType - 'full' | 'debt' | 'savings'
   */
  async requestAIAnalysis(analysisType = 'full') {
    const payload = await this.prepareAIDataPayload();
    
    try {
      const response = await fetch(`/api/budget/ai-analysis?type=${analysisType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-SOLVY-Client': 'PWA-v2.0'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`AI analysis API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[BudgetService] AI analysis request failed:', error);
      return {
        success: false,
        error: error.message,
        offline: true,
        message: 'AI analysis unavailable offline. Your data remains local.',
        fallbackInsights: this.generateLocalInsights(payload, analysisType)
      };
    }
  },

  /**
   * Generate local insights when AI is offline
   */
  generateLocalInsights(payload, type = 'full') {
    const insights = [];
    const s = payload.financialSummary;
    const netFlow = s.totalIncome - s.totalExpenses;
    
    if (type === 'full' || type === 'budget') {
      if (netFlow < 0) {
        insights.push(`⚠️ Negative cash flow: spending $${Math.abs(netFlow).toFixed(2)} more than income.`);
      } else {
        insights.push(`✅ Positive cash flow of $${netFlow.toFixed(2)}.`);
      }
      
      const overBudget = s.budgetPerformance.filter(b => b.percentUsed > 100);
      if (overBudget.length > 0) {
        insights.push(`🚨 ${overBudget.map(b => b.category).join(', ')} over budget.`);
      }
    }
    
    if (type === 'full' || type === 'debt') {
      const debt = payload.analysis.debtStrategy;
      if (debt.totalDebt > 0) {
        insights.push(`💳 Debt: $${debt.totalDebt.toFixed(2)}. Debt-to-income: ${debt.debtToIncomeRatio}%.`);
        if (debt.monthlySurplus > 0) {
          insights.push(`📉 Apply $${debt.monthlySurplus.toFixed(2)} monthly surplus to debt.`);
        }
      }
    }
    
    if (type === 'full' || type === 'savings') {
      const savings = payload.analysis.savings;
      insights.push(`📊 Savings rate: ${savings.savingsRate}%. Needs: ${savings.needsPercent}%, Wants: ${savings.wantsPercent}%.`);
      
      savings.topRecommendations.forEach(r => {
        insights.push(`${r.severity === 'warning' ? '⚠️' : '💡'} ${r.message}`);
      });
    }
    
    return insights.join('\n\n');
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  if (window.solvyDB) {
    BudgetService.init();
  } else {
    // Wait for db.js to load
    window.addEventListener('solvy-db-ready', () => BudgetService.init());
  }
});

// Make available globally
window.BudgetService = BudgetService;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BudgetService };
}
