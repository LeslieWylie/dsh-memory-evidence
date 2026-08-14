> **⚠️ Archived — merged into [dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit)**
> This repository shipped one of five skills that used to be published as five separate packages. They are now maintained together as a single bundle so nobody has to install — and the ecosystem does not have to index — the same skill five times. Please switch to `dsh-ops-kit`.
>
> **已归档 — 已合并至 [dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit)**
> 本仓库此前是五个独立发布包之一，其功能现已与另外四个包一起合并维护为单一 bundle，避免同一批 skill 被拆成五份重复发布、重复索引。请改用 `dsh-ops-kit`。

---

# dsh-memory-evidence

面向 DeepSeek Harness 的 Git-first memory 与受限证据工具包。

- `dsh_memory_search`：在显式配置的本地根目录中检索关键词。
- `dsh_memory_audit`：审计 Git 状态、未跟踪文件和 credential-like 路径。
- 内置通用 `evidence-memory` skill，强调来源、freshness、review 状态和回读验证。

```bash
npm install dsh-memory-evidence
# 或：pnpm add dsh-memory-evidence
```

配置最小 roots 后加入 DSH profile 的 dependencies 和 bundles。默认不联网、不读取凭据、不改仓库、不自动晋升 memory。

```bash
npm run build && npm run typecheck && npm test && npm pack --dry-run
```
