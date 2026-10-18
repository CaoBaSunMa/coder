import { expect, test } from "bun:test"
import { Env } from "../src/env"

test("session environment omits server credentials", () => {
  const previousPassword = process.env.CODER_PASSWORD
  const previousLegacyPassword = process.env.CODER_SERVER_PASSWORD
  const previousValue = process.env.CODER_SESSION_ENV_TEST
  process.env.CODER_PASSWORD = "password"
  process.env.CODER_SERVER_PASSWORD = "legacy"
  process.env.CODER_SESSION_ENV_TEST = "included"

  const environment = Env.session()

  if (previousPassword === undefined) delete process.env.CODER_PASSWORD
  else process.env.CODER_PASSWORD = previousPassword
  if (previousLegacyPassword === undefined) delete process.env.CODER_SERVER_PASSWORD
  else process.env.CODER_SERVER_PASSWORD = previousLegacyPassword
  if (previousValue === undefined) delete process.env.CODER_SESSION_ENV_TEST
  else process.env.CODER_SESSION_ENV_TEST = previousValue

  expect(environment.CODER_PASSWORD).toBeUndefined()
  expect(environment.CODER_SERVER_PASSWORD).toBeUndefined()
  expect(environment.CODER_SESSION_ENV_TEST).toBe("included")
})
