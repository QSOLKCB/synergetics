# SYNERGETICS — Parameter Atlas & Visual Research Lab

> **A source-bound research atlas for comparing Buckminster Fuller, QSOL-IMC, selected Brian Thorne software structures, Paul Hawken’s regenerative work, and the Buddhist Middle Way without pretending that analogy is equivalence.**

[![Validate Atlas](https://github.com/QSOLKCB/synergetics/actions/workflows/ci.yml/badge.svg)](https://github.com/QSOLKCB/synergetics/actions/workflows/ci.yml)
[![Deploy Pages](https://github.com/QSOLKCB/synergetics/actions/workflows/pages.yml/badge.svg)](https://github.com/QSOLKCB/synergetics/actions/workflows/pages.yml)
[![Offline](https://img.shields.io/badge/lab-offline--first-success)](#run-locally)
[![No dependencies](https://img.shields.io/badge/runtime-no%20dependencies-blue)](#technical-boundaries)

<p align="center">
  <strong><a href="https://qsolkcb.github.io/synergetics/">Open the SYNERGETICS Visual &amp; Sonic Lab →</a></strong><br>
  <sub>The Pages site becomes available after the lab branch is merged into <code>main</code> and the deployment workflow succeeds.</sub>
</p>

## What this project is

SYNERGETICS maps parameters from five distinct **research stations** into explicit comparative signals:

| Station | Primary lens |
|---|---|
| **Buckminster Fuller** | energetic geometry, systems, tetrahedral coordination, vector equilibrium, tensegrity and comprehensive design science |
| **QSOL-IMC** | information geometry, E8/D4 structures, finite event protocols, relational equilibrium, failure pressure, receipts and sonification |
| **Brian Thorne** | boundary/interior systems, finite incidence, deterministic artifacts, replay and semantic projection |
| **Paul Hawken** | regeneration, interbeing, reciprocity, resilience, distributed action and science-based climate solutions |
| **Buddhist Middle Way** | avoidance of harmful extremes, ethical conduct, collected mind, discernment, dependent arising and reciprocal cultivation |

The project asks:

> Can these systems be compared through shared structural and functional signals while preserving their different meanings, units, histories and aims?

## The core rule

**A shared number is not a shared structure. A shared diagram is not necessarily a shared topology. A shared metaphor is not a shared ontology.**

Every relation records:

- its source and destination;
- mapping class;
- evidence basis;
- preserved properties;
- transformed meaning;
- discarded properties;
- unit compatibility;
- a falsification or rejection condition.

No visible line exists only because two ideas “feel similar.”

## Visual & sonic lab

The dependency-free browser lab provides:

### Provenance atlas

View Fuller, QSOL, Thorne, Hawken, Buddhist and shared-signal namespaces separately. Filter by namespace, search term and mapping strength.

### Strict, Sandbox and Rejected modes

- **Strict** — `EXACT`, `STRUCTURAL` and `FUNCTIONAL` relations only.
- **Sandbox** — also displays `ANALOGICAL` and `HYPOTHETICAL` bridges.
- **All** — includes rejected mappings and negative results.

### Shared-signal field matcher

Choose parameters manually or select **Find strongest signal**.

The matcher can:

- inspect one station;
- triangulate three enabled stations;
- compare all enabled stations;
- find the strongest shared signal;
- report station-level scores and evidence classes;
- expose the weakest match as a residual;
- export the complete selected research view as JSON.

The centre of the visual field is a **comparative abstraction**, not a universal theory created by averaging the sources.

### Field sonification

Each enabled station becomes one voice.

- stronger correspondences are more stable and consonant;
- weaker correspondences receive greater detuning and reduced spectral clarity;
- the shared signal receives a quiet reference tone;
- the visible atlas can also be sonified as a deterministic event sequence.

Audio is a receiver projection. It is not evidence for the mapping.

## Initial shared signals

The first registry includes:

- `shared.boundary`
- `shared.whole-part-interaction`
- `shared.equilibrium`
- `shared.pressure`
- `shared.coordination`
- `shared.projection`
- `shared.reproducibility`
- `shared.regeneration`
- `shared.distributed-action`
- `shared.feedback-loop`

Not every station is expected to map strongly to every signal.

## Mapping classes

| Class | Meaning |
|---|---|
| `EXACT` | A reproducible transformation preserves the declared structure. Rare by design. |
| `STRUCTURAL` | A meaningful organisation or invariant is preserved. |
| `FUNCTIONAL` | Different structures perform comparable roles in their own systems. |
| `ANALOGICAL` | Interpretively useful, but not mathematically or ontologically identical. |
| `HYPOTHETICAL` | Proposed bridge awaiting formalisation or testing. |
| `REJECTED` | Examined and found misleading, unsupported or category-incompatible. |

Evidence codes:

- `P` — primary or recognised source;
- `R` — reproducible repository implementation;
- `D` — derived relation or mathematical analysis;
- `E` — empirical observation or assessment;
- `H` — interpretive hypothesis.

## Examples of deliberately rejected mappings

The registry explicitly rejects claims that:

- the Threefold Training is equivalent to ternary protocol states;
- the Middle Way is a geometric midpoint or vector equilibrium;
- recurring use of the number three proves a connection;
- Fano incidence is equivalent to the E8 root system;
- Hawken’s ethical reciprocity is a polyhedral balance law;
- Buddhist discernment is merely a visual or sonic projection;
- contemplative cultivation is a deterministic replay artifact.

Negative results are first-class research outputs.

## Buddhist-source boundary

The Buddhist station is not a generic “balance philosophy.”

It preserves:

- the Middle Way as avoidance of harmful extremes and the Noble Eightfold Path;
- the Threefold Training in **sīla**, **samādhi** and **paññā**;
- dependent arising as conditionality and non-isolation;
- the distinct aim of ending suffering.

`buddhist.cultivation-loop` is an explicitly derived comparative representation. It is not presented as a canonical Buddhist diagram, a qutrit system or an engineering control loop.

## Hawken-source boundary

The Hawken station distinguishes:

- Paul Hawken’s published work;
- Project Regeneration’s life-centred framework;
- Project Drawdown’s institutional science and methods.

Current Project Drawdown claims are not automatically attributed personally to Hawken.

## Technical boundaries

The lab is intentionally simple:

- plain HTML, CSS and JavaScript;
- no cloud runtime;
- no CDN;
- no telemetry;
- no framework;
- no npm dependencies;
- no mandatory build step;
- direct `file://` opening supported;
- native SVG and Web Audio;
- deterministic layout seed;
- accessible keyboard interaction;
- reduced-motion and print support.

Node.js is used only for repository validation and CI.

## Run locally

Clone or download the repository, then open `index.html` directly in a modern browser.

A local server is optional:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Validate

Node.js 24 or newer:

```bash
npm test
```

Validation fails closed for:

- duplicate parameter or relation IDs;
- unknown namespaces or evidence codes;
- orphan relation endpoints;
- missing rationale or falsification conditions;
- non-rejected direct equivalences that bypass a shared signal;
- rejected relations not marked as rejected;
- missing station mappings;
- absence of a shared signal covering all five stations.

## GitHub Pages

The repository is configured for **GitHub Actions** Pages deployment.

On every push to `main`, the Pages workflow:

1. validates the JavaScript and registry;
2. copies only the static lab files into a deployment artifact;
3. publishes the lab through GitHub Pages.

## Repository layout

```text
synergetics/
├── index.html
├── style.css
├── js/
│   └── app.js
├── data/
│   └── data.bundle.js
├── tools/
│   └── validate_registry.mjs
├── docs/
│   ├── MAPPING_RULES.md
│   ├── CLAIM_BOUNDARIES.md
│   └── SOURCES.md
├── .github/workflows/
│   ├── ci.yml
│   └── pages.yml
├── package.json
├── CITATION.cff
├── NOTICE.md
└── README.md
```

## Research documentation

- [Mapping and scoring rules](docs/MAPPING_RULES.md)
- [Claim boundaries](docs/CLAIM_BOUNDARIES.md)
- [Source and provenance ledger](docs/SOURCES.md)

## Project status

### Implemented

- [x] five research-station namespaces;
- [x] shared-signal registry;
- [x] strict/sandbox/rejected filtering;
- [x] evidence ledger;
- [x] parameter crosswalk;
- [x] one-, three- and five-station field matching;
- [x] automatic strongest-signal selection;
- [x] visual field residual;
- [x] field and atlas sonification;
- [x] deterministic JSON research-view export;
- [x] fail-closed registry validator;
- [x] CI and GitHub Pages workflows.

### Next research stages

- [ ] canonical JSON source registries generated into `data.bundle.js`;
- [ ] page- and section-level Fuller citations;
- [ ] tagged commit and DOI pinning for QSOL and Thorne sources;
- [ ] invariant comparator for graph spectra, automorphisms and homology;
- [ ] Wasserstein comparison of graph-derived distributions;
- [ ] controlled perturbation and recovery experiments;
- [ ] MIDI and WAV export receipts;
- [ ] versioned Zenodo research bundle.

## Independence notice

This is an independent comparative research project by **Trent Slade / QSOL-IMC**.

No affiliation, endorsement or doctrinal authority is claimed from:

- the Buckminster Fuller Institute or Fuller Estate;
- Brian Thorne;
- Paul Hawken, Project Regeneration or Project Drawdown;
- any Buddhist teacher, lineage, monastic community or institution.

## Working description

> **SYNERGETICS is an offline visual and sonic parameter atlas that treats Fuller, QSOL, Thorne, Hawken and Buddhist Middle Way training as separate research stations. It locates shared signals, scores the declared correspondence, preserves provenance and displays the residual meaning that does not match.**

## Creator

**Trent Slade / QSOL-IMC**

Independent research in mathematical structure, information geometry, deterministic computation, sonification and whole-system design.
