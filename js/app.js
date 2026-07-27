(() => {
  "use strict";

  const data = window.SYNERGETICS_DATA;
  const $ = (id) => document.getElementById(id);

  function htmlEl(name, attrs = {}, text = null) {
    const node = document.createElement(name);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") node.className = String(value);
      else node.setAttribute(key, String(value));
    }
    if (text !== null) node.textContent = String(text);
    return node;
  }

  function renderRegistryError() {
    const main = htmlEl("main");
    main.append(
      htmlEl("h1", {}, "Registry load failed"),
      htmlEl("p", {}, "Expected data/data.bundle.js.")
    );
    document.body.replaceChildren(main);
  }

  if (!data || !Array.isArray(data.parameters) || !Array.isArray(data.relations)) {
    renderRegistryError();
    return;
  }

  const svg = $("atlas");
  const fieldSvg = $("triangulation");
  const detail = $("detailPanel");
  const crosswalk = $("crosswalkBody");
  const modeSelect = $("modeSelect");
  const searchInput = $("searchInput");
  const seedInput = $("seedInput");
  const fieldMode = $("fieldMode");
  const namespaceInputs = [...document.querySelectorAll('input[name="namespace"]')];
  const stationToggles = [...document.querySelectorAll(".station-toggle")];
  const stationNames = ["fuller", "qsol", "thorne", "hawken", "buddhist"];
  const stationSelects = Object.fromEntries(stationNames.map((name) => [name, $(`${name}Select`)]));
  const parameterById = new Map(data.parameters.map((item) => [item.id, item]));
  const sharedParameters = data.parameters.filter((item) => item.namespace === "shared");
  const strictClasses = new Set(["EXACT", "STRUCTURAL", "FUNCTIONAL"]);
  const sandboxClasses = new Set([...strictClasses, "ANALOGICAL", "HYPOTHETICAL"]);
  const classWeight = { EXACT: 1, STRUCTURAL: 0.9, FUNCTIONAL: 0.72, ANALOGICAL: 0.45, HYPOTHETICAL: 0.25, REJECTED: 0 };
  const namespaceOrder = ["fuller", "qsol", "thorne", "shared", "hawken", "buddhist"];
  const namespaceX = { fuller: 115, qsol: 385, thorne: 655, shared: 800, hawken: 1085, buddhist: 1460 };
  let currentField = null;

  function svgEl(name, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", name);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
    return node;
  }

  function appendPills(container, values) {
    const list = Array.isArray(values) ? values : [];
    if (!list.length) {
      container.append(document.createTextNode("—"));
      return;
    }
    for (const value of list) container.append(htmlEl("span", { class: "pill" }, value));
  }

  function appendDefinition(dl, term, content) {
    dl.append(htmlEl("dt", {}, term));
    const dd = htmlEl("dd");
    if (content instanceof Node) dd.append(content);
    else dd.textContent = String(content ?? "—");
    dl.append(dd);
    return dd;
  }

  function pillFragment(values) {
    const fragment = document.createDocumentFragment();
    appendPills(fragment, values);
    return fragment;
  }

  function activateWithKeyboard(event, callback) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    callback();
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function jitter(id, seed, span) {
    return ((hashString(`${seed}:${id}`) / 4294967295) - 0.5) * span;
  }

  function activeNamespaces() {
    return new Set(namespaceInputs.filter((input) => input.checked).map((input) => input.value));
  }

  function activeClasses() {
    if (modeSelect.value === "strict") return strictClasses;
    if (modeSelect.value === "sandbox") return sandboxClasses;
    return new Set(Object.keys(classWeight));
  }

  function visibleData() {
    const namespaces = activeNamespaces();
    const classes = activeClasses();
    const query = searchInput.value.trim().toLowerCase();
    const parameters = data.parameters.filter((item) => {
      if (!namespaces.has(item.namespace)) return false;
      if (!query) return true;
      return [item.id, item.label, item.definition, ...(item.domains || [])].join(" ").toLowerCase().includes(query);
    });
    const ids = new Set(parameters.map((item) => item.id));
    return {
      parameters,
      relations: data.relations.filter((item) => classes.has(item.classification) && ids.has(item.from) && ids.has(item.to))
    };
  }

  function layout(parameters) {
    const seed = Number.parseInt(seedInput.value, 10) || 0;
    const groups = Object.fromEntries(namespaceOrder.map((name) => [name, []]));
    for (const item of parameters) groups[item.namespace]?.push(item);
    const positions = new Map();
    for (const namespace of namespaceOrder) {
      const items = groups[namespace].sort((a, b) => a.id.localeCompare(b.id));
      const step = Math.min(67, 685 / Math.max(1, items.length));
      items.forEach((item, index) => {
        const centred = index - (items.length - 1) / 2;
        positions.set(item.id, {
          x: namespaceX[namespace] + jitter(item.id, seed, namespace === "shared" ? 20 : 45),
          y: 415 + centred * step + jitter(`${item.id}:y`, seed, 16)
        });
      });
    }
    return positions;
  }

  function renderAtlas() {
    const visible = visibleData();
    const positions = layout(visible.parameters);
    svg.replaceChildren();

    const namespaces = activeNamespaces();
    for (const namespace of namespaceOrder) {
      if (!namespaces.has(namespace)) continue;
      const label = svgEl("text", { x: namespaceX[namespace], y: 34, "text-anchor": "middle", class: "namespace-label" });
      label.textContent = namespace === "shared" ? "shared signals" : namespace === "buddhist" ? "middle way" : namespace;
      svg.append(label);
    }

    const edgeLayer = svgEl("g");
    for (const relation of visible.relations) {
      const from = positions.get(relation.from);
      const to = positions.get(relation.to);
      if (!from || !to) continue;
      const mid = (from.x + to.x) / 2;
      const path = svgEl("path", {
        d: `M ${from.x} ${from.y} C ${mid} ${from.y}, ${mid} ${to.y}, ${to.x} ${to.y}`,
        class: `atlas-edge ${relation.classification}`,
        tabindex: 0,
        role: "button",
        "aria-label": `${relation.classification}: ${relation.from} to ${relation.to}`
      });
      const open = () => showRelation(relation);
      path.addEventListener("click", open);
      path.addEventListener("keydown", (event) => activateWithKeyboard(event, open));
      edgeLayer.append(path);
    }
    svg.append(edgeLayer);

    const nodeLayer = svgEl("g");
    for (const parameter of visible.parameters) {
      const position = positions.get(parameter.id);
      const outer = parameter.namespace === "buddhist" || parameter.namespace === "hawken";
      const group = svgEl("g", {
        class: `node-group ${parameter.namespace}`,
        transform: `translate(${position.x} ${position.y})`,
        tabindex: 0,
        role: "button",
        "aria-label": `${parameter.label}, ${parameter.namespace} parameter`
      });
      group.append(svgEl("circle", { r: 10 + Math.min(6, (parameter.evidence_status || []).length * 2) }));
      const text = svgEl("text", { x: outer ? -17 : 17, y: 5, "text-anchor": outer ? "end" : "start" });
      text.textContent = parameter.label;
      group.append(text);
      const open = () => showParameter(parameter);
      group.addEventListener("click", open);
      group.addEventListener("keydown", (event) => activateWithKeyboard(event, open));
      nodeLayer.append(group);
    }
    svg.append(nodeLayer);

    renderCrosswalk(visible.relations);
    $("nodeCount").textContent = String(visible.parameters.length);
    $("relationCount").textContent = String(visible.relations.length);
    $("strictCount").textContent = String(visible.relations.filter((item) => strictClasses.has(item.classification)).length);
    $("hypothesisCount").textContent = String(visible.relations.filter((item) => item.classification === "HYPOTHETICAL").length);
  }

  function showParameter(parameter) {
    const eyebrow = htmlEl("p", { class: "eyebrow" }, `Parameter / ${parameter.namespace}`);
    const title = htmlEl("h2", {}, parameter.label);
    const definition = htmlEl("p", {}, parameter.definition);
    const dl = htmlEl("dl");
    appendDefinition(dl, "ID", htmlEl("code", {}, parameter.id));
    appendDefinition(dl, "Domains", pillFragment(parameter.domains));
    appendDefinition(dl, "Evidence", pillFragment(parameter.evidence_status));
    appendDefinition(dl, "Sources", pillFragment(parameter.source_refs));
    appendDefinition(dl, "Canonical", parameter.canonical ? "yes" : "comparative synthesis");
    detail.replaceChildren(eyebrow, title, definition, dl);
  }

  function showRelation(relation) {
    const from = parameterById.get(relation.from);
    const to = parameterById.get(relation.to);
    const eyebrow = htmlEl("p", { class: "eyebrow" }, `Relation / ${relation.classification}`);
    const title = htmlEl("h2", {}, `${from?.label || relation.from} → ${to?.label || relation.to}`);
    const rationale = htmlEl("p", {}, relation.rationale);
    const dl = htmlEl("dl");
    appendDefinition(dl, "ID", htmlEl("code", {}, relation.id));
    appendDefinition(dl, "Evidence", pillFragment(relation.evidence_status));
    appendDefinition(dl, "Preserves", pillFragment(relation.preserves));
    appendDefinition(dl, "Transforms", pillFragment(relation.transforms));
    appendDefinition(dl, "Discards", pillFragment(relation.discards));
    appendDefinition(dl, "Units", relation.unit_compatibility);
    appendDefinition(dl, "Falsification", relation.falsification);
    appendDefinition(dl, "Status", relation.status);
    detail.replaceChildren(eyebrow, title, rationale, dl);
  }

  function appendCell(row, content) {
    const cell = htmlEl("td");
    if (content instanceof Node) cell.append(content);
    else cell.textContent = String(content ?? "");
    row.append(cell);
  }

  function renderCrosswalk(relations) {
    crosswalk.replaceChildren();
    for (const relation of relations) {
      const row = htmlEl("tr", {
        tabindex: 0,
        role: "button",
        "aria-label": `Inspect ${relation.classification} relation from ${relation.from} to ${relation.to}`
      });
      appendCell(row, parameterById.get(relation.from)?.label || relation.from);
      appendCell(row, parameterById.get(relation.to)?.label || relation.to);
      appendCell(row, htmlEl("span", { class: "pill" }, relation.classification));
      appendCell(row, pillFragment(relation.evidence_status));
      appendCell(row, (relation.preserves || []).join(", "));
      const open = () => showRelation(relation);
      row.addEventListener("click", open);
      row.addEventListener("keydown", (event) => activateWithKeyboard(event, open));
      crosswalk.append(row);
    }
  }

  function relationToShared(parameterId, sharedId) {
    return data.relations.find((relation) => relation.classification !== "REJECTED" && (
      (relation.from === parameterId && relation.to === sharedId) ||
      (relation.to === parameterId && relation.from === sharedId)
    )) || null;
  }

  function domainOverlap(parameter, shared) {
    const left = new Set(parameter.domains || []);
    const right = new Set(shared.domains || []);
    const intersection = [...left].filter((value) => right.has(value)).length;
    return intersection / Math.max(1, new Set([...left, ...right]).size);
  }

  function stationScore(parameter, shared) {
    const relation = relationToShared(parameter.id, shared.id);
    const evidence = new Set(relation?.evidence_status || []);
    const bonus = (evidence.has("P") ? 0.03 : 0) + (evidence.has("R") ? 0.03 : 0) + (evidence.has("D") ? 0.025 : 0) + (evidence.has("E") ? 0.02 : 0);
    const score = Math.min(1, (relation ? classWeight[relation.classification] : 0) * 0.88 + domainOverlap(parameter, shared) * 0.12 + bonus);
    return { parameter, shared, relation, score };
  }

  function enabledStations() {
    const checked = stationToggles.filter((toggle) => toggle.checked).map((toggle) => toggle.value);
    const stations = checked.length ? checked : [...stationNames];
    if (fieldMode.value === "single") return stations.slice(0, 1);
    if (fieldMode.value === "triad") return stations.slice(0, 3);
    return stations;
  }

  function selectedParameters() {
    return enabledStations().map((name) => parameterById.get(stationSelects[name].value)).filter(Boolean);
  }

  function evaluate(parameters) {
    if (!parameters.length) return null;
    const candidates = sharedParameters.map((shared) => {
      const results = parameters.map((parameter) => stationScore(parameter, shared));
      const coverage = results.filter((result) => result.relation).length / parameters.length;
      const mean = results.reduce((sum, result) => sum + result.score, 0) / parameters.length;
      const minimum = Math.min(...results.map((result) => result.score));
      return { shared, results, coverage, score: mean * 0.68 + minimum * 0.22 + coverage * 0.10 };
    });
    return candidates.sort((a, b) => b.score - a.score || a.shared.id.localeCompare(b.shared.id))[0];
  }

  function strongestField() {
    const stations = enabledStations();
    let best = null;
    for (const shared of sharedParameters) {
      const results = stations.map((station) => {
        const candidates = data.parameters
          .filter((item) => item.namespace === station)
          .map((item) => stationScore(item, shared));
        return candidates.sort((a, b) => b.score - a.score || a.parameter.id.localeCompare(b.parameter.id))[0];
      }).filter(Boolean);
      if (!results.length) continue;
      const coverage = results.filter((result) => result.relation).length / stations.length;
      const mean = results.reduce((sum, result) => sum + result.score, 0) / results.length;
      const minimum = Math.min(...results.map((result) => result.score));
      const score = mean * 0.68 + minimum * 0.22 + coverage * 0.10;
      if (!best || score > best.score) best = { shared, results, coverage, score };
    }
    if (best) {
      for (const result of best.results) stationSelects[result.parameter.namespace].value = result.parameter.id;
    }
    currentField = best;
    renderField(best);
  }

  function fieldClass(score) {
    if (score >= 0.72) return "strong";
    if (score >= 0.45) return "medium";
    return "weak";
  }

  function wrapLabel(label, max = 18) {
    const words = label.split(/\s+/);
    const lines = [];
    let line = "";
    for (const word of words) {
      if (`${line} ${word}`.trim().length > max && line) {
        lines.push(line);
        line = word;
      } else {
        line = `${line} ${word}`.trim();
      }
    }
    if (line) lines.push(line);
    return lines.slice(0, 3);
  }

  function appendWrappedSvgText(parent, label, attrs, max) {
    const text = svgEl("text", attrs);
    wrapLabel(label, max).forEach((line, index) => {
      const tspan = svgEl("tspan", { x: attrs.x, dy: index === 0 ? 0 : 20 });
      tspan.textContent = line;
      text.append(tspan);
    });
    parent.append(text);
  }

  function renderEmptyFieldReport() {
    $("triReport").replaceChildren(
      htmlEl("h2", {}, "No active stations"),
      htmlEl("p", {}, "Enable at least one station.")
    );
  }

  function renderFieldReport(field) {
    const report = $("triReport");
    const eyebrow = htmlEl("p", { class: "eyebrow" }, "Shared signal");
    const title = htmlEl("h2", {}, field.shared.label);
    const definition = htmlEl("p", {}, field.shared.definition);
    const scoreBar = htmlEl("div", { class: "score-bar" });
    const scoreFill = htmlEl("span");
    scoreFill.style.width = `${Math.max(0, Math.min(100, Math.round(field.score * 100)))}%`;
    scoreBar.append(scoreFill);
    const dl = htmlEl("dl");
    appendDefinition(dl, "Field score", `${Math.round(field.score * 100)}%`);
    appendDefinition(dl, "Coverage", `${Math.round(field.coverage * 100)}%`);
    for (const result of field.results) {
      const content = document.createDocumentFragment();
      content.append(htmlEl("strong", {}, result.parameter.label), htmlEl("br"));
      if (result.relation) {
        content.append(
          htmlEl("span", { class: "pill" }, result.relation.classification),
          document.createTextNode(` ${result.relation.rationale}`)
        );
      } else {
        content.append(document.createTextNode("No explicit relation; domain similarity only."));
      }
      appendDefinition(dl, result.parameter.namespace, content);
    }
    const residual = 1 - Math.min(...field.results.map((result) => result.score));
    const residualParagraph = htmlEl("p", { class: "residual" });
    residualParagraph.append(
      htmlEl("strong", {}, `Residual ${Math.round(residual * 100)}%: `),
      document.createTextNode("unmatched meaning remains source-specific. Geometry, computation, ecology and Buddhist liberation practice are not interchangeable.")
    );
    report.replaceChildren(eyebrow, title, definition, scoreBar, dl, residualParagraph);
  }

  function renderField(field = evaluate(selectedParameters())) {
    currentField = field;
    fieldSvg.replaceChildren();
    if (!field) {
      renderEmptyFieldReport();
      return;
    }

    const cx = 500;
    const cy = 300;
    const radius = field.results.length === 1 ? 0 : 225;
    const points = field.results.map((result, index) => {
      const angle = -Math.PI / 2 + index * (Math.PI * 2 / Math.max(1, field.results.length));
      return {
        result,
        x: field.results.length === 1 ? cx : cx + Math.cos(angle) * radius,
        y: field.results.length === 1 ? cy - 150 : cy + Math.sin(angle) * radius
      };
    });

    for (const { result, x, y } of points) {
      fieldSvg.append(svgEl("line", { x1: x, y1: y, x2: cx, y2: cy, class: `tri-edge ${fieldClass(result.score)}` }));
    }

    const centre = svgEl("g", { class: "tri-centre" });
    centre.append(svgEl("circle", { cx, cy, r: 82 }));
    appendWrappedSvgText(centre, field.shared.label, { x: cx, y: cy - 10 }, 16);
    const scoreText = svgEl("text", { x: cx, y: cy + 56 });
    scoreText.textContent = `${Math.round(field.score * 100)}% field`;
    centre.append(scoreText);
    fieldSvg.append(centre);

    for (const { result, x, y } of points) {
      const group = svgEl("g", { class: `tri-node ${result.parameter.namespace}` });
      group.append(svgEl("circle", { cx: x, cy: y, r: 55 }));
      appendWrappedSvgText(group, result.parameter.label, { x, y: y - 8 }, 18);
      const pct = svgEl("text", { x, y: y + 43 });
      pct.textContent = `${Math.round(result.score * 100)}%`;
      group.append(pct);
      fieldSvg.append(group);
    }

    renderFieldReport(field);
  }

  function populateSelectors() {
    for (const station of stationNames) {
      const select = stationSelects[station];
      const parameters = data.parameters
        .filter((item) => item.namespace === station)
        .sort((a, b) => a.label.localeCompare(b.label));
      for (const parameter of parameters) {
        select.append(htmlEl("option", { value: parameter.id }, parameter.label));
      }
    }
  }

  function audioContext() {
    const Context = window.AudioContext || window.webkitAudioContext;
    return Context ? new Context() : null;
  }

  function closeAudioContextLater(context, delay) {
    window.setTimeout(() => {
      if (context.state !== "closed") context.close().catch(() => {});
    }, delay);
  }

  function sonifyField() {
    const field = currentField || evaluate(selectedParameters());
    if (!field) return;
    const context = audioContext();
    if (!context) return;
    const master = context.createGain();
    master.gain.value = 0.075;
    master.connect(context.destination);
    const root = 146.83;
    const ratios = [1, 5 / 4, 3 / 2, 2, 9 / 8];
    const types = { fuller: "triangle", qsol: "sine", thorne: "square", hawken: "triangle", buddhist: "sine" };

    field.results.forEach((result, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const filter = context.createBiquadFilter();
      const roughness = 1 - result.score;
      oscillator.type = types[result.parameter.namespace] || "sine";
      oscillator.frequency.value = root * ratios[index % ratios.length];
      oscillator.detune.value = roughness * (index % 2 ? 34 : -34);
      filter.type = "lowpass";
      filter.frequency.value = 900 + result.score * 2200;
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(0.38 * (0.55 + result.score * 0.45), context.currentTime + 0.08);
      gain.gain.setValueAtTime(0.38 * (0.55 + result.score * 0.45), context.currentTime + 1.7);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2.4);
      oscillator.connect(filter).connect(gain).connect(master);
      oscillator.start();
      oscillator.stop(context.currentTime + 2.45);
    });

    const centre = context.createOscillator();
    const centreGain = context.createGain();
    centre.type = "sine";
    centre.frequency.value = root * 2;
    centre.detune.value = (1 - field.score) * 12;
    centreGain.gain.setValueAtTime(0, context.currentTime);
    centreGain.gain.linearRampToValueAtTime(0.22 * field.score, context.currentTime + 0.15);
    centreGain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 2.5);
    centre.connect(centreGain).connect(master);
    centre.start();
    centre.stop(context.currentTime + 2.55);
    closeAudioContextLater(context, 2900);
  }

  function sonifyVisible() {
    const visible = visibleData();
    const context = audioContext();
    if (!context || !visible.parameters.length) return;
    const master = context.createGain();
    master.gain.value = 0.055;
    master.connect(context.destination);
    const degree = new Map(visible.parameters.map((item) => [item.id, 0]));
    for (const relation of visible.relations) {
      degree.set(relation.from, (degree.get(relation.from) || 0) + 1);
      degree.set(relation.to, (degree.get(relation.to) || 0) + 1);
    }
    visible.parameters.sort((a, b) => a.id.localeCompare(b.id)).forEach((parameter, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const offset = { fuller: 0, qsol: 5, thorne: 10, hawken: 15, buddhist: 19, shared: 24 }[parameter.namespace] || 0;
      const midi = 42 + offset + Math.min(16, (degree.get(parameter.id) || 0) * 2);
      oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
      oscillator.type = parameter.namespace === "qsol" || parameter.namespace === "buddhist" ? "sine" : "triangle";
      const start = context.currentTime + index * 0.07;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.13);
      oscillator.connect(gain).connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.14);
    });
    closeAudioContextLater(context, visible.parameters.length * 75 + 500);
  }

  function exportView() {
    const visible = visibleData();
    const field = currentField || evaluate(selectedParameters());
    const payload = {
      schema: "synergetics-view-v1",
      registry_version: data.version,
      layout_seed: Number.parseInt(seedInput.value, 10) || 0,
      mode: modeSelect.value,
      namespaces: [...activeNamespaces()].sort(),
      search: searchInput.value,
      field_mode: fieldMode.value,
      station_parameters: Object.fromEntries(enabledStations().map((station) => [station, stationSelects[station].value])),
      shared_signal: field?.shared.id || null,
      field_score: field ? Number(field.score.toFixed(6)) : null,
      parameter_ids: visible.parameters.map((item) => item.id).sort(),
      relation_ids: visible.relations.map((item) => item.id).sort()
    };
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json" });
    const objectUrl = URL.createObjectURL(blob);
    const link = htmlEl("a", { href: objectUrl, download: "synergetics-research-view.json" });
    link.hidden = true;
    document.body.append(link);
    link.click();
    window.setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      link.remove();
    }, 100);
  }

  populateSelectors();
  [modeSelect, searchInput, seedInput, ...namespaceInputs].forEach((node) => node.addEventListener("input", renderAtlas));
  [fieldMode, ...stationToggles, ...Object.values(stationSelects)].forEach((node) => node.addEventListener("input", () => renderField(evaluate(selectedParameters()))));
  $("autoMatchButton").addEventListener("click", strongestField);
  $("triSonifyButton").addEventListener("click", sonifyField);
  $("sonifyButton").addEventListener("click", sonifyVisible);
  $("exportButton").addEventListener("click", exportView);
  renderAtlas();
  strongestField();
})();
