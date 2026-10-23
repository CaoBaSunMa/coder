// @ts-nocheck
import { Button } from "@xcoder/ui/button"
import { useDialog } from "@xcoder/ui/context/dialog"
import { createSignal, onMount } from "solid-js"
import { DialogSelectModelUnpaid } from "./unpaid"

const names = [
  "MiMo V2.5 Free",
  "Nemotron 3 Ultra Free",
  "Deepseek V4 Flash Free",
  "North Mini Code Free",
  "Hy3 Free",
  "Big Pickle",
]

// One entry matches a catalog model by name (selectable), one matches nothing (disabled with a hint).
const locals = [
  { id: "local-mimo", name: "MiMo V2.5 Free", endpoint: "http://127.0.0.1:8080/v1", path: "" },
  { id: "local-orphan", name: "my-local-7b", endpoint: "http://127.0.0.1:8081/v1", path: "" },
]

function SelectModelWithoutProviders(props: { local?: boolean }) {
  const dialog = useDialog()

  const models = names.map((name, index) => ({
    id: name.toLowerCase().replaceAll(" ", "-"),
    name,
    provider: { id: "coder", name: "Coder" },
    cost: { input: 0, output: 0 },
    limit: { context: 128_000 },
    capabilities: {
      reasoning: index !== 5,
      input: { text: true, image: false, audio: false, video: false, pdf: false },
    },
  }))

  const [current, setCurrent] = createSignal(models[2])

  const model = {
    list: () => models,
    current,
    set(value) {
      setCurrent(models.find((item) => item.id === value?.modelID))
    },
  }

  const open = () => dialog.show(() => <DialogSelectModelUnpaid model={model} local={props.local ? locals : undefined} />)

  onMount(open)

  return (
    <Button variant="neutral" onClick={open}>
      Open select model dialog
    </Button>
  )
}

export default {
  title: "App/Dialogs/Select Model",
  id: "app-dialog-select-model",
}

export const WithoutProviders = {
  render: () => <SelectModelWithoutProviders />,
}

export const LocalModels = {
  render: () => <SelectModelWithoutProviders local />,
}
