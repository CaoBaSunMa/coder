import { execFile } from "node:child_process"
import { readdir, stat } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { promisify } from "node:util"

import type { CustomMacSignOptions } from "app-builder-lib"
import { Arch, type Configuration } from "electron-builder"
import { NativeArch } from "../../script/native-arch"
import { CLI_BINARIES, getCurrentCli, nodePtyPackage } from "./scripts/utils"

const execFileAsync = promisify(execFile)

const packageDir = path.dirname(fileURLToPath(import.meta.url))

const rootDir = path.resolve(packageDir, "../..")

const signScript = path.join(rootDir, "script", "sign-windows.ps1")

// The Electron 42 packaging update briefly installed Linux launchers/icons under
// "coder-desktop". Keep that hidden desktop entry around so existing GNOME/KDE
// pins still resolve after the canonical app id changes back to ai.coder.desktop.
const legacyDesktopEntry = path.join(packageDir, "resources", "linux", "coder-desktop.desktop")

const legacyDesktopEntryFpm = `${legacyDesktopEntry}=/usr/share/applications/coder-desktop.desktop`

const metainfoFpm = (appId: string) =>
  `${path.join(packageDir, "resources", `${appId}.metainfo.xml`)}=/usr/share/metainfo/${appId}.metainfo.xml`

async function signWindows(configuration: { path: string }) {
  if (process.platform !== "win32") return

  if (process.env.GITHUB_ACTIONS !== "true") return

  await execFileAsync(
    "pwsh",
    ["-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", signScript, configuration.path],
    { cwd: rootDir, windowsHide: true },
  )
}

function macSignOptions(options: CustomMacSignOptions): CustomMacSignOptions {
  return {
    ...options,
    optionsForFile: (file) => {
      const defaults = options.optionsForFile?.(file)

      if (file !== path.join(options.app, "Contents/Resources/coder-cli")) return defaults ?? {}

      // The Bun CLI loads bun-pty's native library; Electron and its helpers do not need this exception.
      return { ...defaults, entitlements: path.join(packageDir, "resources/entitlements.cli.plist") }
    },
  }
}

function resolveChannel() {
  const raw = process.env.CODER_CHANNEL

  if (raw === "dev" || raw === "beta" || raw === "prod") return raw

  if (raw === "latest") return "prod"

  return "dev"
}

const APP_IDS = {
  dev: "ai.coder.desktop.dev",
  beta: "ai.coder.desktop.beta",
  prod: "ai.coder.desktop",
} as const

