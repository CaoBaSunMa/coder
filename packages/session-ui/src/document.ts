import type { FileDiffInfo, SessionMessageInfo, SessionStatus } from "@xcoder/client/promise"

export type SessionDocument = {
  sessionID: string
  messages: SessionMessageInfo[]
  status: SessionStatus
  diffs: FileDiffInfo[]
}
