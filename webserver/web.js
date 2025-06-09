import express from "express";
import { exec, spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

let serverProcess = null;

// 🔧 CONFIGURE YOUR LOCAL PATH TO THE CLONED REPO
const LOCAL_REPO_DIR = "/Users/vasanth/Vasanth Doucuments/GitHub/Demo_App";
const APP_FILE = "app.js";

// Utility to run shell commands
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error(stderr || error.message);
        reject(stderr || error.message);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Deployment logic
async function deployApp(res) {
  try {
    // Stop old server
    if (serverProcess) {
      serverProcess.kill();
      console.log("🛑 Stopped previous app.js server");
    }

    // Pull latest code
    console.log("⬇️ Pulling latest code from GitHub...");
    const gitOutput = await runCommand("git pull origin main", LOCAL_REPO_DIR);
    console.log("✅ Git Pull Output:\n", gitOutput);

    // Start new server
    console.log("🚀 Starting app.js server...");
    serverProcess = spawn("node", [APP_FILE], {
      cwd: LOCAL_REPO_DIR,
      stdio: "inherit",
    });

    res.json({ message: "✅ App redeployed successfully." });
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    res.status(500).json({ error: "Deployment failed", details: error });
  }
}

// GitHub webhook handler
app.post("/webhook", async (req, res) => {
  console.log("📬 Webhook received from GitHub...");
  await deployApp(res);
});

// Root endpoint
app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🌐 Webhook listener running at http://localhost:${PORT}`);
});
