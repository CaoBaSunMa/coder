// coder-pty does not ship Windows binaries.
export const available = process.platform !== "win32"

export async function resolveBinary() {
  return process.env.CODER_PTY_BIN || "coder-pty"
}
