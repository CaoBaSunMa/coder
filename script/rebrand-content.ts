#!/usr/bin/env bun
// Third-pass fork rebrand: the content sites and console that the first two passes skipped
// (packages/{web,console,posts}, services/{www,changelog}).
//
// The first two passes covered code and docs that ship in the CLI/desktop packages. This pass
// covers the marketing/docs sites, the console app, the changelog worker and the posts worker.
//
// Protected (never renamed) because they are third-party published identifiers:
//   @opencode-ai/pty*                     upstream prebuilt PTY natives (installed from npm)
//   @brendonovich/vite-plugin-opencode    build-time Vite plugin
// The GitLab CI component string in the docs is an example, not a dependency, so it is
// rebranded along with everything else (nagyv/gitlab-coder/coder).
// License and notice files are skipped: MIT attribution stays intact.
import { readdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

const DRY = process.argv.includes("--dry")

const TARGETS = ["packages/web", "packages/console", "packages/posts", "services/www", "services/changelog"]

const SKIP_DIRS = new Set([
  ".astro",
  ".git",
  ".sst",
  ".turbo",
  ".wrangler",
  "dist",
  "dist-node",
  "node_modules",
  "out",
])

const TEXT_EXT = new Set([
  ".astro",
  ".bash",
  ".cjs",
  ".css",
  ".html",
  ".js",
  ".json",
  ".jsonc",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".ps1",
  ".sh",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".yaml",
  ".yml",
])

const LEGAL = /(^|[\\/])(LICENSE|LICENCE|COPYING|NOTICE|LICENSES|THIRD-PARTY)(\.[a-z0-9]+)?$/i

// Sentences that carry upstream's V1/V2 product split. A mechanical rename would leave
// "Coder 1 and Coder 2", which describes a product we do not ship, so they are rewritten to
// describe a single product. Applied before the word rules.
const PHRASES: Array<{ from: string; to: string }> = [
  {
    from:
      "OpenCode 1 and OpenCode 2 both use the `opencode` command and cannot be installed side by side under their default command.\n" +
      "See the [OpenCode 2 docs](https://opencode.ai/v2/docs/) to migrate to V2.",
    to: "Every Coder install method provides the same `coder` command, so previous installations can conflict.\n" +
      "See the [Coder docs](https://coder.example.com/v2/docs/) to get started.",
  },
  {
    from: "The easiest way to install OpenCode 1 is through the install script. These installation methods provide the `opencode`\nbinary and can conflict with or replace an OpenCode 2 installation.",
    to: "The easiest way to install Coder is through the install script. These installation methods provide the `coder`\nbinary and can conflict with or replace an existing Coder installation.",
  },
  {
    from: "OpenCode 1 and OpenCode 2 both use the `opencode` command and are no longer installed side by side by default. Remove a\npackage-managed V1 installation before installing V2; the V2 curl installer replaces the V1 binary.",
    to: "Coder uses the `coder` command and is no longer installed side by side with a previous release by default. Remove a\npackage-managed previous installation before installing the current release; the curl installer replaces the previous binary.",
  },
  {
    from: "OpenCode 2 has a revised, more ergonomic server API and a new set of clients.",
    to: "Coder has a revised, more ergonomic server API and a new set of clients.",
  },
  { from: "older versions install OpenCode 1.", to: "older versions install an earlier release." },
  {
    from: "Migrating an existing OpenCode 1 plugin?",
    to: "Migrating a plugin written for an earlier release?",
  },
  { from: "OpenCode 1 release notes are on GitHub Releases", to: "Coder release notes are on GitHub Releases" },
]

type Rule = { from: string; to: string; note: string }

const PTY = "\u0001pty\u0001"
const VITE = "\u0001vite\u0001"

// Order matters: sentinels protect third-party identifiers, URL rules run before generic word rules.
const RULES: Rule[] = [
  // --- sentinels: third-party published identifiers ---
  { from: "@opencode-ai/pty", to: PTY, note: "keep upstream PTY natives" },
  { from: "vite-plugin-opencode", to: VITE, note: "keep third-party vite plugin" },

  // --- URLs / infrastructure endpoints ---
  { from: "https://opencode.ai/update/api", to: "https://releases.coder.example.com/update/api", note: "update API" },
  { from: "https://opencode.ai/files/bin", to: "https://releases.coder.example.com/files/bin", note: "binary files" },
  { from: "https://opencode.ai/v2/install", to: "https://coder.example.com/install", note: "install script URL" },
  { from: "opencode.ai", to: "coder.example.com", note: "remaining website URLs" },

  // --- repositories / distribution ---
  { from: "raw.githubusercontent.com/anomalyco/opencode", to: "raw.githubusercontent.com/coder-ai/coder", note: "raw repo URL" },
  { from: "raw.githubusercontent.com/sst/opencode", to: "raw.githubusercontent.com/coder-ai/coder", note: "raw repo URL (old org)" },
  { from: "ghcr.io/anomalyco/opencode", to: "registry.coder.example.com/coder", note: "container image" },
  { from: "github.com/anomalyco/opencode", to: "github.com/coder-ai/coder", note: "repo URL" },
  { from: "github.com/sst/opencode", to: "github.com/coder-ai/coder", note: "repo URL (old org)" },
  { from: "anomalyco/opencode", to: "coder-ai/coder", note: "remaining repo refs" },
  { from: "sst/opencode", to: "coder-ai/coder", note: "repo refs (old org)" },
  { from: "anomalyco/homebrew-tap", to: "coder-ai/homebrew-tap", note: "homebrew tap" },
  { from: "anomalyco/tap/opencode-v2", to: "coder-ai/tap/coder", note: "homebrew v2 formula" },
  { from: "anomalyco/tap/opencode-beta", to: "coder-ai/tap/coder-beta", note: "homebrew beta formula" },
  { from: "anomalyco/tap/opencode", to: "coder-ai/tap/coder", note: "homebrew v1 formula" },
  { from: "sst/tap/opencode", to: "coder-ai/tap/coder", note: "homebrew tap (old org)" },
  { from: "anoma.ly", to: "coder.example.com", note: "short domain / email" },
  { from: "anomalyco", to: "coder-ai", note: "remaining org refs" },

  // --- npm packages ---
  { from: "@opencode-ai/", to: "@xcoder/", note: "npm scope @opencode-ai/* -> @xcoder/*" },
  { from: "@opencode/", to: "@xcoder/", note: "npm scope @opencode/* -> @xcoder/*" },
  { from: "opencode-ai", to: "@xcoder/cli", note: "CLI npm package name" },

  // --- env prefix / compile-time defines ---
  { from: "OPENCODE_", to: "CODER_", note: "env prefix OPENCODE_* -> CODER_*" },
  { from: "OPENCODE", to: "CODER", note: "bare uppercase env token" },

  // --- display names ---
  { from: "OpenCode", to: "Coder", note: "display name" },
  { from: "Opencode", to: "Coder", note: "identifier form Opencode*" },

  // --- lowercase word rules (ordered, narrow to broad) ---
  { from: "opencode.json", to: "coder.json", note: "config file name" },
  { from: "opencode-desktop", to: "coder-desktop", note: "desktop artifacts" },
  { from: "opencode-cli", to: "coder-cli", note: "cli artifacts" },
  { from: "opencode2", to: "coder2", note: "legacy shim" },
  { from: ".opencode", to: ".coder", note: "project dir + app ids" },
  { from: "opencode-v2", to: "coder", note: "product v2 name" },
  { from: "opencode-beta", to: "coder-beta", note: "beta channel name" },
  { from: "opencode-", to: "coder-", note: "artifact names" },
  { from: "bin/opencode", to: "bin/coder", note: "binary paths" },
  { from: "/opencode", to: "/coder", note: "config/data paths" },
  { from: '"opencode"', to: '"coder"', note: "quoted command/app name" },
  { from: "'opencode'", to: "'coder'", note: "quoted command/app name" },
  { from: "opencode", to: "coder", note: "generic word" },

  // --- restore sentinels ---
  { from: PTY, to: "@opencode-ai/pty", note: "restore upstream PTY natives" },
  { from: VITE, to: "vite-plugin-opencode", note: "restore third-party vite plugin" },
]

function isTextFile(name: string) {
  return TEXT_EXT.has(path.extname(name).toLowerCase())
}

function isLegalFile(rel: string) {
  return LEGAL.test(rel.replaceAll(path.sep, "/"))
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(full)
    else if (entry.isFile()) yield full
  }
}