const getBase = (appId: string): Configuration => {
  const target = getCurrentCli()

  return {
    artifactName: "coder-desktop-${os}-${arch}.${ext}",
    directories: {
      output: "dist",
      buildResources: "resources",
    },
    // Linux launchers are .desktop files, so this is the desktop file name,
    // not just the app id. For prod, app id "ai.coder.desktop" becomes
    // "ai.coder.desktop.desktop".
    // https://developer.gnome.org/documentation/guidelines/maintainer/integrating.html
    // https://www.electron.build/docs/linux/
    extraMetadata: {
      desktopName: `${appId}.desktop`,
    },
    files: [
      "out/**/*",
      "resources/**/*",
      "!resources/coder-cli*",
      // Keep only the target platform's node-pty prebuild when cross-packaging with --cpu=*.
      ...CLI_BINARIES.filter((item) => item.os !== target.os || item.cpu !== target.cpu).map(
        (item) => `!**/node_modules/@lydell/node-pty-${item.os}-${item.cpu}{,/**/*}`,
      ),
      // Log export imports Zip.js as ESM. Keep index.js and lib, including its inline worker.
      "!**/node_modules/@zip.js/zip.js/dist{,/**/*}",
      "!**/node_modules/@zip.js/zip.js/{index.cjs,index.min.js,index-fflate.js,deno.json,eslint.config.mjs}",
      // Nothing executes type declarations or source maps, and every entry costs startup time: the
      // main process parses the whole asar header before it runs any JavaScript.
      "!**/node_modules/**/*.d.{ts,cts,mts}",
      "!**/node_modules/**/*.d.{ts,cts,mts}.map",
      "!**/node_modules/**/*.{js,cjs,mjs}.map",
      // These packages execute compiled JavaScript, not their sources.
      "!**/node_modules/ajv/lib{,/**/*}",
      "!**/node_modules/ajv-formats/src{,/**/*}",
      // Keep js-yaml's CommonJS sources and dist/js-yaml.mjs ESM entry, not browser bundles or its CLI.
      "!**/node_modules/js-yaml/dist/{js-yaml.js,js-yaml.min.js,*.map}",
      "!**/node_modules/js-yaml/bin{,/**/*}",
    ],
    extraResources: [
      {
        from: "resources/",
        to: "",
        filter: ["coder-cli", "coder-cli.exe", "coder-cli.version"],
      },
    ],
    afterPack: async (context) => {
      const arch = Arch[context.arch]

      // The --arm64 flag picks Electron while CODER_CLI_TARGET picks the CLI and node-pty, so they can disagree.
      if (arch !== "x64" && arch !== "arm64") throw new Error(`Unsupported desktop architecture: ${arch}`)

      if (arch !== target.cpu) throw new Error(`Packaging ${arch} Electron with the ${target.target} CLI`)
      const resources = context.packager.getResourcesDir(context.appOutDir)
      const cli = path.join(resources, context.electronPlatformName === "win32" ? "coder-cli.exe" : "coder-cli")

      const file = await stat(cli)

      if (!file.isFile() || file.size === 0) throw new Error(`Bundled CLI must be a non-empty file: ${cli}`)
      await NativeArch.verify(cli, arch)
      const version = path.join(path.dirname(cli), "coder-cli.version")

      if ((await stat(version)).size === 0) throw new Error(`Bundled CLI version must be a non-empty file: ${version}`)

      if (context.electronPlatformName !== "win32") return

      const prebuilds = path.join(
        resources,
        "app.asar.unpacked/node_modules",
        nodePtyPackage(target.target),
        "prebuilds",
        `${target.os}-${target.cpu}`,
      )

      const addon = path.join(prebuilds, "conpty.node")

      if ((await stat(addon)).size === 0) throw new Error(`Bundled node-pty must be a non-empty file: ${addon}`)
      const entries = await readdir(prebuilds, { recursive: true, withFileTypes: true })

      await Promise.all(
        entries
          .filter((entry) => entry.isFile())
          .map(async (entry) => {
            const file = path.join(entry.parentPath, entry.name)

            if (await NativeArch.isNative(file)) await NativeArch.verify(file, arch)
          }),
      )
    },
    mac: {
      category: "public.app-category.developer-tools",
      icon: `resources/icons/icon.icns`,
      extendInfo: {
        NSAutoFillRequiresTextContentTypeForOneTimeCodeOnMac: true,
      },
      hardenedRuntime: true,
      gatekeeperAssess: false,
      entitlements: "resources/entitlements.plist",
      entitlementsInherit: "resources/entitlements.plist",
      sign: async (options) => {
        const { sign } = await import("app-builder-lib/out/codeSign/macCodeSign")
        await sign(macSignOptions(options))
      },
      notarize: true,
      target: ["dmg", "zip"],
    },
    protocols: {
      name: "Coder",
      schemes: ["coder"],
    },
    win: {
      icon: `resources/icons/icon.ico`,
      signtoolOptions: {
        sign: signWindows,
      },
      target: ["nsis"],
      verifyUpdateCodeSignature: false,
    },
    nsis: {
      include: path.join(packageDir, "resources", "windows", "installer.nsh"),
      oneClick: true,
      perMachine: false,
      installerIcon: `resources/icons/icon.ico`,
      installerHeaderIcon: `resources/icons/icon.ico`,
    },
    linux: {
      icon: `resources/icons`,
      category: "Development",
      executableName: appId,
      desktop: {
        entry: {
          // Match the installed .desktop file and hicolor icon basename so
          // Linux shells can associate the running Electron window with its launcher.
          StartupWMClass: appId,
        },
      },
      target: ["AppImage", "deb", "rpm"],
    },
  }
}

export function getConfig() {
  const channel = resolveChannel()
  const appId = APP_IDS[channel]
  const base = getBase(appId)

  switch (channel) {
    case "dev": {
      return {
        ...base,
        appId,
        productName: "Coder Dev",
        deb: { fpm: [metainfoFpm(appId)] },
        rpm: { packageName: "coder-dev", fpm: [metainfoFpm(appId)] },
      }
    }

    case "beta": {
      return {
        ...base,
        appId,
        productName: "Coder Beta",
        protocols: { name: "Coder Beta", schemes: ["coder"] },
        publish: {
          provider: "generic",
          url: "https://releases.coder.example.com/update/api/beta/desktop/coder/",
          channel: "latest",
        },
        deb: { fpm: [metainfoFpm(appId)] },
        rpm: { packageName: "coder-beta", fpm: [metainfoFpm(appId)] },
      }
    }

    case "prod": {
      return {
        ...base,
        appId,
        productName: "Coder",
        protocols: { name: "Coder", schemes: ["coder"] },
        publish: {
          provider: "generic",
          url: "https://releases.coder.example.com/update/api/latest/desktop/coder/",
          channel: "latest",
        },
        deb: { fpm: [metainfoFpm(appId), legacyDesktopEntryFpm] },
        rpm: { packageName: "coder", fpm: [metainfoFpm(appId), legacyDesktopEntryFpm] },
      }
    }
  }
}

export default getConfig()
