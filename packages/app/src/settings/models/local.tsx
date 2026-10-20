import { Button } from "@xcoder/ui/button"
import { Dialog, DialogBody, DialogHeader, DialogTitleGroup } from "@xcoder/ui/dialog"
import { Icon } from "@xcoder/ui/icon"
import { IconButton } from "@xcoder/ui/icon-button"
import { Menu } from "@xcoder/ui/menu"
import { TextInput } from "@xcoder/ui/text-input"
import { useDialog } from "@xcoder/ui/context/dialog"
import { type Component, createSignal, For, Show } from "solid-js"
import { useLanguage } from "@/runtime/i18n/language"
import { useLocalModels } from "@/providers/models/local"
import { showToast } from "@/shell/notifications/toast"
import "@/settings/settings.css"

type Draft = { id?: string; name: string; endpoint: string; path: string; err: { name?: string; endpoint?: string } }

const emptyDraft = (): Draft => ({ name: "", endpoint: "", path: "", err: {} })

/**
 * Add/edit form for one local model. Rendered through `useDialog().show()`, which mounts it inside
 * kobalte's Dialog.Root — the Dialog primitive's inner Content reads that context, so this component
 * cannot be inlined into the settings page.
 */
const LocalModelDialog: Component<{
  draft: Draft
  onChange: (next: Draft) => void
  onSave: () => void
}> = (props) => {
  const language = useLanguage()
  const dialog = useDialog()

  const setField = (key: "name" | "endpoint" | "path", value: string) =>
    props.onChange({ ...props.draft, [key]: value, err: { ...props.draft.err, [key]: undefined } })

  return (
    <Dialog size="normal" variant="settings">
      <DialogHeader closeLabel={language.t("common.close")}>
        <DialogTitleGroup
          title={language.t(props.draft.id ? "settings.models.local.edit.title" : "settings.models.local.add.title")}
          description={language.t("settings.models.local.description")}
        />
      </DialogHeader>
      <DialogBody class="flex flex-col gap-4 px-4 pb-4">
        <label class="flex flex-col gap-1.5">
          <span class="text-12-medium text-text-weak">{language.t("settings.models.local.field.name.label")}</span>
          <TextInput
            appearance="large"
            value={props.draft.name}
            onInput={(event) => setField("name", event.currentTarget.value)}
            placeholder={language.t("settings.models.local.field.name.placeholder")}
            invalid={!!props.draft.err.name}
            autofocus
            aria-label={language.t("settings.models.local.field.name.label")}
          />
          <Show when={props.draft.err.name}>
            {(message) => <span class="text-11-regular text-v2-text-text-error">{message()}</span>}
          </Show>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-12-medium text-text-weak">{language.t("settings.models.local.field.endpoint.label")}</span>
          <TextInput
            appearance="large"
            value={props.draft.endpoint}
            onInput={(event) => setField("endpoint", event.currentTarget.value)}
            placeholder={language.t("settings.models.local.field.endpoint.placeholder")}
            invalid={!!props.draft.err.endpoint}
            spellcheck={false}
            autocomplete="off"
            aria-label={language.t("settings.models.local.field.endpoint.label")}
          />
          <Show when={props.draft.err.endpoint}>
            {(message) => <span class="text-11-regular text-v2-text-text-error">{message()}</span>}
          </Show>
        </label>

        <label class="flex flex-col gap-1.5">
          <span class="text-12-medium text-text-weak">{language.t("settings.models.local.field.path.label")}</span>
          <TextInput
            appearance="large"
            value={props.draft.path}
            onInput={(event) => setField("path", event.currentTarget.value)}
            placeholder={language.t("settings.models.local.field.path.placeholder")}
            spellcheck={false}
            autocomplete="off"
            aria-label={language.t("settings.models.local.field.path.label")}
          />
        </label>

        <div class="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => dialog.close()}>
            {language.t("common.cancel")}
          </Button>
          <Button variant="submit" onClick={props.onSave}>
            {language.t("common.save")}
          </Button>
        </div>
      </DialogBody>
    </Dialog>
  )
}