let changed = 0
const hits = new Map<string, number>()
const phraseHits = new Map<string, number>()

for (const target of TARGETS) {
  for await (const file of walk(path.join(ROOT, target))) {
    if (!isTextFile(path.basename(file))) continue
    if (isLegalFile(path.relative(ROOT, file))) continue
    const before = await readFile(file, "utf8")
    if (before.includes("\u0000")) continue
    let after = before
    for (const phrase of PHRASES) {
      if (!after.includes(phrase.from)) continue
      phraseHits.set(phrase.from.slice(0, 48), (phraseHits.get(phrase.from.slice(0, 48)) ?? 0) + 1)
      after = after.split(phrase.from).join(phrase.to)
    }
    for (const rule of RULES) {
      if (!after.includes(rule.from)) continue
      hits.set(rule.note, (hits.get(rule.note) ?? 0) + after.split(rule.from).length - 1)
      after = after.split(rule.from).join(rule.to)
    }
    if (after === before) continue
    changed++
    if (!DRY) await writeFile(file, after)
  }
}

// File names that carry the upstream word.
const renames: Array<{ from: string; to: string }> = []
for (const target of TARGETS) {
  const dir = path.join(ROOT, target)
  const walkNames = async (current: string) => {
    for (const entry of await readdir(current, { withFileTypes: true })) {
      if (SKIP_DIRS.has(entry.name)) continue
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        await walkNames(full)
        continue
      }
      if (!/opencode/i.test(entry.name)) continue
      renames.push({ from: full, to: path.join(current, entry.name.replace(/opencode/gi, "coder")) })
    }
  }
  await walkNames(dir)
}

for (const item of renames) {
  if (DRY) continue
  await rename(item.from, item.to)
}

// Leftover report: text files still mentioning the upstream brand.
const leftovers: string[] = []
for (const target of TARGETS) {
  for await (const file of walk(path.join(ROOT, target))) {
    if (!isTextFile(path.basename(file))) continue
    const text = await readFile(file, "utf8")
    if (text.includes("\u0000")) continue
    const lines = text.split("\n")
    for (let index = 0; index < lines.length; index++) {
      if (/opencode|anomalyco|anoma\.ly|Anomaly/i.test(lines[index])) {
        leftovers.push(`${path.relative(ROOT, file)}:${index + 1}: ${lines[index].trim().slice(0, 160)}`)
      }
    }
  }
}

console.log(`${DRY ? "[dry run] " : ""}files changed: ${changed}`)
console.log(`files renamed: ${renames.length}`)
console.log("\ntargeted phrase fixes:")
for (const [note, count] of phraseHits) console.log(`  ${count.toString().padStart(4)}  ${note}...`)
console.log("\nrule hits:")
for (const [note, count] of [...hits].sort((a, b) => b[1] - a[1])) console.log(`  ${count.toString().padStart(6)}  ${note}`)
console.log(`\nleftover lines (${leftovers.length}):`)
for (const line of leftovers.slice(0, 60)) console.log(`  ${line}`)
