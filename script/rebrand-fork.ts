#!/usr/bin/env bun
// One-shot fork rebrand: opencode -> coder
//   npm scope  : @opencode/* -> @xcoder/*
//   command    : opencode -> coder (opencode2 -> coder2 legacy shim)
//   env prefix  : OPENCODE_* -> CODER_*
//   dirs/config : ~/.config/opencode -> ~/.config/coder, opencode.json(c) -> coder.json(c), .opencode -> .coder
//   domains     : opencode.ai -> placeholder domains (see BRAND.md)
// Excluded from renaming: .git, patches (except photon wasm define), bun.lock,
// services/{www,changelog}, packages/{web,console,posts}, salesforce, infra, nix, specs, perf, flake.*
import { readdir, rename, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const ROOT = path.resolve(import.meta.dir, "..")

const EXCLUDE_DIRS = new Set([
  ".git",
  "node_modules",
  "patches",
  "bun.lock",
  "salesforce",
  "infra",
  "nix",
  "specs",
  "perf",
  "dist",
  "dist-node",
  "out",
])

// Top-level *files* that are skipped entirely; top-level directories are filtered by
// EXCLUDE_DIRS (walk) and PACKAGE_KEEP / SERVICE_KEEP (per-subtree) instead.
const SKIP_TOP = new Set(["flake.nix", "flake.lock", "bun.lock"])

// For packages/ and services/: only these subdirectories are renamed
const PACKAGE_KEEP = new Set(["web", "console", "posts", "node_modules"])
const SERVICE_KEEP = new Set(["www", "changelog", "node_modules"])

const TEXT_EXT = new Set([
  ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".md", ".mdx",
  ".yml", ".yaml", ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat", ".cmd", ".toml",
  ".txt", ".css", ".html", ".htm", ".astro", ".swift", ".plist", ".desktop", ".xml",
  ".nix", ".editorconfig", ".gitignore", ".gitattributes", ".gitleaksignore", ".license",
])

// sentinel A defined inline in RULES
// sentinel B defined inline in RULES

type Rule = { from: string; to: string; note: string }

// Order matters: sentinels protect external npm scope @opencode-ai (pty prebuilds) and the
// build-time "opencode-ai" tooling references; URL rules run before generic word rules.
const RULES: Rule[] = [
  // --- sentinels: protect external references ---
  { from: "@opencode-ai", to: "@PLACE_A", note: "protect @opencode-ai scope (external dep)" },
  { from: "opencode-ai", to: "PLACE_B", note: "protect bare opencode-ai (npm tooling refs)" },

  // --- URLs / infrastructure endpoints ---
  { from: "https://opencode.ai/update/api", to: "https://releases.coder.example.com/update/api", note: "update API" },
  { from: "https://opencode.ai/files/bin", to: "https://releases.coder.example.com/files/bin", note: "binary files" },
  { from: "https://opencode.ai/v2/install", to: "https://coder.example.com/install", note: "install script URL" },
  { from: "opencode.ai", to: "coder.example.com", note: "remaining website URLs" },
  { from: "raw.githubusercontent.com/anomalyco/opencode", to: "raw.githubusercontent.com/coder-ai/coder", note: "raw repo URL" },
  { from: "ghcr.io/anomalyco/opencode", to: "registry.coder.example.com/coder", note: "container image" },
  { from: "github.com/anomalyco/opencode", to: "github.com/coder-ai/coder", note: "repo URL" },
  { from: "anomalyco/opencode", to: "coder-ai/coder", note: "remaining repo refs" },
  { from: "anomalyco/homebrew-tap", to: "coder-ai/homebrew-tap", note: "homebrew tap" },

  // --- npm scope ---
  { from: "@opencode/", to: "@xcoder/", note: "npm scope @opencode/* -> @xcoder/*" },

  // --- env prefix / compile-time defines ---
  { from: "OPENCODE_", to: "CODER_", note: "env prefix OPENCODE_* -> CODER_*" },

  // --- display names ---
  { from: "OpenCode", to: "Coder", note: "display name" },
  { from: "Opencode", to: "Coder", note: "identifier form Opencode* (registerOpencodeSpinner etc.)" },

  // --- lowercase word rules (ordered, narrow to broad) ---
  { from: "opencode.json", to: "coder.json", note: "config file name (jsonc also matched)" },
  { from: "opencode-desktop", to: "coder-desktop", note: "desktop artifacts" },
  { from: "opencode-cli", to: "coder-cli", note: "cli artifact/staging names" },
  { from: "opencode2", to: "coder2", note: "legacy shim" },
  { from: ".opencode", to: ".coder", note: "project dir + app ids (ai.opencode.desktop)" },
  { from: "opencode-", to: "coder-", note: "archive names opencode-<target>" },
  { from: "bin/opencode", to: "bin/coder", note: "binary paths" },
  { from: "\"opencode\"", to: "\"coder\"", note: "quoted command/app name" },
  { from: "'opencode'", to: "'coder'", note: "quoted command/app name" },
  { from: "ProgramData\\opencode", to: "ProgramData\\coder", note: "Windows machine config" },
  { from: "APP=opencode", to: "APP=coder", note: "install script var" },
  { from: "SOURCE_APP=opencode", to: "SOURCE_APP=coder", note: "install script var" },

  // --- restore sentinels ---
  { from: "@PLACE_A@", to: "@opencode-ai", note: "restore external scope" },
  { from: "PLACE_B", to: "opencode-ai", note: "restore npm tooling refs" },
]

const FILE_RENAMES: Array<{ from: string; to: string }> = [
  { from: "packages/cli/bin/opencode.cjs", to: "packages/cli/bin/coder.cjs" },
  { from: "packages/cli/bin/opencode2.cjs", to: "packages/cli/bin/coder2.cjs" },
  { from: "packages/desktop/resources/linux/opencode-desktop.desktop", to: "packages/desktop/resources/linux/coder-desktop.desktop" },
  { from: ".opencode", to: ".coder" },
]

function isTextFile(name: string) {
  const ext = path.extname(name).toLowerCase()
  if (ext === "") return true // extensionless (install, LICENSE, Makefile...)
  return TEXT_EXT.has(ext)
}

function included(rel: string) {
  const top = rel.split(path.sep)[0]
  if (SKIP_TOP.has(top)) return false
  const parts = rel.split(path.sep)
  if (parts[0] === "packages" && parts.length > 1 && PACKAGE_KEEP.has(parts[1])) return false
  if (parts[0] === "services" && parts.length > 1 && SERVICE_KEEP.has(parts[1])) return false
  for (const part of parts) if (EXCLUDE_DIRS.has(part)) return false
  return true
}

async function* walkFiles(dir: string): AsyncGenerator<string> {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(ROOT, full)
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue
      if (!included(rel + path.sep + "_")) continue
      yield* walkFiles(full)
    } else if (entry.isFile()) {
      if (!included(rel)) continue
      if (!isTextFile(entry.name)) continue
      yield full
    }
  }
}

