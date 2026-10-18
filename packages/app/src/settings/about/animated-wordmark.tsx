import { createEffect, For, on, onCleanup } from "solid-js"
import { createStore } from "solid-js/store"

const target = ["c", "o", "d", "e", "r"] as const

const choices = ["c", "o", "d", "e", "r"] as const

export function AnimatedWordmark(props: { active: boolean }) {
  const [state, setState] = createStore({ letters: [...target] })
  const timers = new Set<ReturnType<typeof setTimeout>>()

  createEffect(
    on(
      () => props.active,
      (active) => {
        timers.forEach(clearTimeout)
        timers.clear()

        if (!active || matchMedia("(prefers-reduced-motion: reduce)").matches) {
          setState("letters", [...target])

          return
        }

        const starts = target.map(() => choices[Math.floor(Math.random() * choices.length)])
        const settles = target.map(() => 6 + Math.floor(Math.random() * 8))
        const last = Math.max(...settles)
        setState("letters", starts)

        Array.from({ length: last }, (_, index) => index + 1).forEach((tick) => {
          const timer = setTimeout(() => {
            setState(
              "letters",
              target.map((letter, index) =>
                tick >= settles[index] ? letter : choices[Math.floor(Math.random() * choices.length)],
              ),
            )
            timers.delete(timer)
          }, tick * 75)

          timers.add(timer)
        })
      },
    ),
  )

  onCleanup(() => timers.forEach(clearTimeout))

  return (
    <svg class="settings-about-wordmark" viewBox="0 0 144 42" aria-hidden="true">
      <defs>
        <symbol id="settings-about-letter-c" viewBox="0 0 24 42">
          <path class="settings-about-letter-shadow" d="M6 18H18V30H6V18Z" />
          <path d="M24 6H0V36H24V30H6V12H24V6Z" />
        </symbol>
        <symbol id="settings-about-letter-o" viewBox="0 0 24 42">
          <path class="settings-about-letter-shadow" d="M6 18H18V30H6V18Z" />
          <path fill-rule="evenodd" d="M6 18H18V30H6V18ZM24 36H0V12H24V36Z" />
        </symbol>
        <symbol id="settings-about-letter-d" viewBox="0 0 24 42">
          <path class="settings-about-letter-shadow" d="M6 18H18V30H6V18Z" />
          <path fill-rule="evenodd" d="M24 6H18V12H0V36H24V6ZM18 30H6V18H18V30Z" />
        </symbol>
        <symbol id="settings-about-letter-e" viewBox="0 0 24 42">
          <path class="settings-about-letter-shadow" d="M6 18H18V24H6V18Z" />
          <path fill-rule="evenodd" d="M0 12H24V36H0V12ZM6 18H18V24H6V18ZM18 30H24V36H18V30Z" />
        </symbol>
        <symbol id="settings-about-letter-r" viewBox="0 0 24 42">
          <path class="settings-about-letter-shadow" d="M6 18H18V30H6V18Z" />
          <path d="M24 12H0V36H6V18H24V12ZM24 18H18V24H24V18Z" />
        </symbol>
      </defs>
      <For each={state.letters}>
        {(letter, index) => (
          <use href={`#settings-about-letter-${letter}`} x={index() * 30} width="24" height="42" />
        )}
      </For>
    </svg>
  )
}
