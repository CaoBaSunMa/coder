import { createMemo } from "solid-js"
import { useLocal } from "../context/local"
import { useI18n } from "../context/i18n"
import { DialogSelect } from "../ui/dialog-select"
import { useDialog } from "../ui/dialog"

export function DialogAgent() {
  const local = useLocal()
  const dialog = useDialog()
  const i18n = useI18n()

  const options = createMemo(() =>
    local.agent.list().map((item) => {
      return {
        value: item.id,
        title: item.id,
        description: item.description,
      }
    }),
  )

  return (
    <DialogSelect
      title={i18n.t("agent.select")}
      searchInTitle
      titlePlaceholder={i18n.t("agent.search")}
      current={local.agent.current()?.id}
      options={options()}
      onSelect={(option) => {
        local.agent.set(option.value)
        dialog.clear()
      }}
    />
  )
}
