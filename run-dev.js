import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🚀 Starting BuySmart Monorepo (Backend API + Frontend)...");

const isWin = process.platform === "win32";
const npmCmd = isWin ? "npm.cmd" : "npm";

const backend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "backend"),
  shell: isWin,
});

backend.stdout?.on("data", (data) => {
  process.stdout.write(`[backend] ${data}`);
});
backend.stderr?.on("data", (data) => {
  process.stderr.write(`[backend] ${data}`);
});

const frontend = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(__dirname, "frontend"),
  shell: isWin,
});

frontend.stdout?.on("data", (data) => {
  process.stdout.write(`[frontend] ${data}`);
});
frontend.stderr?.on("data", (data) => {
  process.stderr.write(`[frontend] ${data}`);
});

const cleanup = () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

