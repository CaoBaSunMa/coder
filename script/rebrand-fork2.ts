#!/usr/bin/env bun
// Second-pass fork rebrand: the bare lowercase `opencode` word, identifiers, and file names.
//
// The first pass (script/rebrand-fork.ts) only covered URLs, the npm scope, the OPENCODE_ env
// prefix, display names, and a handful of dotted/quoted forms. Lowercase `opencode` survived in
// plugin ids (`opencode.provider.*`), virtual module ids, storage keys, CLI help strings, file and
// directory names, and test fixtures.
//
// Protected (never renamed) external references:
//   @opencode-ai/*            published prebuilt natives (pty, schema, client, protocol)
//   @brendonovich/vite-plugin-opencode
//
// Excluded subtrees keep upstream branding by design; see BRAND.md.
import { readdir, rename, readFile, stat, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dir, "..")

const EXCLUDE_PARTS = new Set([
  ".git",
  "node_modules",
  "dist",
  "dist-node",
  "out",
  "patches",
])

// Subtrees intentionally left on upstream branding (later milestone).
const EXCLUDE_PREFIXES = [
  "github/",
  "nix/",
  "infra/",
  "specs/",
  "perf/",
  "docs/",
  "patches/",
  "packages/web/",
  "packages/console/",
  "packages/posts/",
  "services/www/",
  "services/changelog/",
  ".coder/glossary/",
]

const EXCLUDE_FILES = new Set([
  "bun.lock",
  "flake.nix",
  "flake.lock",
  "CHANGELOG.md",
  ".github/workflows/opencode.yml",
])

const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".md", ".mdx",
  ".yml", ".yaml", ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd", ".toml",
  ".txt", ".css", ".html", ".htm", ".astro", ".swift", ".plist", ".desktop", ".xml",
  ".nix", ".editorconfig", ".gitignore", ".gitattributes", ".gitleaksignore", ".license",
])

const SENTINEL_A = "\uE000A\uE001" // @opencode-ai
const SENTINEL_B = "\uE000B\uE001" // vite-plugin-opencode

type Rule = { from: string; to: string; note: string }

const RULES: Rule[] = [
  { from: "@opencode-ai", to: SENTINEL_A, note: "protect @opencode-ai scope" },
  { from: "vite-plugin-opencode", to: SENTINEL_B, note: "protect vite-plugin-opencode" },
  { from: "OPENCODE", to: "CODER", note: "env prefix / constants" },
  { from: "Opencode", to: "Coder", note: "identifier form" },
  { from: "OpenCode", to: "Coder", note: "display name" },
  { from: "opencode", to: "coder", note: "bare word, ids, paths, storage keys" },
  { from: SENTINEL_A, to: "@opencode-ai", note: "restore @opencode-ai" },
  { from: SENTINEL_B, to: "vite-plugin-opencode", note: "restore vite-plugin-opencode" },
]

function isTextFile(name: string) {
  const ext = path.extname(name).toLowerCase()
  if (ext === "") return true
  return TEXT_EXT.has(ext)
}

const args = process.argv.slice(2)
const skipArg = args.indexOf("--skip")
if (skipArg !== -1) {
  for (const item of args.slice(skipArg + 1)) EXCLUDE_PREFIXES.push(item.endsWith("/") ? item : item + "/")
}
const onlyArg = args.indexOf("--only")
const ONLY = onlyArg === -1 ? undefined : args.slice(onlyArg + 1)

function excluded(rel: string) {
  if (EXCLUDE_FILES.has(rel)) return true
  const posix = rel.split(path.sep).join("/")
  if (ONLY) {
    const keep = ONLY.some((prefix) => {
      const p = prefix.endsWith("/") ? prefix : prefix + "/"
      return posix === prefix || posix.startsWith(p) || p.startsWith(posix + "/")
    })
    if (!keep) return true
  }
  if (EXCLUDE_PREFIXES.some((prefix) => posix.startsWith(prefix))) return true
  for (const part of rel.split(path.sep)) if (EXCLUDE_PARTS.has(part)) return true
  return false
}

// File/directory names that must keep upstream spelling.
function protectedName(name: string) {
  const lower = name.toLowerCase()
  return lower.includes("opencode-ai") || lower.includes("vite-plugin-opencode")
}

function renamedName(name: string) {
  if (protectedName(name)) return name
  return name
    .split("OPENCODE").join("CODER")
    .split("Opencode").join("Coder")
    .split("OpenCode").join("Coder")
    .split("opencode").join("coder")
}

async function* walk(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(ROOT, full)
    if (excluded(rel)) continue
    if (entry.isDirectory()) yield* walk(full)
    else if (entry.isFile()) yield full
  }
}

// --- content pass ---
const perRule = new Map<string, number>()
for (const rule of RULES) perRule.set(rule.note, 0)
let changed = 0

for await (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file)
  if (rel === path.join("script", "rebrand-fork.ts")) continue
  if (rel === path.join("script", "rebrand-fork2.ts")) continue
  if (!isTextFile(file)) continue
  const before = await readFile(file, "utf8")
  let after = before
  for (const rule of RULES) {
    if (!after.includes(rule.from)) continue
    perRule.set(rule.note, (perRule.get(rule.note) ?? 0) + (after.split(rule.from).length - 1))
    after = after.split(rule.from).join(rule.to)
  }
  if (after !== before) {
    await writeFile(file, after)
    changed++
  }
}

// --- rename pass (deepest first so parents stay valid) ---
const dirs: string[] = []
const files: string[] = []
async function collect(dir: string) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(ROOT, full)
    if (excluded(rel)) continue
    if (entry.isDirectory()) {
      await collect(full)
      dirs.push(full)
    } else if (entry.isFile()) files.push(full)
  }
}
await collect(ROOT)

const renamed: string[] = []
const collisions: string[] = []
const taken = new Set(files.map((f) => path.relative(ROOT, f).toLowerCase()))

for (const item of [...files, ...dirs]) {
  const dir = path.dirname(item)
  const name = path.basename(item)
  const next = renamedName(name)
  if (next === name) continue
  const target = path.join(dir, next)
  const targetRel = path.relative(ROOT, target).toLowerCase()
  // Never overwrite a pre-existing sibling: both `taken` (original listing) and a stat probe matter.
  const exists = taken.has(targetRel) || (await stat(target).then(() => true, () => false))
  if (exists) {
    collisions.push(`${path.relative(ROOT, item)} -> ${path.relative(ROOT, target)}`)
    continue
  }
  try {
    await rename(item, target)
    renamed.push(path.relative(ROOT, item) + " -> " + path.relative(ROOT, target))
  } catch (error) {
    collisions.push(`${path.relative(ROOT, item)} -> ${path.relative(ROOT, target)}: ${error}`)
  }
}

console.log(`\nfiles changed: ${changed}`)
console.log(`paths renamed: ${renamed.length}`)
console.log("\nrule hits:")
for (const [note, count] of perRule) if (count) console.log(`  ${count.toString().padStart(6)}  ${note}`)
console.log("\nrenamed paths:")
for (const item of renamed) console.log(`  ${item}`)
if (collisions.length) {
  console.log("\nskipped (target exists):")
  for (const item of collisions) console.log(`  ${item}`)
}
