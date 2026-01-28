
// man-page-server.js - Serves the MAN Page API and Legal Framework
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// For ES modules to know the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002; // Dedicated port for MAN page services

// ========================================
// CONFIGURATION
// ========================================
const ALLOCATION = { OPERATIONS_PCT: 70, MEMBER_POOL_PCT: 20, RESERVE_PCT: 10 };

// ========================================
// 1. API ENDPOINT: Financial Data (From Previous Code)
// ========================================
app.get('/api/financials', async (req, res) => {
  try {
    // --- MOCK DATA SECTION: REPLACE WITH REAL LOGIC ---
    const totalRevenue = 10000; // Get from your database/Unit.co
    const members = [ // Get from Unit.co API
      { memberId: 'member_001', name: 'Evergreen Beauty Lounge', transactionVolume: 5000 },
      { memberId: 'member_002', name: 'Local Cafe Co-op', transactionVolume: 3000 },
      { memberId: 'member_003', name: 'Tech Freelancer LLC', transactionVolume: 2000 }
    ];
    // --- END MOCK DATA ---

    // Calculate funds
    const operationsFund = totalRevenue * (ALLOCATION.OPERATIONS_PCT / 100);
    const memberPool = totalRevenue * (ALLOCATION.MEMBER_POOL_PCT / 100);
    const reserveFund = totalRevenue * (ALLOCATION.RESERVE_PCT / 100);

    // Calculate member shares
    const totalVolume = members.reduce((sum, m) => sum + m.transactionVolume, 0);
    const membersWithShares = members.map(member => ({
      ...member,
      shareRatio: ((member.transactionVolume / totalVolume) * 100).toFixed(2) + '%',
      shareAmount: (memberPool * (member.transactionVolume / totalVolume)).toFixed(2)
    }));

    res.json({
      period: new Date().toISOString().slice(0, 7), // YYYY-MM
      allocation: ALLOCATION,
      totals: { totalRevenue, operationsFund, memberPool, reserveFund },
      members: membersWithShares,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Financial API Error:', error);
    res.status(500).json({ error: 'Failed to generate financial data' });
  }
});

// ========================================
// 2. WEB PAGE ENDPOINT: Legal Framework
// ========================================
app.get('/legal', async (req, res) => {
  try {
    // Read the Legal.md file
    const legalMarkdown = await fs.readFile(path.join(__dirname, 'public/Legal.md'), 'utf-8');

    // Convert Markdown to HTML and send as a simple page
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SOLVY Cooperative - Legal Framework</title>
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>mermaid.initialize({startOnLoad:true});</script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
        header { border-bottom: 2px solid #4F46E5; padding-bottom: 1rem; margin-bottom: 2rem; }
        h1 { color: #4F46E5; }
        h2 { border-bottom: 1px solid #eaeaea; padding-bottom: 0.5rem; margin-top: 2rem; }
        code { background: #f5f5f5; padding: 0.2em 0.4em; border-radius: 3px; font-family: monospace; }
        .mermaid { background: #f9f9f9; padding: 1rem; border-radius: 5px; margin: 1.5rem 0; text-align: center; }
        .disclaimer { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 1rem; margin: 2rem 0; }
        footer { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eaeaea; font-size: 0.9em; color: #666; text-align: center; }
    </style>
</head>
<body>
    <header>
        <h1>SOLVY Cooperative: Legal & Governance Framework</h1>
        <p><strong>Status:</strong> Draft for Counsel Review | <strong>Version:</strong> 1.0</p>
    </header>

    <div class="disclaimer">
        <strong>⚠️ Disclaimer:</strong> This document outlines a proposed legal and financial structure. It is a draft framework intended solely to facilitate detailed review and formalization with qualified legal counsel. It does not constitute binding legal advice or a final agreement.
    </div>

    <div id="legal-content">
        ${legalMarkdown}
    </div>

    <footer>
        <p>Document maintained by SA Nathan LLC. | Part of the SOLVY Mandatory Audit Network (MAN)</p>
        <p><a href="/">Back to MAN Dashboard</a></p>
    </footer>
</body>
</html>
    `;

    res.send(htmlContent);
  } catch (error) {
    console.error('Legal Page Error:', error);
    res.status(500).send('<h1>Error Loading Legal Framework</h1><p>The document is temporarily unavailable.</p>');
  }
});

// ========================================
// 3. Serve Static Files (CSS, JS, Images)
// ========================================
app.use(express.static(path.join(__dirname, 'public')));

// Start the server
app.listen(PORT, () => {
  console.log(`MAN Page Server running on port ${PORT}`);
  console.log(`-> Financial API: http://localhost:${PORT}/api/financials`);
  console.log(`-> Legal Page: http://localhost:${PORT}/legal`);
});
