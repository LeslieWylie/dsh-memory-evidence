# Architecture

`dsh-memory-evidence` is a read-oriented memory and provenance layer for DSH.

- The skill defines a Git-first evidence workflow: inspect health, search a bounded scope, then read the cited source.
- `dsh_memory_search` performs bounded keyword lookup under explicitly configured roots. It does not crawl the home directory or write memory.
- `dsh_memory_audit` reports repository state and credential-like paths so a handoff can be reviewed before publication.
- Storage, indexing, and synchronization remain outside this package. Consumers can connect their own repository-memory backend without changing the tool contract.

The package intentionally does not expose credentials, automatic memory promotion, remote writes, or project-specific paths.
