import { expect, test } from "bun:test"
import { consoleProviderGroup, consoleProviderName } from "./console"

test("groups only providers managed by the active Console workspace", () => {
  const direct = { id: "openai", integrationID: "openai", name: "Example / OpenAI" }

  const group = consoleProviderGroup([
    { id: "coder", integrationID: "coder", name: "Example / Coder" },
    { id: "console-openai", integrationID: "coder", name: "Example / OpenAI" },
    { id: "console-google", integrationID: "coder", name: "Example / Google" },
    direct,
  ])

  expect(group).toBeDefined()

  if (!group) throw new Error("Expected Console provider group")
  expect(group.workspace).toBe("Example")
  expect(group.providers.map((provider) => provider.id)).toEqual(["coder", "console-openai", "console-google"])
  expect(consoleProviderName(group, group.providers[1].name)).toBe("OpenAI")
  expect(group.providers).not.toContain(direct)
})
