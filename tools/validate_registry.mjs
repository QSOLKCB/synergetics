import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../data/data.bundle.js", import.meta.url), "utf8");
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: "data/data.bundle.js" });

const data = context.window.SYNERGETICS_DATA;
const fail = (message) => {
  console.error(`VALIDATION ERROR: ${message}`);
  process.exitCode = 1;
};

if (!data || !Array.isArray(data.parameters) || !Array.isArray(data.relations)) {
  fail("window.SYNERGETICS_DATA must contain parameters and relations arrays");
  process.exit();
}

const namespaces = new Set(["fuller", "qsol", "thorne", "hawken", "buddhist", "shared"]);
const classifications = new Set(["EXACT", "STRUCTURAL", "FUNCTIONAL", "ANALOGICAL", "HYPOTHETICAL", "REJECTED"]);
const evidenceCodes = new Set(["P", "R", "D", "E", "H"]);
const parameterIds = new Set();
const relationIds = new Set();

for (const parameter of data.parameters) {
  if (!parameter.id || parameterIds.has(parameter.id)) fail(`duplicate or missing parameter id: ${parameter.id}`);
  parameterIds.add(parameter.id);
  if (!namespaces.has(parameter.namespace)) fail(`unknown namespace for ${parameter.id}: ${parameter.namespace}`);
  if (!parameter.label || !parameter.definition) fail(`parameter ${parameter.id} needs label and definition`);
  if (!Array.isArray(parameter.domains) || parameter.domains.length === 0) fail(`parameter ${parameter.id} needs domains`);
  if (!Array.isArray(parameter.source_refs) || parameter.source_refs.length === 0) fail(`parameter ${parameter.id} needs source_refs`);
  for (const code of parameter.evidence_status || []) if (!evidenceCodes.has(code)) fail(`invalid evidence code ${code} on ${parameter.id}`);
}

for (const relation of data.relations) {
  if (!relation.id || relationIds.has(relation.id)) fail(`duplicate or missing relation id: ${relation.id}`);
  relationIds.add(relation.id);
  if (!parameterIds.has(relation.from) || !parameterIds.has(relation.to)) fail(`orphan relation ${relation.id}: ${relation.from} -> ${relation.to}`);
  if (!classifications.has(relation.classification)) fail(`invalid class on ${relation.id}: ${relation.classification}`);
  if (!relation.rationale || !relation.falsification) fail(`relation ${relation.id} needs rationale and falsification`);
  for (const key of ["evidence_status", "preserves", "transforms", "discards"]) {
    if (!Array.isArray(relation[key])) fail(`relation ${relation.id} needs array ${key}`);
  }
  for (const code of relation.evidence_status || []) if (!evidenceCodes.has(code)) fail(`invalid evidence code ${code} on ${relation.id}`);

  const fromNs = relation.from.split(".")[0];
  const toNs = relation.to.split(".")[0];
  if (relation.classification !== "REJECTED" && fromNs !== "shared" && toNs !== "shared") {
    fail(`non-rejected cross-station relation ${relation.id} must pass through a shared signal`);
  }
  if (relation.classification === "REJECTED" && relation.status !== "rejected") {
    fail(`rejected relation ${relation.id} must have status rejected`);
  }
}

for (const station of ["fuller", "qsol", "thorne", "hawken", "buddhist"]) {
  if (!data.parameters.some((parameter) => parameter.namespace === station)) fail(`missing station namespace: ${station}`);
  if (!data.relations.some((relation) => relation.classification !== "REJECTED" && (relation.from.startsWith(`${station}.`) || relation.to.startsWith(`${station}.`)))) {
    fail(`station ${station} has no usable mappings`);
  }
}

const coverage = new Map();
for (const relation of data.relations) {
  if (relation.classification === "REJECTED") continue;
  const sharedId = relation.from.startsWith("shared.") ? relation.from : relation.to.startsWith("shared.") ? relation.to : null;
  const stationId = relation.from.startsWith("shared.") ? relation.to : relation.from;
  if (!sharedId) continue;
  const station = stationId.split(".")[0];
  if (!coverage.has(sharedId)) coverage.set(sharedId, new Set());
  coverage.get(sharedId).add(station);
}

const fullCoverageSignals = [...coverage.entries()].filter(([, stations]) => ["fuller", "qsol", "thorne", "hawken", "buddhist"].every((station) => stations.has(station)));
if (fullCoverageSignals.length === 0) fail("registry must contain at least one shared signal mapped to all five stations");

if (!process.exitCode) {
  console.log(`Registry valid: ${data.parameters.length} parameters, ${data.relations.length} relations, ${fullCoverageSignals.length} five-station signals.`);
}
