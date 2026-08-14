> **⚠️ Archived — merged into [dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit)**
> This repository shipped one of five skills that used to be published as five separate packages. They are now maintained together as a single bundle so nobody has to install — and the ecosystem does not have to index — the same skill five times. Please switch to `dsh-ops-kit`.
>
> **已归档 — 已合并至 [dsh-ops-kit](https://github.com/LeslieWylie/dsh-ops-kit)**
> 本仓库此前是五个独立发布包之一，其功能现已与另外四个包一起合并维护为单一 bundle，避免同一批 skill 被拆成五份重复发布、重复索引。请改用 `dsh-ops-kit`。

---

# dsh-memory-evidence

Git-first memory navigation and bounded evidence tools for DeepSeek Harness.

It provides the portable `evidence-memory-memory` skill plus two read-only tools:

- `dsh_memory_search`: keyword search in explicitly configured local roots.
- `dsh_memory_audit`: Git cleanliness, untracked-file, and credential-path audit.

```bash
npm install dsh-memory-evidence
# or: pnpm add dsh-memory-evidence
```

Add `dsh-memory-evidence` to the profile dependencies and `dsh.profile.bundles`. Configure narrow `roots`; no network, credential reads, repository writes, or automatic memory promotion are performed.

```bash
npm run build && npm run typecheck && npm test && npm pack --dry-run
```

The package is an independent, npm-ready contribution. It contains no private repository data, machine paths, tokens, or generated run archives.
