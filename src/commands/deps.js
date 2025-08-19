import fs from "fs";
import path from "path";
import { copyToClipboard } from "../utils/clipboard.js";

export async function runDeps() {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = {
    dependencies: pkg.dependencies || {},
    devDependencies: pkg.devDependencies || {}
  };

  const formatted = `\n\n### package.json dependencies\n\`\`\`json\n${JSON.stringify(deps, null, 2)}\n\`\`\``;

  console.log(formatted);
  copyToClipboard(formatted);
  console.log("\n✅ Dependencies copied to clipboard!");
}
