import { cn } from '@/shared/lib/cn'
import type { LoginCraneProps } from './types'

export function LoginCrane({ className }: LoginCraneProps) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden',
        className,
      )}
    >
      <svg
        viewBox="0 0 900 720"
        preserveAspectRatio="xMaxYMax meet"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="login-crane absolute inset-0 h-full w-full -translate-y-8 text-[#2563eb]/55 sm:-translate-y-12"
      >
        <g className="login-crane__slide">
          {/* Tower mast — feet go into the base */}
          <g
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M780 705 V96" />
            <path d="M848 705 V96" />
            <path
              d="M780 660 L848 620 M780 620 L848 580 M780 580 L848 540 M780 540 L848 500 M780 500 L848 460 M780 460 L848 420 M780 420 L848 380 M780 380 L848 340 M780 340 L848 300 M780 300 L848 260 M780 260 L848 220 M780 220 L848 180 M780 180 L848 140 M780 140 L848 110"
              strokeWidth="4.5"
            />
          </g>

          {/* Base pad — flush tiers over mast feet */}
          <g>
            <rect
              x="748"
              y="696"
              width="132"
              height="14"
              rx="2"
              fill="#93c5fd"
              opacity="0.95"
            />
            <rect
              x="736"
              y="710"
              width="156"
              height="10"
              rx="2"
              fill="#3b82f6"
              opacity="0.9"
            />
          </g>

          {/* Boom + tip pulley + counter-jib */}
          <g
            className="login-crane__boom"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="square"
            strokeLinejoin="miter"
          >
            <path d="M814 70 H56" />
            <path d="M814 20 H56" />
            <path d="M56 20 V70" />
            <path
              d="M760 20 L706 70 M706 20 L652 70 M652 20 L598 70 M598 20 L544 70 M544 20 L490 70 M490 20 L436 70 M436 20 L382 70 M382 20 L328 70 M328 20 L274 70 M274 20 L220 70 M220 20 L166 70 M166 20 L112 70 M112 20 L56 70"
              strokeWidth="4.5"
            />

            {/* Pulley flush with bottom rail */}
            <circle cx="56" cy="80" r="10" fill="currentColor" stroke="none" />
            <circle cx="56" cy="80" r="4" fill="#eff6ff" stroke="none" />

            <path d="M814 70 H890" />
            <path d="M814 20 H884" />
            <path d="M840 20 L866 70 M866 20 L884 70" strokeWidth="4" />

            <g className="login-crane__hook" transform="translate(56 80)">
              <path
                d="M0 10 V150"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray="6 5"
                strokeLinecap="round"
              />
              <g className="login-crane__hook-head">
                <path
                  d="M-16 150 H16 M0 150 V181 M-16 181 Q0 203 16 181"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                />
                <rect
                  x="-14"
                  y="203"
                  width="28"
                  height="18"
                  rx="3"
                  fill="currentColor"
                  stroke="none"
                />
              </g>
            </g>
          </g>

          {/* A-frame peak */}
          <g
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M814 48 L814 8" />
            <path d="M780 48 L814 8 L848 48" />
          </g>

          {/* Cabin on top */}
          <g>
            <rect
              x="752"
              y="44"
              width="124"
              height="52"
              rx="6"
              fill="#3b82f6"
              opacity="0.92"
            />
            <rect
              x="752"
              y="44"
              width="124"
              height="52"
              rx="6"
              fill="none"
              stroke="#1d4ed8"
              strokeWidth="2"
              opacity="0.35"
            />
            <rect x="768" y="56" width="32" height="22" rx="3" fill="#eff6ff" />
            <rect x="828" y="56" width="32" height="22" rx="3" fill="#eff6ff" />
            <path
              d="M784 56 V78 M828 56 V78 M844 56 V78"
              stroke="#93c5fd"
              strokeWidth="1.5"
              opacity="0.8"
            />
          </g>

          <rect
            x="876"
            y="50"
            width="34"
            height="36"
            rx="3"
            fill="#2563eb"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  )
}
