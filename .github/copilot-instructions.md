# GitHub Copilot Instructions for McTibetimWeb

This document describes the repository as it exists in this workspace today. Use it as the source of truth instead of older notes that referenced candidate-table or engine-based implementations.

## Project Overview

McTibetimWeb (小麥藏文輸入法) is a TypeScript Tibetan input method that currently targets:

- Web browsers
- Chrome OS through a Chrome extension bundle
- Windows through PIME

The project is now layout-driven. Input behavior lives in `src/layout/`, while the shared controller, state model, key translation, and UI serialization live in `src/input_method/`.

## Current Technology Stack

- Language: TypeScript 5
- Package manager: npm with `package-lock.json`
- Build tooling: Webpack 5 with `ts-loader`
- Testing: Jest 30 with `ts-jest` and `jsdom`
- Linting: ESLint 10 with flat config in `eslint.config.cjs`
- Coverage: Jest runs with `collectCoverage: true`
- External dependency: `tibetan-ewts-converter` for Wylie conversion
- Compiler settings: `strict: true`, `module: commonjs`, `target: es6`

## Repository Structure

```text
McTibetimWeb/
├── .github/
│   ├── workflows/
│   └── copilot-instructions.md
├── src/
│   ├── index.ts
│   ├── chromeos_ime.ts
│   ├── pime.ts
│   ├── pime_keys.ts
│   ├── input_method/
│   │   ├── Candidate.ts
│   │   ├── InputController.ts
│   │   ├── InputState.ts
│   │   ├── InputUI.ts
│   │   ├── InputUIElements.ts
│   │   ├── Key.ts
│   │   ├── KeyHandler.ts
│   │   ├── KeyMapping.ts
│   │   ├── *.test.ts
│   │   └── index.ts
│   ├── layout/
│   │   ├── Layout.ts
│   │   ├── LayoutManager.ts
│   │   ├── DzongkhaLayout.ts
│   │   ├── SambhotaKeymapOneLayout.ts
│   │   ├── SambhotaKeymapTwoLayout.ts
│   │   ├── TccKeyboardOneLayout.ts
│   │   ├── TccKeyboardTwoLayout.ts
│   │   ├── WyleLayout.ts
│   │   ├── StackingLayout.ts
│   │   ├── *.test.ts
│   │   └── index.ts
│   └── test_support/
│       └── EwtsConverterMock.ts
├── tools/
│   ├── convert.py
│   ├── README.md
│   ├── requirements.txt
│   └── run.sh
├── output/
│   ├── chromeos/
│   ├── example/
│   └── pime/
├── resource/
├── eslint.config.cjs
├── jest.config.js
├── tsconfig.json
├── webpack.config.js
├── webpack.config.chromeext.js
├── webpack.config.pime.js
├── build_pime.bat
├── README.md
└── README.STATES.md
```

## Important Current Facts

### Active Layouts

`src/layout/LayoutManager.ts` currently registers six layouts:

- `dzongkha`
- `sambhota_keymap_1`
- `sambhota_keymap_2`
- `tcc_keyboard_1`
- `tcc_keyboard_2`
- `wylie`

Note the implementation file is named `WyleLayout.ts`, but its public layout id and name are `wylie` / `Wylie`.

### State Model

The authoritative state model is in `src/input_method/InputState.ts`.

Concrete states:

- `EmptyState`
- `CommittingState`
- `WylieInputtingState`
- `StackingState`

`InputtingState` is an abstract base class for the two composition modes. There is no longer a generic candidate-engine state machine under `src/engine/`.

### Architecture Shape

- Direct-commit layouts such as `DzongkhaLayout` emit Tibetan characters immediately.
- `StackingLayout` and its subclasses build Tibetan syllables incrementally in `StackingState`.
- `WyleLayout` edits ASCII Wylie text and uses `tibetan-ewts-converter` to generate a Tibetan preview tooltip.
- `KeyHandler` delegates all semantics to the selected layout.
- `InputController` owns state transitions, UI updates, and commit/reset behavior.
- `InputUIElements.ts` serializes `InputtingState` into the compact JSON payload expected by the UI layer.

### Validation Status

Verified in this workspace on **March 31, 2026**:

- `npm run ts-build` passes
- `npm run test -- --runInBand` passes: **11 suites, 216 tests**
- `npm run eslint` passes

Jest is configured with `collectCoverage: true`, so test runs also attempt to write coverage artifacts under `coverage/`.

### Build Outputs

- `npm run build` writes `output/example/bundle.js`
- `npm run build:chromeos` writes `output/chromeos/bundle.js`
- `npm run build:pime` writes `output/pime/index.js`
- `npm run ts-build` writes library output to `dist/`

## Core Concepts

### Input Method Flow

1. Platform code translates host key events into internal `Key` objects.
2. `InputController` forwards the key to `KeyHandler`.
3. `KeyHandler` delegates behavior to the currently selected `Layout`.
4. Layout code emits a new `InputState`.
5. `InputController` either updates UI state or commits text and resets back to `EmptyState`.

### Main Code Areas