/** Local model list: index, name, and a merged path cell (endpoint URL + file path), with add/edit/delete. */
export const SettingsLocalModels: Component = () => {
  const language = useLanguage()
  const local = useLocalModels()
  const dialog = useDialog()
  const [draft, setDraft] = createSignal<Draft | undefined>()
  const [confirming, setConfirming] = createSignal<string | undefined>()

  const validate = (current: Draft) => {
    const name = current.name.trim()
    const endpoint = current.endpoint.trim()
    const nameError = name ? undefined : language.t("settings.models.local.error.name.required")

    const endpointError = endpoint && !/^https?:\/\//.test(endpoint)
      ? language.t("settings.models.local.error.endpoint.format")
      : undefined

    return { name, endpoint, path: current.path.trim(), nameError, endpointError }
  }

  const save = () => {
    const current = draft()

    if (!current) return

    const { name, endpoint, path, nameError, endpointError } = validate(current)

    if (nameError || endpointError) {
      setDraft({ ...current, err: { name: nameError, endpoint: endpointError } })

      return
    }

    if (current.id) local.update(current.id, { name, endpoint, path })
    else local.add({ name, endpoint, path })

    setDraft(undefined)
    dialog.close()
    showToast({
      variant: "success",
      icon: "circle-check",
      title: language.t(current.id ? "settings.models.local.toast.updated" : "settings.models.local.toast.added"),
      description: name,
    })
  }

  // The dialog reads its own live draft, but is mounted once per open; re-showing on each keystroke
  // would remount and lose focus, so it is shown per open and reads through signals owned here.
  const openDialog = (next: Draft) => {
    setDraft(next)
    dialog.show(() => <LocalModelDialog draft={next} onChange={setDraft} onSave={save} />)
  }

  const openAdd = () => openDialog(emptyDraft())

  const openEdit = (model: { id: string; name: string; endpoint: string; path: string }) =>
    openDialog({ id: model.id, name: model.name, endpoint: model.endpoint, path: model.path, err: {} })

  const remove = (id: string) => {
    local.remove(id)
    setConfirming(undefined)
  }

  // The path cell merges the endpoint URL and the file path, showing a muted second line when both exist.
  const pathLines = (model: { endpoint: string; path: string }) =>
    [
      { value: model.endpoint, muted: false },
      { value: model.path, muted: true },
    ].filter((line) => line.value.length > 0)

  return (
    <section class="settings-section" data-component="settings-local-models">
      <h3 class="settings-models-group-header justify-between">
        <span class="settings-models-group-label">
          <bdi class="settings-models-group-title">{language.t("settings.models.local.title")}</bdi>
        </span>
        <Button variant="neutral" size="small" icon="plus" onClick={openAdd}>
          {language.t("settings.models.local.add")}
        </Button>
      </h3>

      <Show
        when={local.list().length > 0}
        fallback={<div class="settings-models-status">{language.t("settings.models.local.empty")}</div>}
      >
        <div class="settings-local-models-table" role="table">
          <div class="settings-local-models-row settings-local-models-head" role="row">
            <span role="columnheader">{language.t("settings.models.local.column.index")}</span>
            <span role="columnheader">{language.t("settings.models.local.column.name")}</span>
            <span role="columnheader">{language.t("settings.models.local.column.path")}</span>
            <span
              role="columnheader"
              class="settings-local-models-actions"
              aria-label={language.t("settings.models.local.column.actions")}
            />
          </div>
          <For each={local.list()}>
            {(model, index) => (
              <div class="settings-local-models-row" role="row">
                <span role="cell" class="settings-local-models-index">
                  {index() + 1}
                </span>
                <span role="cell" class="settings-local-models-name">
                  {model.name}
                </span>
                <span role="cell" class="settings-local-models-path">
                  <Show
                    when={pathLines(model).length > 0}
                    fallback={<span class="text-v2-text-text-muted">—</span>}
                  >
                    <For each={pathLines(model)}>
                      {(line) => (
                        <span class={line.muted ? "settings-local-models-path-muted" : undefined}>{line.value}</span>
                      )}
                    </For>
                  </Show>
                </span>
                <span role="cell" class="settings-local-models-actions">
                  <Show
                    when={confirming() !== model.id}
                    fallback={
                      <div class="settings-local-models-confirm">
                        <span role="alert" class="settings-local-models-confirm-text">
                          {language.t("settings.models.local.removeConfirm", { model: model.name })}
                        </span>
                        <Button variant="ghost-muted" size="small" onClick={() => setConfirming(undefined)}>
                          {language.t("common.cancel")}
                        </Button>
                        <Button variant="danger" size="small" onClick={() => remove(model.id)}>
                          {language.t("common.delete")}
                        </Button>
                      </div>
                    }
                  >
                    <Menu gutter={4} modal={false} placement="bottom-end">
                      <Menu.Trigger
                        as={IconButton}
                        variant="ghost-muted"
                        size="small"
                        icon={<Icon name="outline-dots" />}
                        aria-label={language.t("settings.models.local.options", { model: model.name })}
                      />
                      <Menu.Portal>
                        <Menu.Content>
                          <Menu.Item onSelect={() => openEdit(model)}>{language.t("common.edit")}</Menu.Item>
                          <Menu.Item onSelect={() => setConfirming(model.id)}>{language.t("common.delete")}</Menu.Item>
                        </Menu.Content>
                      </Menu.Portal>
                    </Menu>
                  </Show>
                </span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </section>
  )
}
