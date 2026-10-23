import { Button } from "@xcoder/ui/button"
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitleGroup } from "@xcoder/ui/dialog"
import { Divider } from "@xcoder/ui/divider"
import { Icon } from "@xcoder/ui/icon"
import { IconButton } from "@xcoder/ui/icon-button"
import { Menu } from "@xcoder/ui/menu"
import { TextInput } from "@xcoder/ui/text-input"
import { useDialog } from "@xcoder/ui/context/dialog"
import { type Component, createSignal, For, Show } from "solid-js"
import { createStore } from "solid-js/store"
import { useLanguage } from "@/runtime/i18n/language"
import { useLocalModels } from "@/providers/models/local"
import { showToast } from "@/shell/notifications/toast"
import "@/settings/settings.css"

type Draft = { id?: string; name: string; endpoint: string; path: string }

const emptyDraft = (): Draft => ({ name: "", endpoint: "", path: "" })

/**
 * Add/edit form for one local model. Rendered through `useDialog().show()`, which mounts it inside
 * kobalte's Dialog.Root — the Dialog primitive's inner Content reads that context, so this component
 * cannot be inlined into the settings page.
 *
 * The layout follows the Add Server dialog: the same header, divider, body spacing, and footer, with
 * the shared `settings-server-dialog-*` field classes for labels, errors, and hints.
 *
 * The form owns its live values in a store so keystrokes stay responsive; it validates on save and
 * hands the result to `onSave`, which persists it and closes the dialog.
 */
