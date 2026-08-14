# dsh-memory-evidence

面向 DeepSeek Harness 的 Git-first memory 与受限证据工具包。

- `dsh_memory_search`：在显式配置的本地根目录中检索关键词。
- `dsh_memory_audit`：审计 Git 状态、未跟踪文件和 credential-like 路径。
- 内置通用 `rlvr-memory` skill，强调来源、freshness、review 状态和回读验证。

```bash
npm install dsh-memory-evidence
# 或：pnpm add dsh-memory-evidence
```

配置最小 roots 后加入 DSH profile 的 dependencies 和 bundles。默认不联网、不读取凭据、不改仓库、不自动晋升 memory。

```bash
npm run build && npm run typecheck && npm test && npm pack --dry-run
```
