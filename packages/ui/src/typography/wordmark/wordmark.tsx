import { createUniqueId, type ComponentProps } from "solid-js"

export function Wordmark(
  props: Pick<ComponentProps<"svg">, "class"> & { fade?: boolean; muted?: boolean; outline?: boolean },
) {
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 442 129"
      fill="none"
      classList={{
        [props.class ?? ""]: !!props.class,
        "overflow-visible [&_path]:[vector-effect:non-scaling-stroke]": props.outline,
      }}
    >
      <g opacity={props.muted === false ? 1 : 0.6} class="[[data-color-scheme=dark]_&]:opacity-100">
        <g mask={props.fade === false ? undefined : `url(#${mask})`}>
          <g
            opacity={props.muted === false ? 1 : 0.16 * 0.7}
            fill={props.outline ? "none" : "currentColor"}
            stroke={props.outline ? "currentColor" : undefined}
            stroke-width={props.outline ? 1 : undefined}
          >
            <path
              fill-rule="evenodd"
              pathLength={props.outline ? 1 : undefined}
              d="M73.8462 18H0V110.143H73.8462V91.6815H18.4615V36.4286H73.8462Z"
            />
            <path
              fill-rule="evenodd"
              pathLength={props.outline ? 1 : undefined}
              d="M110.4615 54.8901H147.3847V91.6815H110.4615V54.8901ZM165.8462 110.143H92V36.4286H165.8462V110.143Z"
            />
            <path
              fill-rule="evenodd"
              pathLength={props.outline ? 1 : undefined}
              d="M257.8462 18H239.3847V36.4286H184V110.143H257.8462V18ZM239.3847 91.6815H202.4615V54.8901H239.3847V91.6815Z"
            />
            <path
              fill-rule="evenodd"
              pathLength={props.outline ? 1 : undefined}
              d="M276 36.4286H349.8462V110.143H276V36.4286ZM294.4615 54.8901H331.3847V73.3516H294.4615V54.8901ZM331.3847 91.6815H349.8462V110.143H331.3847V91.6815Z"
            />
            <path
              fill-rule="evenodd"
              pathLength={props.outline ? 1 : undefined}
              d="M441.8462 36.4286H368V110.143H386.4615V54.8901H441.8462V36.4286ZM441.8462 54.8901H423.3847V73.3516H441.8462V54.8901Z"
            />
          </g>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="442" height="129">
          <rect width="442" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="221" y1="68" x2="221" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
