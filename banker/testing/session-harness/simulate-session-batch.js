/* eslint-disable no-console */
const path = require("path");
const fs = require("fs/promises");
const { chromium } = require("playwright");

const BANK_URL = "http://localhost:3000";
const FRAUD_SESSIONS_API = "http://localhost:3001/api/fraud/sessions";

function runLabel() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  const sec = String(now.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}-${hh}${min}${sec}`;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function waitFor(conditionFn, options = {}) {
  const timeoutMs = options.timeoutMs ?? 25_000;
  const intervalMs = options.intervalMs ?? 700;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const value = await conditionFn();
    if (value) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(options.message ?? "Timed out waiting for condition.");
}

async function fetchFraudSessions() {
  const response = await fetch(FRAUD_SESSIONS_API, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch sessions from ${FRAUD_SESSIONS_API}.`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload)) {
    throw new Error("Fraud sessions API did not return an array.");
  }

  return payload;
}

async function waitForNewSession(seenSessionIds, scenarioName) {
  return waitFor(async () => {
    const sessions = await fetchFraudSessions();
    const newest = sessions.find((session) => !seenSessionIds.has(session.sessionId));
    return newest ?? null;
  }, {
    timeoutMs: 35_000,
    intervalMs: 1_000,
    message: `No new session detected after ${scenarioName}.`
  });
}

