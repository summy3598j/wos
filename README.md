# WOS ツール集

*Whiteout Survival* 向け日本語ツール集。GitHub Pages（`gh-pages` ブランチ）で公開。

公開URL: https://summy3598j.github.io/wos/

開発はこのリポジトリ（`summy3598j/wos`）に一本化しています。以前 `wos-search` リポジトリで開発していた英雄装備バフ計算・OCR系ツールもこちらに統合済みです。

`index.html` がホーム（各ツールへのリンク一覧）なので、`https://summy3598j.github.io/wos/`（末尾スラッシュのみ）でそのままアクセスできる。

## 公開中のツール

| ファイル | 内容 |
|---|---|
| [index.html](https://summy3598j.github.io/wos/) | ホーム（各ツールへのリンク一覧） |
| [gear-gem-calculator.html](https://summy3598j.github.io/wos/gear-gem-calculator.html) | 領主装備・宝石計算ツール（装備強化・宝石LvUP プランナー、PWA） |
| [fc-calculator.html](https://summy3598j.github.io/wos/fc-calculator.html) | 火晶計算ツール |
| [hero-gear-calc.html](https://summy3598j.github.io/wos/hero-gear-calc.html) | 英雄装備バフ計算 |
| [heal-calculator.html](https://summy3598j.github.io/wos/heal-calculator.html) | 治療計算ツール |
| [resource-calc.html](https://summy3598j.github.io/wos/resource-calc.html) | 都市資源生産量計算 |
| [event-scheduler.html](https://summy3598j.github.io/wos/event-scheduler.html) | 予定告知メーカー |
| [canyon-battle.html](https://summy3598j.github.io/wos/canyon-battle.html) | 峡谷合戦 完全ガイド |
| [phase2.html](https://summy3598j.github.io/wos/phase2.html) | スクショ解析 Phase 2（テンプレートマッチ） |
| [phase3.html](https://summy3598j.github.io/wos/phase3.html) | スクショ解析 Phase 3（アイコン照合＋ROIデジット認識） |
| [ocr-phase1.html](https://summy3598j.github.io/wos/ocr-phase1.html) | スクショ解析 Phase 1（袋の中の数値OCR） |

`index.html` は上記4ツール（gear-gem-calculator / fc-calculator / resource-calc / heal-calculator）へのリンクを持つが、それ以外のページは独立したツールで相互リンクはない。

## 開発

- ビルド不要。各 `.html` は単一ファイル完結（HTML + CSS + JS）。
- `src/` には `hero-gear-calc.html` のロジックの TypeScript 版テストのみ配置（`npm install && npm test`）。HTML 本体を自動更新するものではないので、ロジックを変更する場合は両方を手動で同期する。
- 公開は `gh-pages` ブランチへの反映で行う。

詳細は [CLAUDE.md](./CLAUDE.md) を参照。
