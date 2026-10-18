import type { ElectronNative } from "../preload/types"

declare global {
  interface ImportMetaEnv {
    readonly CODER_TEST_ONBOARDING: boolean
  }

  interface Window {
    electron: ElectronNative
    __CODER__?: {
      deepLinks?: string[]
    }
  }
}
