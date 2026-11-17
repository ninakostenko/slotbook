// Runs Vitest with the drive letter in upper case (c:\ -> C:\).
// VS Code on Windows opens terminals at "c:\...". Vitest then loads itself
// twice, once per spelling of the path, and every test fails with
// "Cannot read properties of undefined (reading 'config')".
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";

const upperDrive = (p) => p.replace(/^[a-z]:/, (drive) => drive.toUpperCase());

const cwd = upperDrive(process.cwd());
const vitest = path.join(cwd, "node_modules", "vitest", "vitest.mjs");
createRequire(import.meta.url).resolve("vitest/package.json"); // fail early if not installed

const result = spawnSync(process.execPath, [vitest, ...process.argv.slice(2)], {
  cwd,
  stdio: "inherit",
});
process.exit(result.status ?? 1);