async function enableMonitoring(page) {
  await page.goto(BANK_URL, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Save preference" }).click();
  await page.waitForTimeout(500);
}

async function gotoTransfer(page) {
  await page.locator('[data-telemetry-id="nav-transfer"]').first().click();
  await page.waitForURL("**/transfer");
  await page.waitForTimeout(350);
}

async function gotoActivity(page) {
  await page.locator('[data-telemetry-id="nav-activity"]').first().click();
  await page.waitForURL("**/activity");
  await page.waitForTimeout(500);
}

async function submitTransfer(page, options) {
  const amountInput = page.locator('input[data-telemetry-field="amount"]');
  await amountInput.click();
  await page.keyboard.type(options.amount, { delay: 10 });

  if (options.noteText) {
    const note = page.locator('textarea[data-telemetry-field="note"]');
    await note.click();
    await page.keyboard.type(options.noteText, { delay: 12 });
  }

  if (options.preReviewWaitMs > 0) {
    await page.waitForTimeout(options.preReviewWaitMs);
  }

  await page.locator('[data-telemetry-id="transfer-review"]').click();

  if (options.reviewWaitMs > 0) {
    await page.waitForTimeout(options.reviewWaitMs);
  }

  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Submit Transfer" }).click();

  await waitFor(async () => {
    const count = await page.locator("text=Transfer complete").first().count();
    return count > 0 ? true : null;
  }, {
    timeoutMs: 12_000,
    intervalMs: 500,
    message: "Transfer did not complete."
  });
}

async function doErraticMouse(page) {
  let x = 330;
  let y = 410;
  await page.mouse.move(x, y);

  for (let i = 0; i < 36; i += 1) {
    x += i % 2 === 0 ? 180 : -180;
    y += i % 4 < 2 ? 120 : -120;
    await page.mouse.move(x, y);
    await page.waitForTimeout(90);
  }
}

async function doRapidNavigation(page) {
  const sequence = ["accounts", "transfer", "activity", "transfer"];
  for (const name of sequence) {
    await page.locator(`[data-telemetry-id="nav-${name}"]`).first().click();
    await page.waitForTimeout(220);
  }
  await page.waitForURL("**/transfer");
}

async function doHesitationBursts(page) {
  const note = page.locator('textarea[data-telemetry-field="note"]');
  await note.click();
  for (const value of ["a", "ab", "abc", "abcd"]) {
    await note.fill(value);
    await page.waitForTimeout(1_750);
  }
}

async function runScenario(browser, scenario, outputDir) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: outputDir,
      size: { width: 1280, height: 720 }
    }
  });
  const page = await context.newPage();
  const videoHandle = page.video();

  try {
    await enableMonitoring(page);
    await scenario.flow(page);
    await gotoActivity(page);

    const screenshotPath = path.join(outputDir, `${scenario.name}-activity.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await context.close();

    const rawVideoPath = await videoHandle.path();
    const finalVideoPath = path.join(outputDir, `${scenario.name}.webm`);
    await fs.copyFile(rawVideoPath, finalVideoPath);

    return {
      screenshotPath,
      videoPath: finalVideoPath
    };
  } catch (error) {
    await context.close();
    throw error;
  }
}

function defineScenarios() {
  return [
    {
      name: "normal-01",
      target: "unflagged",
      flow: async (page) => {
        await gotoTransfer(page);
        await page.waitForTimeout(1_000);
        await submitTransfer(page, {
          amount: "10",
          noteText: "routine transfer",
          preReviewWaitMs: 8_500,
          reviewWaitMs: 6_500
        });
      }
    },
    {
      name: "normal-02",
      target: "unflagged",
      flow: async (page) => {
        await gotoTransfer(page);
        await page.waitForTimeout(1_200);
        await submitTransfer(page, {
          amount: "10",
          noteText: "monthly transfer",
          preReviewWaitMs: 9_000,
          reviewWaitMs: 6_000
        });
      }
    },
    {
      name: "flagged-01",
      target: "flagged",
      flow: async (page) => {
        await gotoTransfer(page);
        await doRapidNavigation(page);
        await doErraticMouse(page);
        await doHesitationBursts(page);
        await submitTransfer(page, {
          amount: "10",
          noteText: "",
          preReviewWaitMs: 0,
          reviewWaitMs: 800
        });
      }
    },
    {
      name: "flagged-02",
      target: "flagged",
      flow: async (page) => {
        await gotoTransfer(page);
        await doRapidNavigation(page);
        await doErraticMouse(page);
        await doHesitationBursts(page);
        await submitTransfer(page, {
          amount: "10",
          noteText: "",
          preReviewWaitMs: 0,
          reviewWaitMs: 600
        });
      }
    }
  ];
}

function toSessionSummary(session, artifacts, scenario) {
  return {
    scenario: scenario.name,
    target: scenario.target,
    sessionId: session.sessionId,
    score: session.summary.currentRiskScore,
    status: session.summary.status,
    topFlags: session.summary.topFlags,
    reasonCodes: session.summary.reasonCodes,
    videoPath: artifacts.videoPath,
    activityScreenshotPath: artifacts.screenshotPath
  };
}

function countFlagged(sessions) {
  const alertFlagged = sessions.filter((item) => item.score >= 30).length;
  const highRisk = sessions.filter((item) => item.status === "High Risk").length;
  const normal = sessions.filter((item) => item.status === "Normal").length;
  const watch = sessions.filter((item) => item.status === "Watch").length;

  return { alertFlagged, highRisk, normal, watch };
}

async function main() {
  const scenarios = defineScenarios();
  const batchId = runLabel();
  const runDir = path.join(process.cwd(), "testing", "session-harness", "latest");
  await ensureDir(runDir);
  const existing = await fs.readdir(runDir).catch(() => []);
  await Promise.all(
    existing.map((entry) => fs.rm(path.join(runDir, entry), { recursive: true, force: true }))
  );

  const initialSessions = await fetchFraudSessions();
  const seenSessionIds = new Set(initialSessions.map((session) => session.sessionId));

  const browser = await chromium.launch({ headless: true });
  const completed = [];

  try {
    for (const scenario of scenarios) {
      const artifacts = await runScenario(browser, scenario, runDir);
      const session = await waitForNewSession(seenSessionIds, scenario.name);
      seenSessionIds.add(session.sessionId);
      completed.push(toSessionSummary(session, artifacts, scenario));
    }
  } finally {
    await browser.close();
  }

  const allSessions = await fetchFraudSessions();
  const addedSessionIds = new Set(completed.map((item) => item.sessionId));
  const cumulativeSummary = countFlagged(allSessions.map((session) => ({
    score: session.summary.currentRiskScore,
    status: session.summary.status
  })));
  const batchSummary = countFlagged(completed);

  const report = {
    generatedAt: new Date().toISOString(),
    batchId,
    runDir,
    totalsBeforeRun: initialSessions.length,
    totalsAfterRun: allSessions.length,
    addedSessionCount: completed.length,
    batchSummary,
    cumulativeSummary,
    sessions: completed,
    allNewSessionIds: [...addedSessionIds]
  };

  const reportPath = path.join(runDir, "report.json");
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
