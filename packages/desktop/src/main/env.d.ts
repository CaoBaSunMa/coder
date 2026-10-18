interface ImportMetaEnv {
  readonly CODER_CHANNEL: string
  readonly CODER_VERSION?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