let changed = 0
const perRule = new Map<string, number>()
for (const rule of RULES) perRule.set(rule.note, 0)

for await (const file of walkFiles(ROOT)) {
  const rel = path.relative(ROOT, file)
  if (rel === path.join("script", "rebrand-fork.ts")) continue
  const before = await readFile(file, "utf8")
  let after = before
  for (const rule of RULES) {
    if (!after.includes(rule.from)) continue
    const hits = after.split(rule.from).length - 1
    perRule.set(rule.note, (perRule.get(rule.note) ?? 0) + hits)
    after = after.split(rule.from).join(rule.to)
  }
  if (after !== before) {
    await writeFile(file, after)
    changed++
  }
}

// File / directory renames (deepest first so nested paths stay valid)
for (const item of [...FILE_RENAMES].reverse()) {
  const from = path.join(ROOT, item.from)
  const to = path.join(ROOT, item.to)
  try {
    await rename(from, to)
    console.log(`renamed: ${item.from} -> ${item.to}`)
  } catch {}
}

// Photon wasm define must stay in sync with patches/@silvia-odwyer%2Fphoton-node@0.3.4.patch
const photonPatch = path.join(ROOT, "patches", "@silvia-odwyer%2Fphoton-node@0.3.4.patch")
try {
  const patch = await readFile(photonPatch, "utf8")
  const next = patch.split("__OPENCODE_PHOTON_WASM_PATH").join("__CODER_PHOTON_WASM_PATH")
  if (next !== patch) {
    await writeFile(photonPatch, next)
    console.log("patched: photon-node patch (__OPENCODE_PHOTON_WASM_PATH -> __CODER_PHOTON_WASM_PATH)")
  }
} catch {}

console.log(`\nfiles changed: ${changed}`)
console.log("\nrule hits:")
for (const [note, count] of perRule) if (count) console.log(`  ${count.toString().padStart(6)}  ${note}`)

// Leftover report: remaining case-insensitive "opencode" matches in included dirs
console.log("\nleftover matches (manual review):")
let leftovers = 0
for await (const file of walkFiles(ROOT)) {
  const rel = path.relative(ROOT, file)
  if (rel === path.join("script", "rebrand-fork.ts")) continue
  const text = await readFile(file, "utf8")
  const lines = text.split("\n")
  for (let i = 0; i < lines.length; i++) {
    if (/opencode/i.test(lines[i])) {
      if (leftovers < 200) console.log(`  ${rel}:${i + 1}: ${lines[i].trim().slice(0, 140)}`)
      leftovers++
    }
  }
}
console.log(`total leftover lines: ${leftovers}`)
