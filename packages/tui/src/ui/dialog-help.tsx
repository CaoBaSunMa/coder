import { Keymap } from "../context/keymap"
import { useI18n } from "../context/i18n"
import { useTheme } from "../context/theme"
import { DialogHeader, DialogLayout, useDialog } from "./dialog"

export function DialogHelp() {
  const dialog = useDialog()
  const theme = useTheme().surface("dialog")
  const i18n = useI18n()
  const shortcuts = Keymap.useShortcuts()

  Keymap.createLayer(() => ({
    mode: "modal",
    commands: [
      { bind: "return", title: i18n.t("help.close"), group: "Dialog", run: () => dialog.clear() },
      { bind: "escape", title: i18n.t("help.close"), group: "Dialog", run: () => dialog.clear() },
    ],
  }))

  return (
    <DialogLayout
      header={<DialogHeader title={i18n.t("help.title")} closeLabel="esc/enter" />}
      footer={{ actions: { primary: [{ title: i18n.t("common.ok"), key: "enter", onTrigger: () => dialog.clear() }] } }}
      legacyFooter={
        <box flexDirection="row" justifyContent="flex-end">
          <box
            paddingLeft={3}
            paddingRight={3}
            backgroundColor={theme.background.action.primary.focused}
            onMouseUp={() => dialog.clear()}
          >
            <text fg={theme.text.action.primary.focused}>{i18n.t("common.ok")}</text>
          </box>
        </box>
      }
    >
      <text fg={theme.text.muted}>
        {i18n.t("help.description", { key: shortcuts.get("command.palette.show") ?? "" })}
      </text>
    </DialogLayout>
  )
}
