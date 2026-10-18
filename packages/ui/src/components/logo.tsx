import { type ComponentProps } from "solid-js"

// The Coder mark: a monoline block "C" — the same square the upstream "O" was built from,
// with the right side opened. A faint square sits in the opening so the counter keeps the
// double-square motif of the original mark.
export const Mark = (props: { class?: string }) => {
  return (
    <svg
      data-component="logo-mark"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 16 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path data-slot="logo-logo-mark-shadow" d="M8 8H16V16H8V8Z" fill="var(--icon-weak-base)" />
      <path data-slot="logo-logo-mark-c" d="M16 0H0V20H16V16H8V4H16V0Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

export const Splash = (props: Pick<ComponentProps<"svg">, "ref" | "class">) => {
  return (
    <svg
      ref={props.ref}
      data-component="logo-splash"
      classList={{ [props.class ?? ""]: !!props.class }}
      viewBox="0 0 80 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M40 40H80V80H40V40Z" fill="var(--icon-base)" />
      <path d="M80 0H0V100H80V80H40V20H80V0Z" fill="var(--icon-strong-base)" />
    </svg>
  )
}

// "Coder" set in the same blocky monoline grid as the rest of the brand: 24-unit glyphs on a
// 30-unit advance, 6-unit strokes, cap top at y=6 and baseline at y=36. Each glyph carries a
// faint square behind it, showing through the counters.
export const Logo = (props: { class?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 144 42"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g>
        <path d="M6 18H18V30H6V18Z" fill="var(--icon-weak-base)" />
        <path d="M24 6H0V36H24V30H6V12H24V6Z" fill="var(--icon-base)" />
        <path d="M36 18H48V30H36V18Z" fill="var(--icon-weak-base)" />
        <path fill-rule="evenodd" d="M36 18H48V30H36V18ZM54 36H30V12H54V36Z" fill="var(--icon-base)" />
        <path d="M66 18H78V30H66V18Z" fill="var(--icon-weak-base)" />
        <path fill-rule="evenodd" d="M84 6H78V12H60V36H84V6ZM78 30H66V18H78V30Z" fill="var(--icon-strong-base)" />
        <path d="M96 18H108V24H96V18Z" fill="var(--icon-weak-base)" />
        <path
          fill-rule="evenodd"
          d="M90 12H114V36H90V12ZM96 18H108V24H96V18ZM108 30H114V36H108V30Z"
          fill="var(--icon-strong-base)"
        />
        <path d="M126 18H138V30H126V18Z" fill="var(--icon-weak-base)" />
        <path d="M144 12H120V36H126V18H144V12ZM144 18H138V24H144V18Z" fill="var(--icon-strong-base)" />
      </g>
    </svg>
  )
}
