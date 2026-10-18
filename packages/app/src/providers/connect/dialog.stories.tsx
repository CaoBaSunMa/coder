// @ts-nocheck
import { Button } from "@xcoder/ui/button"
import { useDialog } from "@xcoder/ui/context/dialog"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { mockProviderAuth } from "@/runtime/server/sync"
import { onCleanup, onMount } from "solid-js"
import { DialogConnectProvider, useProviderConnectController } from "./dialog"

function ConnectProviderDialogStory() {
  const dialog = useDialog()
  const open = () => dialog.show(() => <DialogConnectProvider />)

  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open connect provider dialog
    </Button>
  )
}

function ProviderConnectionDialogStory(props) {
  onCleanup(mockProviderAuth(props.provider, props.methods))
  const dialog = useDialog()
  const controller = useProviderConnectController()
  controller.select(props.provider)
  const open = () => dialog.show(() => <DialogConnectProvider controller={controller} />)

  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open {props.provider} connection dialog
    </Button>
  )
}

function renderConnection(provider, methods) {
  return () => (
    <QueryClientProvider client={new QueryClient()}>
      <ProviderConnectionDialogStory provider={provider} methods={methods} />
    </QueryClientProvider>
  )
}

export default {
  title: "App/Dialogs/Connect Provider",
  id: "app-dialog-connect-provider",
}

export const Picker = {
  render: () => (
    <QueryClientProvider client={new QueryClient()}>
      <ConnectProviderDialogStory />
    </QueryClientProvider>
  ),
}

export const ApiKey = {
  render: renderConnection("openrouter", [{ type: "key", label: "API key" }]),
}

export const CoderZen = {
  render: renderConnection("coder", [{ type: "key", label: "API key" }]),
}

export const LoginMethods = {
  render: renderConnection("openai", [
    { type: "oauth", label: "Sign in with ChatGPT" },
    { type: "oauth", label: "Codex browser (legacy)" },
    { type: "oauth", label: "Codex device code (legacy)" },
    { type: "key", label: "API key" },
  ]),
}
