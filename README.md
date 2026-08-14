# dsh-memory-evidence

Git-first memory navigation and bounded evidence tools for DeepSeek Harness.

It provides the portable `rlvr-memory` skill plus two read-only tools:

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
