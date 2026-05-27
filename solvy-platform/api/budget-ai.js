/**
 * SOLVY Budget AI Analysis API
 * Receives anonymized financial aggregates from member devices
 * Routes to DeepSeek (or other AI provider) for insights
 * NEVER stores or logs individual transaction data
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const AI_CONFIG = {
  // DeepSeek API configuration
  PROVIDER: process.env.AI_PROVIDER || 'deepseek',
  API_KEY: process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY,
  API_URL: process.env.DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions',
  MODEL: process.env.AI_MODEL || 'deepseek-chat',
  
  // Rate limiting
  MAX_REQUESTS_PER_HOUR: 10,
  
  // Privacy: never log full payload
  LOG_LEVEL: 'minimal' // 'none', 'minimal', 'verbose'
};

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map();

// ============================================================================
// MIDDLEWARE
// ============================================================================

/**
 * Validate anonymized payload structure
 * Ensures no individual transactions are present
 */
function validatePayload(req, res, next) {
  const payload = req.body;
  
  if (!payload || !payload.metadata || !payload.financialSummary) {
    return res.status(400).json({
      success: false,
      error: 'Invalid payload structure. Expected metadata and financialSummary.'
    });
  }
  
  // Security check: reject if individual transactions detected
  const payloadStr = JSON.stringify(payload);
  const forbiddenPatterns = [
    /"merchant"\s*:/i,
    /"transactionId"\s*:/i,
    /"cardLast4"\s*:/i,
    /"accountNumber"\s*:/i
  ];
  
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(payloadStr)) {
      console.error('[BudgetAI] REJECTED: Payload contains potential individual transaction data');
      return res.status(403).json({
        success: false,
        error: 'Payload rejected: individual transaction data detected. Only anonymized aggregates allowed.'
      });
    }
  }
  
  // Verify dataType marker
  if (payload.metadata.dataType !== 'anonymized_aggregates') {
    return res.status(400).json({
      success: false,
      error: 'Payload must be marked as anonymized_aggregates'
    });
  }
  
  next();
}

/**
 * Rate limiting by member hash
 */
function rateLimit(req, res, next) {
  const memberHash = req.body.financialSummary?.memberHash || req.ip;
  const now = Date.now();
  const windowStart = now - (60 * 60 * 1000); // 1 hour
  
  const requests = rateLimitStore.get(memberHash) || [];
  const recentRequests = requests.filter(t => t > windowStart);
  
  if (recentRequests.length >= AI_CONFIG.MAX_REQUESTS_PER_HOUR) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded. Max 10 AI analysis requests per hour.',
      retryAfter: Math.ceil((requests[0] + 60 * 60 * 1000 - now) / 1000)
    });
  }
  
  recentRequests.push(now);
  rateLimitStore.set(memberHash, recentRequests);
  next();
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/budget/ai-analysis
 * Main endpoint for AI-powered budget insights
 * Query param: ?type=full|debt|savings
 * 
 * Request Body (anonymized aggregates only):
 * {
 *   metadata: { generatedAt, period, dataType, version },
 *   financialSummary: {
 *     totalIncome, totalExpenses,
 *     incomeCategories: [{ category, amount }],
 *     expenseCategories: [{ category, amount }],
 *     budgetPerformance: [{ category, budgeted, actual, percentUsed }]
 *   },
 *   trends: {
 *     previousMonthIncome, previousMonthExpenses, ytdIncome, ytdExpenses,
 *     incomeCategoriesChange: { category: percentChange },
 *     expenseCategoriesChange: { category: percentChange }
 *   },
 *   analysis: {
 *     debtStrategy: { totalDebt, monthlySurplus, debtToIncomeRatio },
 *     savings: { savingsRate, needsPercent, wantsPercent, topRecommendations: [...] }
 *   },
 *   goals: [{ name, targetAmount, currentAmount, percentComplete, deadline }]
 * }
 */
