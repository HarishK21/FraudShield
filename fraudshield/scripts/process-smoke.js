const fs = require('fs');
const path = require('path');

const reportPath = 'c:/Users/light/OneDrive/Documents/GitHub/GenAIGenesis2026/banker/testing/session-harness/latest/report.json';
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

console.log('aiAssessedSessions (from report):', report.monitoring.modelComparison.aiAssessedSessions);

async function processSmoke() {
  for (const s of report.sessions) {
    if (!s.sessionId) continue;
    
    const body = {
      sessionId: s.sessionId,
      outcome: s.expectedFlagged ? 'fraud' : 'legit',
      analystDecision: s.expectedFlagged ? 'Escalated' : 'Safe',
      analystNotes: 'Automated smoke test feedback',
      assignedTo: 'Test Agent'
    };
    
    const res = await fetch('http://localhost:3001/api/fraud/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    console.log(`Posted feedback for ${s.sessionId}: ${res.status}`);
  }
  
  // Re-fetch metrics for the runId
  const metricsRes = await fetch('http://localhost:3001/api/fraud/metrics?testRunId=run-ai-smoke');
  const metricsData = await metricsRes.json();
  
  console.log('--- RE-FETCHED METRICS ---');
  console.log(JSON.stringify({
    evaluatedLabeledSessions: metricsData.modelComparison.evaluatedLabeledSessions,
    rulesOnly: metricsData.modelComparison.rulesOnly,
    rulesPlusAi: metricsData.modelComparison.rulesPlusAi,
    uplift: metricsData.modelComparison.uplift,
    latencyMs: metricsData.modelComparison.latencyMs
  }, null, 2));
}

processSmoke().catch(console.error);