const LocalModelDialog: Component<{
  initial: Draft
  onSave: (draft: Draft) => void
}> = (props) => {
  const language = useLanguage()
  const dialog = useDialog()
  const [form, setForm] = createStore<Draft>({ ...props.initial })
  const [err, setErr] = createStore<{ name?: string; endpoint?: string }>({})

  const setField = (key: "name" | "endpoint" | "path", value: string) => {
    setForm(key, value)

    // Only name and endpoint have validation; clear a stale error for whichever of the two changed.
    if (key === "name" || key === "endpoint") setErr(key, undefined)
  }

  const save = () => {
    const name = form.name.trim()
    const endpoint = form.endpoint.trim()
    const nameError = name ? undefined : language.t("settings.models.local.error.name.required")

    const endpointError =
      endpoint && !/^https?:\/\//.test(endpoint) ? language.t("settings.models.local.error.endpoint.format") : undefined

    if (nameError || endpointError) {
      setErr({ name: nameError, endpoint: endpointError })

      return
    }

    props.onSave({ id: form.id, name, endpoint, path: form.path.trim() })
  }

  const keyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" || event.isComposing) return
    event.preventDefault()
    save()
  }

  return (
    <Dialog fit class="settings-local-model-dialog">
      <DialogHeader hideClose={true}>
        <DialogTitleGroup
          title={language.t(props.initial.id ? "settings.models.local.edit.title" : "settings.models.local.add.title")}
          description={language.t("settings.models.local.form.description")}
        />
      </DialogHeader>
      <Divider />
      <DialogBody class="flex w-full min-w-0 flex-1 flex-col gap-6 px-4 pt-4 pb-2">
        <div class="flex w-full min-w-0 flex-col gap-2">
          <label for="dialog-local-model-name" class="settings-server-dialog-label">
            {language.t("settings.models.local.field.name.label")}
          </label>
          <TextInput
            id="dialog-local-model-name"
            type="text"
            appearance="large"
            class="!w-full self-stretch"
            value={form.name}
            placeholder={language.t("settings.models.local.field.name.placeholder")}
            invalid={!!err.name}
            autofocus
            aria-describedby={err.name ? "dialog-local-model-name-error" : undefined}
            onInput={(event) => setField("name", event.currentTarget.value)}
            onKeyDown={keyDown}
          />
          <Show when={err.name}>
            {(message) => (
              <span id="dialog-local-model-name-error" class="settings-server-dialog-error" role="alert">
                {message()}
              </span>
            )}
          </Show>
        </div>

        <div class="flex w-full min-w-0 flex-col gap-2">
          <label for="dialog-local-model-endpoint" class="settings-server-dialog-label">
            {language.t("settings.models.local.field.endpoint.label")}
          </label>
          <TextInput
            id="dialog-local-model-endpoint"
            type="text"
            appearance="large"
            class="!w-full self-stretch"
            value={form.endpoint}
            placeholder={language.t("settings.models.local.field.endpoint.placeholder")}
            invalid={!!err.endpoint}
            spellcheck={false}
            autocomplete="off"
            aria-describedby={err.endpoint ? "dialog-local-model-endpoint-error" : "dialog-local-model-endpoint-hint"}
            onInput={(event) => setField("endpoint", event.currentTarget.value)}
            onKeyDown={keyDown}
          />
          <Show
            when={err.endpoint}
            fallback={
              <span id="dialog-local-model-endpoint-hint" class="settings-server-dialog-hint">
                {language.t("settings.models.local.field.endpoint.hint")}
              </span>
            }
          >
            {(message) => (
              <span id="dialog-local-model-endpoint-error" class="settings-server-dialog-error" role="alert">
                {message()}
              </span>
            )}
          </Show>
        </div>

        <div class="flex w-full min-w-0 flex-col gap-2">
          <label for="dialog-local-model-path" class="settings-server-dialog-label">
            {language.t("settings.models.local.field.path.label")}
          </label>
          <TextInput
            id="dialog-local-model-path"
            type="text"
            appearance="large"
            class="!w-full self-stretch"
            value={form.path}
            placeholder={language.t("settings.models.local.field.path.placeholder")}
            spellcheck={false}
            autocomplete="off"
            aria-describedby="dialog-local-model-path-hint"
            onInput={(event) => setField("path", event.currentTarget.value)}
            onKeyDown={keyDown}
          />
          <span id="dialog-local-model-path-hint" class="settings-server-dialog-hint">
            {language.t("settings.models.local.field.path.hint")}
          </span>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="neutral" onClick={() => dialog.close()}>
          {language.t("common.cancel")}
        </Button>
        <Button variant="contrast" onClick={save}>
          {language.t("common.save")}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

/**
 * Add/edit/delete for one local model list, shared by the settings section and the model selector's
 * manage dialog. The form opens with `push` so it stacks over an open manage dialog instead of
 * replacing it; on an empty stack that is a plain single dialog.
 */
function useLocalModelsEditor() {
  const language = useLanguage()
  const local = useLocalModels()
  const dialog = useDialog()
  const [confirming, setConfirming] = createSignal<string | undefined>()

  const openAdd = () => dialog.push(() => <LocalModelDialog initial={emptyDraft()} onSave={commit} />)
  const openEdit = (model: Draft) => dialog.push(() => <LocalModelDialog initial={model} onSave={commit} />)

  function commit(draft: Draft) {
    if (draft.id) local.update(draft.id, { name: draft.name, endpoint: draft.endpoint, path: draft.path })
    else local.add({ name: draft.name, endpoint: draft.endpoint, path: draft.path })

    dialog.close()
    showToast({
      variant: "success",
      icon: "circle-check",
      title: language.t(draft.id ? "settings.models.local.toast.updated" : "settings.models.local.toast.added"),
      description: draft.name,
    })
  }

  const remove = (id: string) => {
    local.remove(id)
    setConfirming(undefined)
  }

  const initialize = () => {
    local.initialize()
    showToast({
      variant: "success",
      icon: "circle-check",
      title: language.t("settings.models.local.toast.initialized"),
    })
  }

  return { list: local.list, confirming, setConfirming, openAdd, openEdit, remove, initialize }
}

type LocalModelsEditor = ReturnType<typeof useLocalModelsEditor>

/** The local model table with per-row edit/delete, shared by the settings section and the manage dialog. */
const LocalModelsList: Component<{ editor: LocalModelsEditor }> = (props) => {
  const language = useLanguage()

  // The path cell merges the endpoint URL and the file path, showing a muted second line when both exist.
  const pathLines = (model: { endpoint: string; path: string }) =>
    [
      { value: model.endpoint, muted: false },
      { value: model.path, muted: true },
    ].filter((line) => line.value.length > 0)

  return (
    <Show
      when={props.editor.list().length > 0}
      fallback={
        <div class="settings-models-status">
          <span>{language.t("settings.models.local.empty")}</span>
          <Button variant="neutral" size="small" icon="outline-rotate-clockwise" onClick={props.editor.initialize}>
            {language.t("settings.models.local.initialize")}
          </Button>
        </div>
      }
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
        <For each={props.editor.list()}>
          {(model, index) => (
            <div class="settings-local-models-row" role="row">
              <span role="cell" class="settings-local-models-index">
                {index() + 1}
              </span>
              <span role="cell" class="settings-local-models-name">
                {model.name}
              </span>
              <span role="cell" class="settings-local-models-path">
                <Show when={pathLines(model).length > 0} fallback={<span class="text-v2-text-text-muted">—</span>}>
                  <For each={pathLines(model)}>
                    {(line) => (
                      <span class={line.muted ? "settings-local-models-path-muted" : undefined}>{line.value}</span>
                    )}
                  </For>
                </Show>
              </span>
              <span role="cell" class="settings-local-models-actions">
                <Show
                  when={props.editor.confirming() !== model.id}
                  fallback={
                    <div class="settings-local-models-confirm">
                      <span role="alert" class="settings-local-models-confirm-text">
                        {language.t("settings.models.local.removeConfirm", { model: model.name })}
                      </span>
                      <Button variant="ghost-muted" size="small" onClick={() => props.editor.setConfirming(undefined)}>
                        {language.t("common.cancel")}
                      </Button>
                      <Button variant="danger" size="small" onClick={() => props.editor.remove(model.id)}>
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
                        <Menu.Item onSelect={() => props.editor.openEdit(model)}>
                          {language.t("common.edit")}
                        </Menu.Item>
                        <Menu.Item onSelect={() => props.editor.setConfirming(model.id)}>
                          {language.t("common.delete")}
                        </Menu.Item>
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
  )
}

/** Local model list: index, name, and a merged path cell (endpoint URL + file path), with add/edit/delete. */
export const SettingsLocalModels: Component = () => {
  const language = useLanguage()
  const editor = useLocalModelsEditor()

  return (
    <section class="settings-section" data-component="settings-local-models">
      <h3 class="settings-models-group-header justify-between">
        <span class="settings-models-group-label">
          <bdi class="settings-models-group-title">{language.t("settings.models.local.title")}</bdi>
        </span>
        <Button variant="neutral" size="small" icon="plus" onClick={editor.openAdd}>
          {language.t("settings.models.local.add")}
        </Button>
      </h3>

      <p class="settings-local-models-description">{language.t("settings.models.local.description")}</p>

      <LocalModelsList editor={editor} />
    </section>
  )
}

/**
 * The same local model editor, as a dialog, so the model selector's local group can be edited in
 * place. It mirrors the settings section (title, description, add action, table) and stacks over an
 * open selector dialog rather than replacing it.
 */
export const DialogManageLocalModels: Component = () => {
  const language = useLanguage()
  const editor = useLocalModelsEditor()

  return (
    <Dialog size="large" variant="settings">
      <DialogHeader hideClose={true} closeLabel={language.t("common.close")}>
        <DialogTitleGroup
          title={language.t("settings.models.local.title")}
          description={language.t("settings.models.local.description")}
        />
        <Button variant="neutral" icon="plus" onClick={editor.openAdd}>
          {language.t("settings.models.local.add")}
        </Button>
      </DialogHeader>
      <DialogBody class="flex w-full min-w-0 flex-1 flex-col gap-4 px-4 pt-1 pb-4 overflow-y-auto">
        <LocalModelsList editor={editor} />
      </DialogBody>
    </Dialog>
  )
}
