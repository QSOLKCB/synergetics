import fs from "node:fs";

const source = fs.readFileSync(new URL("../js/app.js", import.meta.url), "utf8");
const forbidden = [
  [/(?:\.|\[\s*["'])innerHTML(?:["']\s*\])?\s*=/u, "innerHTML assignment"],
  [/(?:\.|\[\s*["'])outerHTML(?:["']\s*\])?\s*=/u, "outerHTML assignment"],
  [/insertAdjacentHTML\s*\(/u, "insertAdjacentHTML"],
  [/document\.write(?:ln)?\s*\(/u, "document.write"],
  [/\beval\s*\(/u, "eval"],
  [/\bnew\s+Function\s*\(/u, "new Function"]
];

const failures = forbidden.filter(([pattern]) => pattern.test(source)).map(([, label]) => label);
if (failures.length) {
  console.error(`CLIENT SECURITY ERROR: forbidden DOM/code sinks found: ${failures.join(", ")}`);
  process.exit(1);
}

console.log("Client security guard valid: no forbidden HTML or dynamic-code sinks.");
