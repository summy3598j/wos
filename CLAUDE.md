# WOS ツール集 — CLAUDE.md

## Project Overview

このリポジトリは、モバイル戦略ゲーム *Whiteout Survival* 向けの日本語ツール群を GitHub Pages でホストする、単一の統合開発リポジトリです。以前は `wos`（本体）と `wos-search`（英雄装備バフ計算・OCR系）に開発が分かれていましたが、`summy3598j/wos` 一本に統合しました。

## Repository Structure

```
wos/
├── index.html            # WOS 装備計算機（装備強化・宝石LvUP プランナー、PWA本体）
├── manifest.json         # PWA manifest（index.html 用）
├── sw.js                 # Service Worker（index.html 用、cache-first）
├── fc-calculator.html    # 火晶計算ツール
├── phase2.html           # スクショ解析 Phase 2（テンプレートマッチ）
├── phase3.html           # スクショ解析 Phase 3（アイコン照合＋ROIデジット認識）
├── heal-calculator.html  # 治療計算ツール
├── resource-calc.html    # 都市資源生産量計算
├── event-scheduler.html  # 予定告知メーカー
├── canyon-battle.html    # 峡谷合戦 完全ガイド
├── hero-gear-calc.html   # 英雄装備バフ計算（旧 wos-search / index.html）
├── ocr-phase1.html       # スクショ解析 Phase 1（袋の中の数値OCR、Tesseract.js）
├── src/                  # hero-gear-calc.html のロジックの TypeScript 版 + テスト（Jest）
│   ├── calc/heroGearBuffs.ts
│   ├── calc/heroGearBuffs.test.ts
│   └── data/heroGear.ts
├── package.json / tsconfig.json / jest.config.js   # src/ のテスト実行用（`npm test`）
└── .nojekyll
```

**各 HTML ファイルは基本的に単一ファイル完結（HTML + CSS + JS 一体）で、ビルド不要です。** `src/` 以下の TypeScript は `hero-gear-calc.html` のロジック検証用テストであり、HTML 自体はこの TS をビルドして使っているわけではない（ロジックは HTML 内に直接インラインで書かれている）ので、`src/` を編集しても `hero-gear-calc.html` には自動反映されません。両方を編集する場合は手動で同期してください。

各ツールはページ間リンクを持たない独立したページです。相互参照はなく、それぞれ直接 URL（例: `https://summy3598j.github.io/wos/fc-calculator.html`）でアクセスします。

## デプロイ

このリポジトリは **`gh-pages` ブランチ**が GitHub Pages の公開ソースです。開発ブランチ（本ブランチ）での変更は、公開したい場合に `gh-pages` ブランチへ反映（コピー・コミット・push）する必要があります。

`gh-pages` は必ず開発ブランチからの一方通行で反映すること。`gh-pages` を直接編集しない（hotfixも含む）。これを守っていれば、開発ブランチには常に公開版と同じかそれより新しい内容が入っている状態が保証される。

### 開発開始前の同期チェック

新しい作業を始める前に、公開対象ファイルが開発ブランチと `gh-pages` で一致しているか確認する。

```
git fetch origin gh-pages <開発ブランチ名>
git diff --name-status origin/<開発ブランチ名> origin/gh-pages -- index.html fc-calculator.html phase2.html phase3.html heal-calculator.html resource-calc.html event-scheduler.html canyon-battle.html hero-gear-calc.html ocr-phase1.html manifest.json sw.js .nojekyll
```

出力が空であれば同一バージョン。差分がある場合は `gh-pages` にのみ存在する変更（直接編集されたhotfixなど）を先に開発ブランチへ取り込んでから、新しい作業を始めること。

## ブランチ運用

開発ブランチはデフォルトブランチの `claude/wos-html-tool-consolidation-amqy1n` 一本に統一しています。以前は作業（新ツール追加など）のたびに新しいブランチ（`claude/xxx-yyyyy` 形式）が作られ、マージも削除もされないまま放置されて多数残ってしまっていました。今後は次のルールを守ること。

- 新しい作業用ブランチを切った場合、作業が完了したらデフォルトブランチへマージし、**作業用ブランチは削除する**。マージ・削除せずに放置しない。
- 可能な限り、新規ブランチを切らずデフォルトブランチ上で直接作業する。
- `gh-pages` ブランチは公開専用として残す（削除しない）。

## Application Architecture（index.html — WOS 装備計算機）

### Single-file design

All logic, styles, and markup live in `index.html`. The structure inside the file is:

1. `<head>` — meta tags + embedded CSS (minified inline styles)
2. `<body>` — static shell (header, mode bar, buff area, material row, parts grid, modals)
3. `<script>` — all JavaScript (data tables, state, helpers, renderers, event handlers)

### Two modes

| Mode ID | Label | Description |
|---------|-------|-------------|
| `gear`  | 装備強化 | Equipment grade upgrade planner |
| `gem`   | 宝石LvUP | Gem level-up planner |

Mode is toggled via `setMode(m)` and persisted in `localStorage`.

## Data Tables

### `GL[]` — Gear Level table (index.html ~line 160)

27 entries (index 0 = sentinel "none", 1–26 = actual grades).

Key fields per entry:

| Field | Meaning |
|-------|---------|
| `rarity` | `"Good"`, `"Rare"`, `"Epic"`, `"Legend"` |
| `tier` | `""` or `"T1"` or `"T2"` |
| `stars` | 0–3 |
| `rank` | Monotonic integer 1–26 (used as array index) |
| `alloy` | 強靱な合金 required for this upgrade step |
| `polish` | 研磨剤 required |
| `plan` | 設計図面 required |
| `buff` | % attack/defense buff value at this level |
| `def3` | 3-piece set bonus value (changes at tier boundaries) |
| `atk6` | 6-piece set bonus value (changes at tier boundaries) |

### `JL[]` — Gem Level table (index.html ~line 189)

17 entries (index 0 = level 0, 1–16 = gem levels).

## State Management

`gCur`/`gTgt` — current/target gear levels per part. `jCur`/`jTgt` — current/target gem levels per part+slot (array format). `inv` — inventory counts keyed by material.

### Mutators

- `setCur(id, v)` — set current gear level for part `id`
- `setTgt(id, v)` — set target gear level for part `id`
- `setGemCur(id, sl, v)` — set current gem level for part `id`, slot `sl`
- `setGemTgt(id, sl, v)` — set target gem level for part `id`, slot `sl`
- `setInvKey(k, v)` — set inventory count for key `k`
- `setMode(m)` — switch mode
- `resetAllTgt()` — reset all targets to current levels

All mutators call `saveBk()` then `render()`.

### Calculations

- `gearBuff(lvMap)` — returns `{lance, shield, bow, def3, atk6, lbl3, lbl6, nxt3, nxt6}` for a gear level map
- `gemBuff(lvMap)` — returns `{lance, shield, bow}` lethality totals for a gem level map
- `setBonus(lvMap)` — calculates 3-piece and 6-piece set bonuses from equipped slots
- `totalReq()` — returns total materials needed across all parts to reach targets
- `gearMatRange(from, to)` / `gemMatRange(from, to)` — sum material costs between two level indices
- `canUp(id)` — returns true if, after fulfilling all targets, there are leftover materials to upgrade this part one more step
- `partShort(id)` — returns true if this part's target requires more materials than currently held

### Render pipeline

`render()` calls all four sub-renderers:

1. `renderMode()` — updates mode tab active states
2. `renderBuff()` — updates buff summary panel
3. `renderMat()` — updates material requirement row
4. `renderParts()` — rebuilds the 2-column parts grid

All rendering is DOM-string injection via `.innerHTML`. There is no virtual DOM or framework.

### Long-press support

`startRep(fn, id, dir)` / `startRepGem(fn, id, sl, dir)` — start a repeat timer (400 ms delay, then 120 ms interval) for ▲/▼ buttons. `stopRep()` clears both timers.

Gem buttons use `data-*` attributes to avoid inline quote escaping: `_gTap(btn)` handles single tap, `_gRep(btn)` starts repeat.

## Set Bonus Logic

The 3-piece defense bonus uses the **3rd-lowest-ranked** equipped part's `def3` tier value.
The 6-piece attack bonus uses the **6th-lowest-ranked** (minimum) equipped part's `atk6` tier value.

`GL_TIERS` is a filtered subset of `GL` containing only the first entry per distinct `def3` value — used to find the minimum rank at which each set bonus tier activates.

## PWA / Service Worker (index.html)

`sw.js` implements a **cache-first** strategy:
- On install: caches `./`, `./index.html`, `./manifest.json`, `./sw.js` under a versioned cache key
- On activate: deletes all caches whose key ≠ current version
- On fetch: serves from cache; if miss, fetches from network and caches the response

**When updating the app:** bump the cache version string in `sw.js` so returning users get the new version rather than the stale cached files.

## Development Workflow

1. Edit the relevant `.html` file directly — no build step required for any tool.
2. Open the file in a browser to test (or serve with any static HTTP server: `python3 -m http.server`).
3. For `src/` (hero-gear-calc logic tests): `npm install && npm test` (Jest).
4. Commit and push to this branch. To publish, sync the changed files to the `gh-pages` branch.

## Conventions

- **CSS**: Inline on elements for one-off overrides; class-based in the `<style>` block for reusable patterns. Styles are written minified (no unnecessary whitespace).
- **JS**: Single-letter helpers (`fmt`, `fmtPct`, `stars`) for frequently called display formatters. State mutations always go through the named setter functions — never mutate state objects directly.
- **HTML generation**: Sections are built as template-literal strings and set via `.innerHTML`. Preserve the `data-*` attribute pattern for buttons that need to avoid inline quote nesting.
- **No comments by default**: The codebase has minimal comments. Add a comment only when the logic is non-obvious.
- **Language**: All user-visible text is Japanese. Keep it that way. Variable names and code are English.

## Notification Dots (index.html)

Each part card shows a colored dot in its top-right corner:

| Color | Condition |
|-------|-----------|
| 🔴 Red (`#ef4444`) | After meeting all targets, enough leftover materials to upgrade this part one more rank right now |
| 🟡 Yellow (`#eab308`) | This part has a target set but total inventory is insufficient to reach it |
| (none) | Target already met, or no surplus to upgrade further |

Red takes priority — it only shows when the part is not already short on materials.
