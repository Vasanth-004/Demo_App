import express from "express";
import { exec,spawn } from "child_process";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

let serverProcess = null;



const APP_FILE = "app.js";
const GIT_REPO_PATH = "https://github.com/Vasanth-004/Demo_App.git"; // Adjust if different

// Utility to run shell commands
function runCommand(command, cwd = "https://github.com/Vasanth-004/Demo_App.git") {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
}

// Step-by-step deployment logic
async function deployApp(res) {
  try {
    // Step 1: Kill old server
    if (serverProcess) {
      serverProcess.kill();
      console.log("Stopped previous app.js server");
    }

    // Step 2: Pull latest from Git
    console.log("Pulling latest code...");
    const gitOutput = await runCommand("git pull origin main", "/Users/vasanth/Vasanth Doucuments/GitHub/project/appserver/app.js");
    console.log("Git Pull Output:\n", gitOutput);

    // Step 3: Restart the app.js server
    console.log("Starting new app.js server...");
    serverProcess = spawn("node", [APP_FILE], { cwd: APP_DIR, stdio: "inherit" });

    res.json({ message: "App redeployed successfully." });
  } catch (error) {
    console.error("Deployment failed:", error);
    res.status(500).json({ error: "Deployment failed", details: error });
  }
}

// GitHub webhook handler (POST /webhook)
app.post("/webhook", async (req, res) => {
  console.log("Webhook received from GitHub...");
  
  await deployApp(res);
});

// Root check
app.get("/", (req, res) => {
  res.send("Webhook server is running!");
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Webhook listener running on http://localhost:${PORT}`);
});
