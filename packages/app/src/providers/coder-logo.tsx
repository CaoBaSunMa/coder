export function CoderLogo(props: { class?: string }) {
  return (
    <svg
      data-component="coder-logo"
      aria-hidden="true"
      class={props.class}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path opacity="0.2" d="M9.6 6.4H14.8V11.2H9.6V6.4Z" fill="currentColor" />
        <path d="M14.8 1.6H1.2V14.4H14.8V11.2H6.4V4.8H14.8V1.6Z" fill="currentColor" />
      </g>
    </svg>
  )
}
