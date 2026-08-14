import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { readFile, readdir, stat } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { JsonValue } from '@deepseek-ai/dsh-tools'
import type { Context } from '@deepseek-ai/cordis'
import type { SkillRegistration } from '@deepseek-ai/dsh-skill'

const execFileAsync = promisify(execFile)
const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SKILL_PATH = 'skills/rlvr-memory/SKILL.md'
const SKILL: SkillRegistration = {
  name: 'rlvr-memory',
  description: 'Git-first memory navigation with source provenance, freshness, and read-back validation.',
  whenToUse: 'Load when a task needs durable repository knowledge or evidence-backed memory retrieval.',
  source: 'dsh-memory-evidence',
  path: join(PACKAGE_ROOT, SKILL_PATH),
  content: readFileSync(join(PACKAGE_ROOT, SKILL_PATH), 'utf8'),
  invocation: { modelInvocable: true, userInvocable: true },
}

export interface Config {
  roots?: string[]
  maxFiles?: number
  maxBytesPerFile?: number
}

type JsonObject = Record<string, unknown>
const TEXT_EXTENSIONS = new Set(['.md', '.mdx', '.txt', '.yaml', '.yml', '.json', '.jsonl', '.toml', '.ts', '.tsx', '.js', '.mjs', '.sh', '.py'])
const EXCLUDED_DIRS = new Set(['.git', 'node_modules', 'output', 'runs', 'secrets', 'tmp', 'dist', 'build', '__pycache__'])
const SECRET_PARTS = ['.env', 'secret', 'token', 'credential', 'password', 'api_key', 'private_key', '.pem', '.key']

const asJson = (value: unknown): JsonValue => value as JsonValue
const clean = (value: unknown, max = 1000) => typeof value === 'string' ? value.trim().slice(0, max) : ''
const safePath = (value: string) => !SECRET_PARTS.some(part => value.toLowerCase().includes(part))
const within = (root: string, candidate: string) => {
  const rel = relative(root, candidate)
  return rel === '' || (!isAbsolute(rel) && rel !== '..' && !rel.startsWith(`..${'/'}`))
}

function rootsFor(config: Config): string[] {
  const roots = config.roots?.filter(Boolean).map(value => resolve(value))
  return roots?.length ? roots : [process.cwd()]
}

function assertPath(value: string, roots: string[]): string {
  const candidate = resolve(value)
  if (!safePath(candidate)) throw new Error('refusing to inspect a credential-like path')
  if (!roots.some(root => within(root, candidate))) throw new Error(`path is outside configured roots: ${candidate}`)
  return candidate
}

async function walk(root: string, maxFiles: number): Promise<string[]> {
  const files: string[] = []
  async function visit(dir: string, depth: number): Promise<void> {
    if (depth > 6 || files.length >= maxFiles) return
    let entries
    try { entries = await readdir(dir, { withFileTypes: true }) } catch { return }
    entries.sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      if (files.length >= maxFiles) return
      if (entry.name.startsWith('.') && entry.name !== '.agents') continue
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        if (!EXCLUDED_DIRS.has(entry.name)) await visit(path, depth + 1)
      } else if (TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) files.push(path)
    }
  }
  await visit(root, 0)
  return files
}

export function apply(ctx: Context, config: Config = {}): void {
  const roots = rootsFor(config)
  const maxFiles = config.maxFiles ?? 120
  const maxBytes = config.maxBytesPerFile ?? 160_000
  ctx.skills.register(SKILL)

  ctx.tools.register(defineTool({
    name: 'dsh_memory_search',
    description: 'Search bounded local Markdown/code roots for all supplied keywords. Read-only and credential-path aware.',
    parameters: {
      query: { type: 'string', required: true, description: 'Space-separated terms; every term must match.' },
      root: { type: 'string', description: 'Optional subdirectory inside configured roots.' },
      limit: { type: 'integer', description: 'Maximum hits, 1..50.' },
    },
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }] },
    async execute(args) {
      const terms = clean(args.query, 500).toLowerCase().split(/\s+/).filter(Boolean)
      if (!terms.length) throw new Error('query must not be empty')
      const limit = Math.min(50, Math.max(1, Number(args.limit ?? 20)))
      const searchRoot = args.root ? assertPath(String(args.root), roots) : roots[0]!
      const files = await walk(searchRoot, maxFiles)
      const hits: JsonObject[] = []
      for (const file of files) {
        if (!safePath(file)) continue
        let content: string
        try { content = await readFile(file, 'utf8') } catch { continue }
        if (Buffer.byteLength(content) > maxBytes) content = content.slice(0, maxBytes)
        if (!terms.every(term => content.toLowerCase().includes(term))) continue
        const snippets = content.split('\n').map((line, i) => ({ line: i + 1, text: line.trim().slice(0, 300) }))
          .filter(item => terms.some(term => item.text.toLowerCase().includes(term))).slice(0, 8)
        hits.push({ path: file, relative: relative(searchRoot, file), snippets })
        if (hits.length >= limit) break
      }
      return asJson({ ok: true, root: searchRoot, query: terms, scanned_files: files.length, hits, truncated: hits.length >= limit })
    },
  }))

  ctx.tools.register(defineTool({
    name: 'dsh_memory_audit',
    description: 'Audit a configured Git repository for dirty state, untracked files, and credential-like paths without modifying it.',
    parameters: { path: { type: 'string', required: true, description: 'Repository path inside configured roots.' } },
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }] },
    async execute(args) {
      const repository = assertPath(String(args.path), roots)
      const info = await stat(repository).catch(() => undefined)
      if (!info?.isDirectory()) throw new Error(`not a directory: ${repository}`)
      const git = await execFileAsync('git', ['-C', repository, 'status', '--short', '--branch'], { timeout: 3000, maxBuffer: 100_000 }).catch(error => ({ stdout: '', stderr: String(error) }))
      const files = await walk(repository, Math.min(maxFiles, 80))
      const sensitive = files.filter(file => !safePath(file)).map(file => relative(repository, file))
      const untracked = String(git.stdout).split('\n').filter(line => line.startsWith('?? ')).map(line => line.slice(3)).slice(0, 100)
      return asJson({ ok: true, repository, git_status: String(git.stdout).trim(), untracked, sensitive_candidates: sensitive,
        release_blockers: [...(untracked.length ? ['review untracked files'] : []), ...(sensitive.length ? ['exclude credential-like paths'] : []), ...(String(git.stderr).trim() ? ['git status failed'] : [])] })
    },
  }))
}