- `src/input_method/InputController.ts`: state transition orchestration and UI/commit handling
- `src/input_method/KeyHandler.ts`: layout selection and event dispatch
- `src/input_method/InputState.ts`: state definitions for empty, composing, and commit transitions
- `src/input_method/InputUIElements.ts`: JSON serialization for composing UI state
- `src/input_method/KeyMapping.ts`: DOM keyboard event to internal key translation
- `src/layout/Layout.ts`: layout contract
- `src/layout/StackingLayout.ts`: shared stacking-IME behavior for multiple Tibetan layouts
- `src/layout/WyleLayout.ts`: Wylie composition, cursor editing, and EWTS conversion
- `src/chromeos_ime.ts`: Chrome OS integration entry point
- `src/pime.ts`: PIME integration entry point
- `src/pime_keys.ts`: Windows virtual key translation for PIME

## Development Workflow

### Install

```bash
npm install
```

### Common Commands

```bash
# TypeScript library build
npm run ts-build

# Webpack builds
npm run build
npm run build:chromeos
npm run build:pime

# Watch mode
npm run build:watch
npm run ts-build:watch

# Validation
npm run test
npm run test -- --runInBand
npm run test:coverage
npm run eslint
```

## Platform Notes

### Web

- Entry: `src/index.ts`
- Webpack config: `webpack.config.js`
- Output folder: `output/example/`

### Chrome OS

- Entry: `src/chromeos_ime.ts`
- Webpack config: `webpack.config.chromeext.js`
- Output folder: `output/chromeos/`

### Windows / PIME

- Entry: `src/pime.ts`
- Webpack config: `webpack.config.pime.js`
- Output folder: `output/pime/`
- IME metadata lives in `output/pime/ime.json`
- `build_pime.bat` builds the PIME bundle and copies it to `C:\Program Files (x86)\PIME\node\input_methods\mctibetim`
- **Important Note**: PIME uses an older Node.js version, so `webpack.config.pime.js` requires additional configuration to ensure compatibility.

## Coding Guidance for Agents

### TypeScript

- Preserve `strict` mode assumptions.
- Prefer explicit types over `any`.
- Keep source compatible with the current `commonjs` / `es6` compiler settings.
- `tsconfig.json` excludes platform entry points and tests from the library build; do not assume every file under `src/` is emitted by `npm run ts-build`.

### Tests

- Place tests next to implementation files using the `.test.ts` suffix.
- Current test coverage exists in both `src/input_method/` and `src/layout/`.
- DOM-facing behavior uses `jsdom`.
- `jest.config.js` maps `tibetan-ewts-converter/EwtsConverter` to `src/test_support/EwtsConverterMock.ts`.
- When changing layout semantics, state transitions, or key translation, update adjacent tests.

### Linting

- The repository uses `eslint.config.cjs`, not `.eslintrc.*`.
- The `eslint` script targets `src` only.
- Do not assume formatting or import-order rules that are not explicitly configured.

### State and Layout Changes

- If a change affects composition lifecycle, update `README.STATES.md` to match `InputState.ts`.
- Layout-specific key behavior belongs in `src/layout/`, not in `KeyHandler`.
- Shared controller behavior belongs in `src/input_method/InputController.ts`.
- If a new layout is added, register it in `LayoutManager` and add tests for both layout behavior and controller integration where needed.

## Common Tasks

### Modifying Input Behavior

- Update the relevant layout in `src/layout/`.
- Update `src/input_method/InputState.ts` if the state model changes.
- Update `src/input_method/InputController.ts` if commit/reset/UI behavior changes.
- Update `src/input_method/InputUIElements.ts` if the serialized UI payload changes.
- Revise or add `.test.ts` files alongside the changed modules.

### Working with Wylie

- `src/layout/WyleLayout.ts` owns Wylie editing behavior.
- The tooltip is generated from `tibetan-ewts-converter`.
- Wylie state keeps both the raw letters and the converted Tibetan preview.

### Working with Stacking Layouts

- `src/layout/StackingLayout.ts` contains the shared stacking algorithm.
- Subclasses provide compose keys, space keys, and key maps for consonants, vowels, suffixes, and symbols.
- Cursor keys can commit the current buffer and fall through to the host environment.

### Working with PIME

- `src/pime.ts` handles the PIME event lifecycle and dispatches translated keys into `InputController`.
- `src/pime_keys.ts` converts Windows virtual key data into the internal key model.
- `output/pime/README.md` describes the current manual deployment flow.

## Known Documentation Drift To Avoid

Older instructions may still be wrong about these points:

- They may mention `src/engine/` or vocabulary tables in `src/data/`; those are not part of the current repository state.
- They may describe a prefix-search candidate engine; the current implementation is layout-based.
- They may omit `src/layout/` and the Wylie/stacking split in the state model.
- They may reference `.eslintrc.*`; the repo uses `eslint.config.cjs`.
- They may describe outdated test counts or validation status.

## Resources

- Project repository: https://github.com/openvanilla/McTibetimWeb
- PIME repository: https://github.com/EasyIME/PIME
