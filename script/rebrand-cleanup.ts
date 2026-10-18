#!/usr/bin/env bun
// Pass-3 brand cleanup: removes residual upstream "Anomaly" / "anomalyco" branding
// that the bulk passes skipped (localized legal strings, docs, fixtures, scripts).
// Idempotent: safe to run repeatedly.

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dir, "..")
const changed: string[] = []

function edit(file: string, transform: (text: string) => string) {
  const full = path.join(root, file)
  const before = readFileSync(full, "utf8")
  const after = transform(before)
  if (after === before) return
  writeFileSync(full, after)
  changed.push(file)
}

function replace(file: string, from: string, to: string) {
  edit(file, (text) => text.split(from).join(to))
}

// The trademark entity is a placeholder proper noun, so every locale keeps the
// localized sentence but swaps the owner. Copyright values are rewritten whole
// because the translated entity name varies (and is not worth preserving).
for (const entry of readdirSync(path.join(root, "packages/app/src/runtime/i18n"))) {
  if (!entry.endsWith(".ts")) continue
  edit(`packages/app/src/runtime/i18n/${entry}`, (text) =>
    text
      .replace(/^(\s*"settings\.about\.copyright":\s*)"[^"]*"/gm, '$1"© Coder Project"')
      .replace(/Anoma(?:ly|li) Innovations,? Inc\.?/g, "Coder Project"),
  )
}

for (const file of [
  "packages/stats/app/src/i18n.ts",
  ...readdirSync(path.join(root, "packages/stats/app/src/i18n")).map((entry) => `packages/stats/app/src/i18n/${entry}`),
]) {
  if (!file.endsWith(".ts")) continue
  edit(file, (text) => text.replace(/^(\s*"footer\.copyright":\s*)"[^"]*"/gm, '$1"© 2026 Coder Project"'))
}

// Upstream GitHub org in the repository automation tools.
replace(".coder/tool/github-triage.ts", 'const owner = "anomalyco"', 'const owner = "coder-ai"')
replace(".coder/tool/github-pr-search.ts", 'const owner = "anomalyco"', 'const owner = "coder-ai"')

// Homebrew tap install line.
replace("README.md", "brew install anomalyco/tap/coder", "brew install coder-ai/tap/coder")
replace("README.zh.md", "brew install anomalyco/tap/coder", "brew install coder-ai/tap/coder")

// WinGet publisher identity and vendor URL.
replace("script/publish-winget.ts", 'identifier: "Anomaly.Coder"', 'identifier: "Coder.Coder"')
replace("script/publish-winget.ts", 'identifier: "Anomaly.Coder.Desktop"', 'identifier: "Coder.Coder.Desktop"')
replace("script/publish-winget.ts", "https://anoma.ly/", "https://coder.example.com/")

// Web app manifest display name.
replace("packages/ui/src/assets/favicon/site.webmanifest", '"name": "OpenCode"', '"name": "Coder"')
replace("packages/ui/src/assets/favicon/site.webmanifest", '"short_name": "OpenCode"', '"short_name": "Coder"')

// Internal identifiers that still encode the upstream product name.
replace("packages/core/src/tool/plugin/webfetch.ts", "openCodeUserAgent", "coderUserAgent")
replace("packages/stats/app/src/component/agent-meta.tsx", "openCodeOrganization", "coderOrganization")
replace("packages/stats/app/src/routes/index.tsx", "openCodeOrganization", "coderOrganization")

// Social links and internal platform references.
replace("packages/stats/app/src/routes/stats-shell.tsx", "https://www.youtube.com/@anomalyco", "https://www.youtube.com/@coder")
replace("services/update/wrangler.jsonc", "// Shared lake stream from anomalyco/platform/production.", "// Shared lake stream from the Coder platform production account.")
replace("services/update/README.md", "`anomalyco/platform/production` Pulumi stack", "shared platform production Pulumi stack")
replace("services/update/README.md", "a package-aware release published as", "a package-aware release published")
replace("services/update/README.md", "`@opencode-ai/cli` as the minimum", "under the previous package name as the minimum")

// Test fixtures that used the upstream company as an arbitrary workspace label.
for (const file of ["packages/app/src/providers/catalog/console.test.ts"]) {
  replace(file, "Anomaly", "Example")
}
for (const file of ["packages/app/e2e/regression/settings.spec.ts", "packages/app/e2e/regression/composer.spec.ts"]) {
  replace(file, "Anomaly", "Example")
  replace(file, "cred_anomaly", "cred_example")
}

// Workspace lockfile name for the VS Code extension.
replace("sdks/vscode/bun.lock", '"name": "opencode-agent"', '"name": "coder"')

// Homebrew tap metadata and the WinGet installer identity must match what the
// publisher scripts emit, so the updater detects them and the tests stay honest.
replace("packages/cli/script/publish-homebrew.ts", "package: `anomalyco/tap/${name}`", "package: `coder-ai/tap/${name}`")
replace("packages/cli/src/services/updater.ts", 'const wingetPackage = "Anomaly.Coder"', 'const wingetPackage = "Coder.Coder"')
replace("packages/cli/src/services/updater.ts", "published to anomalyco/tap", "published to coder-ai/tap")
replace("packages/cli/src/services/updater.ts", "anomaly\\.coder_", "coder\\.coder_")
for (const file of ["packages/cli/test/retained-image.test.ts", "packages/cli/test/updater-install.test.ts"]) {
  replace(file, "Anomaly.Coder", "Coder.Coder")
  replace(file, "anomalyco/tap", "coder-ai/tap")
}

// AppStream metadata for the Linux desktop packages.
replace("packages/desktop/scripts/copy-metainfo.ts", '<developer id="ly.anoma">', '<developer id="ai.coder">')
replace("packages/desktop/scripts/copy-metainfo.ts", "<name>Anomaly Innovations Inc.</name>", "<name>Coder Project</name>")

// OpenTelemetry resource-attribute fixture used an arbitrary namespace value.
replace("packages/core/test/effect/observability.test.ts", "service.namespace=anomalyco", "service.namespace=coder")
replace("packages/core/test/effect/observability.test.ts", '"service.namespace": "anomalyco"', '"service.namespace": "coder"')

// Residual upstream product names in identifiers, generated icon metadata and
// bundled-asset comments.
replace("packages/session-ui/src/components/markdown-stream.ts", "function openCode(", "function fenceBody(")
replace("packages/session-ui/src/components/markdown-stream.ts", "openCode(code.raw)", "fenceBody(code.raw)")
replace("packages/ui/src/components/provider-icons/sprite.svg", 'id="opencode-go"', 'id="coder-go"')
replace("packages/ui/src/components/provider-icons/sprite.svg", 'id="opencode"', 'id="coder"')
replace("packages/ui/src/components/provider-icons/types.ts", '"opencode-go",', '"coder-go",')
replace("packages/ui/src/components/provider-icons/types.ts", '"opencode",', '"coder",')
replace(
  "patches/@silvia-odwyer%2Fphoton-node@0.3.4.patch",
  "// Allow opencode's Bun compiled binary to point photon-node at its embedded wasm asset.",
  "// Allow Coder's Bun compiled binary to point photon-node at its embedded wasm asset.",
)

console.log(`${changed.length} files changed`)
for (const file of changed) console.log(`  ${file}`)