router.post('/ai-analysis', validatePayload, rateLimit, async (req, res) => {
  const payload = req.body;
  const analysisType = req.query.type || 'full';
  
  try {
    // Build prompt for AI analysis based on type
    const prompt = buildAnalysisPrompt(payload, analysisType);
    
    // Call AI provider
    const insights = await callAIProvider(prompt);
    
    // Log minimal metadata (never the financial data)
    if (AI_CONFIG.LOG_LEVEL !== 'none') {
      console.log('[BudgetAI] Analysis completed', {
        timestamp: new Date().toISOString(),
        type: analysisType,
        period: payload.metadata.period,
        categories: payload.financialSummary.expenseCategories.length,
        goals: payload.goals.length
      });
    }
    
    res.json({
      success: true,
      insights: insights,
      type: analysisType,
      provider: AI_CONFIG.PROVIDER,
      generatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[BudgetAI] Analysis failed:', error.message);
    
    // Return fallback insights if AI is unavailable
    const fallbackInsights = generateFallbackInsights(payload, analysisType);
    
    res.status(200).json({
      success: true,
      insights: fallbackInsights,
      provider: 'fallback',
      type: analysisType,
      warning: 'AI service temporarily unavailable. Using local analysis.',
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * GET /api/budget/ai-status
 * Check AI service availability
 */
router.get('/ai-status', async (req, res) => {
  const hasApiKey = !!AI_CONFIG.API_KEY;
  
  res.json({
    available: hasApiKey,
    provider: AI_CONFIG.PROVIDER,
    model: AI_CONFIG.MODEL,
    rateLimit: {
      maxPerHour: AI_CONFIG.MAX_REQUESTS_PER_HOUR,
      currentUsage: req.ip ? (rateLimitStore.get(req.ip) || []).length : 0
    }
  });
});

/**
 * POST /api/budget/tax-prep
 * Receive tax summary for AI-assisted tax preparation
 * Returns tax optimization suggestions
 */
router.post('/tax-prep', validatePayload, async (req, res) => {
  const { year, totalIncome, totalExpenses, incomeByCategory, expensesByCategory } = req.body;
  
  try {
    const prompt = `You are a tax preparation assistant. Analyze this anonymized financial summary for tax year ${year}:

INCOME:
${incomeByCategory.map(i => `- ${i.category}: $${i.amount.toFixed(2)}`).join('\n')}
Total Income: $${totalIncome.toFixed(2)}

EXPENSES:
${expensesByCategory.map(e => `- ${e.category}: $${e.amount.toFixed(2)}`).join('\n')}
Total Expenses: $${totalExpenses.toFixed(2)}

Net Income: $${(totalIncome - totalExpenses).toFixed(2)}

Provide:
1. Estimated tax liability (simplified)
2. Deductible expense categories to highlight
3. Tax optimization suggestions
4. Questions a tax professional should ask

Keep response concise and actionable.`;

    const insights = await callAIProvider(prompt);
    
    res.json({
      success: true,
      taxYear: year,
      insights,
      provider: AI_CONFIG.PROVIDER
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Tax preparation analysis failed',
      details: error.message
    });
  }
});

// ============================================================================
// AI PROVIDER INTEGRATION
// ============================================================================

async function callAIProvider(prompt) {
  if (!AI_CONFIG.API_KEY) {
    throw new Error('AI API key not configured');
  }
  
  const response = await fetch(AI_CONFIG.API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.API_KEY}`
    },
    body: JSON.stringify({
      model: AI_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are SOLVY Accounting AI, a financial intelligence assistant for cooperative members. Provide clear, actionable budget insights. Use emojis for readability. Never ask for personal information. Focus on spending patterns, budget optimization, and wealth building.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })
  });
  
  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No insights generated.';
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

function buildAnalysisPrompt(payload, type) {
  const { financialSummary, trends, analysis, goals } = payload;
  
  const netFlow = financialSummary.totalIncome - financialSummary.totalExpenses;
  const savingsRate = financialSummary.totalIncome > 0 
    ? ((netFlow / financialSummary.totalIncome) * 100).toFixed(1) 
    : 0;
  
  let prompt = '';

  if (type === 'debt') {
    prompt = buildDebtPrompt(financialSummary, analysis.debtStrategy, goals);
  } else if (type === 'savings') {
    prompt = buildSavingsPrompt(financialSummary, analysis.savings, goals);
  } else {
    // Full analysis
    prompt = `Analyze this member's anonymized financial summary and provide 3-5 actionable insights:

📊 MONTHLY SNAPSHOT:
• Total Income: $${financialSummary.totalIncome.toFixed(2)}
• Total Expenses: $${financialSummary.totalExpenses.toFixed(2)}
• Net Cash Flow: $${netFlow.toFixed(2)} (${netFlow >= 0 ? '+' : ''}${savingsRate}% savings rate)
• YTD Income: $${trends.ytdIncome?.toFixed(2) || 'N/A'}
• YTD Expenses: $${trends.ytdExpenses?.toFixed(2) || 'N/A'}

💰 INCOME BREAKDOWN:
${financialSummary.incomeCategories.map(i => `• ${i.category}: $${i.amount.toFixed(2)}`).join('\n')}

💸 EXPENSE BREAKDOWN:
${financialSummary.expenseCategories.map(e => `• ${e.category}: $${e.amount.toFixed(2)}`).join('\n')}

📈 BUDGET PERFORMANCE:
${financialSummary.budgetPerformance.map(b => `• ${b.category}: ${b.percentUsed}% of $${b.budgeted.toFixed(2)} budget`).join('\n')}

📉 MONTH-OVER-MONTH TRENDS:
• Income change: ${trends.incomeCategoriesChange >= 0 ? '+' : ''}${trends.incomeCategoriesChange}%
• Expense change: ${trends.expenseCategoriesChange >= 0 ? '+' : ''}${trends.expenseCategoriesChange}%

💳 DEBT OVERVIEW:
• Total Debt Payments: $${analysis.debtStrategy.totalDebt.toFixed(2)}
• Monthly Surplus: $${analysis.debtStrategy.monthlySurplus.toFixed(2)}
• Debt-to-Income: ${analysis.debtStrategy.debtToIncomeRatio}%

📊 SAVINGS ANALYSIS:
• Savings Rate: ${analysis.savings.savingsRate}%
• Needs: ${analysis.savings.needsPercent}%, Wants: ${analysis.savings.wantsPercent}%
`;

    if (goals && goals.length > 0) {
      prompt += `\n🎯 SAVINGS GOALS:\n`;
      goals.forEach(g => {
        prompt += `• ${g.name}: ${g.percentComplete}% complete ($${g.currentAmount.toFixed(2)}/$${g.targetAmount.toFixed(2)})\n`;
      });
    }

    prompt += `\nProvide insights on:
1. Overall financial health assessment
2. Specific budget categories needing attention
3. Debt management suggestions
4. Savings rate optimization
5. Goal achievement timeline
6. One actionable recommendation for this month

Keep response under 400 words, use emojis, and be encouraging but honest.`;
  }

  return prompt;
}

function buildDebtPrompt(financialSummary, debtStrategy, goals) {
  const debtCategories = financialSummary.expenseCategories.filter(e => 
    ['Debt Payments', 'Credit Card', 'Loan', 'Mortgage'].some(dc => 
      e.category.toLowerCase().includes(dc.toLowerCase())
    )
  );

  let prompt = `Provide a debt payoff strategy based on this anonymized financial data:

💳 CURRENT DEBT:
${debtCategories.map(d => `• ${d.category}: $${d.amount.toFixed(2)}/month`).join('\n') || '• No categorized debt payments found'}
• Total Monthly Debt: $${debtStrategy.totalDebt.toFixed(2)}
• Debt-to-Income Ratio: ${debtStrategy.debtToIncomeRatio}%

📊 CASH FLOW:
• Total Income: $${financialSummary.totalIncome.toFixed(2)}
• Total Expenses: $${financialSummary.totalExpenses.toFixed(2)}
• Monthly Surplus: $${debtStrategy.monthlySurplus.toFixed(2)}

Provide:
1. Avalanche vs Snowball method recommendation
2. How much to allocate to debt payoff monthly
3. Estimated payoff timeline
4. One actionable step to reduce debt faster
5. Warning signs to watch for

Keep under 300 words. Be direct and actionable.`;

  return prompt;
}

function buildSavingsPrompt(financialSummary, savings, goals) {
  let prompt = `Provide savings recommendations based on this anonymized financial data:

📊 CURRENT SAVINGS METRICS:
• Savings Rate: ${savings.savingsRate}%
• Needs: ${savings.needsPercent}%, Wants: ${savings.wantsPercent}%
• Total Income: $${financialSummary.totalIncome.toFixed(2)}
• Total Expenses: $${financialSummary.totalExpenses.toFixed(2)}

🎯 GOALS:
${goals.map(g => `• ${g.name}: ${g.percentComplete}% of $${g.targetAmount.toFixed(2)}`).join('\n') || '• No active savings goals'}

TOP RECOMMENDATIONS FROM ANALYSIS:
${savings.topRecommendations.map(r => `• [${r.severity}] ${r.message}`).join('\n')}

Provide:
1. Realistic savings rate target for this member
2. Which expense category to reduce first
3. Emergency fund target and timeline
4. Goal prioritization strategy
5. One habit to build this month

Keep under 300 words. Encouraging tone.`;

  return prompt;
}

// ============================================================================
// FALLBACK INSIGHTS (when AI is unavailable)
// ============================================================================

function generateFallbackInsights(payload, type) {
  const { financialSummary, analysis } = payload;
  const netFlow = financialSummary.totalIncome - financialSummary.totalExpenses;
  const insights = [];
  
  if (type === 'full' || type === 'budget') {
    if (netFlow > 0) {
      insights.push(`✅ **Positive Cash Flow**: You're earning $${netFlow.toFixed(2)} more than you spend. Maintain this surplus to build wealth.`);
    } else {
      insights.push(`⚠️ **Negative Cash Flow**: Spending exceeds income by $${Math.abs(netFlow).toFixed(2)}. Review discretionary expenses immediately.`);
    }
    
    const overBudget = financialSummary.budgetPerformance.filter(b => b.percentUsed > 100);
    if (overBudget.length > 0) {
      insights.push(`🚨 **Over Budget**: ${overBudget.map(b => b.category).join(', ')} exceeded limits.`);
    }
  }
  
  if (type === 'full' || type === 'debt') {
    const debt = analysis.debtStrategy;
    if (debt.totalDebt > 0) {
      insights.push(`💳 **Debt**: $${debt.totalDebt.toFixed(2)} monthly. DTI: ${debt.debtToIncomeRatio}%.`);
      if (debt.monthlySurplus > 0) {
        insights.push(`📉 Apply $${debt.monthlySurplus.toFixed(2)} surplus to highest-interest debt first (Avalanche method).`);
      }
    }
  }
  
  if (type === 'full' || type === 'savings') {
    const sav = analysis.savings;
    insights.push(`📊 **Savings Rate**: ${sav.savingsRate}%. Needs ${sav.needsPercent}%, Wants ${sav.wantsPercent}%.`);
    if (sav.savingsRate < 20) {
      insights.push(`💡 Target 20% savings rate. Trim discretionary spending in Entertainment or Shopping.`);
    }
  }
  
  return insights.join('\n\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = router;
