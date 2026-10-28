import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

// Each suite owns its Node loader hooks; isolate them in normal Node processes.
let failed = 0;
const files = readdirSync(new URL("./tests/", import.meta.url))
  .filter((name) => name.endsWith(".test.mjs"))
  .sort();
for (const file of files) {
  const result = spawnSync(
    process.execPath,
    [
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      fileURLToPath(new URL(`./tests/${file}`, import.meta.url)),
    ],
    { stdio: "inherit" },
  );
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) failed++;
}
console.log(`${files.length} test suites, ${failed} failed.`);
process.exitCode = failed ? 1 : 0;
