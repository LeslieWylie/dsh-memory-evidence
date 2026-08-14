import assert from 'node:assert/strict'
import { mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { apply } from '../src/index.ts'

function fakeContext() {
  const tools: Array<{ definition: { name: string; execute: (args: Record<string, unknown>) => Promise<unknown> | unknown } }> = []
  return { tools: { register(definition: typeof tools[number]['definition']) { tools.push({ definition }) } }, skills: { register() {} }, registered: tools }
}

test('registers memory search and audit tools', () => {
  const context = fakeContext(); apply(context as never)
  assert.deepEqual(context.registered.map(x => x.definition.name), ['dsh_memory_search', 'dsh_memory_audit'])
})

test('searches a bounded configured root', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dsh-memory-evidence-'))
  await writeFile(join(root, 'memory.md'), '# Provenance\nvalidated source evidence\n', 'utf8')
  const context = fakeContext(); apply(context as never, { roots: [root] })
  const value = await context.registered[0]!.definition.execute({ query: 'validated evidence' }) as Record<string, unknown>
  assert.equal(value.ok, true); assert.equal((value.hits as unknown[]).length, 1)
})
