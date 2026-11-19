// Doodle icons: DoodleSprite (render once per page) + Doodle (use anywhere)

export function DoodleSprite() {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
      <defs>
        <symbol id="d-clover" {...common}>
          <circle cx="8.5" cy="8.5" r="4.5" />
          <circle cx="15.5" cy="8.5" r="4.5" />
          <circle cx="8.5" cy="15.5" r="4.5" />
          <circle cx="15.5" cy="15.5" r="4.5" />
          <path d="M12 10.5v3M10.5 12h3" />
        </symbol>
        <symbol id="d-bean" {...common}>
          <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)" />
          <path d="M8 7c4 2 4 8 8 10" />
        </symbol>
        <symbol id="d-bread" {...common}>
          <path d="M6 10a3 3 0 1 1 3-3.5h6A3 3 0 1 1 18 10v9a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
        </symbol>
        <symbol id="d-berry" {...common}>
          <path d="M12 21c-4-2-6-6-6-9 0-2 2-3 4-3 1 0 1.5.5 2 .5s1-.5 2-.5c2 0 4 1 4 3 0 3-2 7-6 9z" />
          <path d="M9.5 6l2.5 3 2.5-3" />
        </symbol>
        <symbol id="d-noodle" {...common}>
          <path d="M5 14c0-4 4-7 8-6s5 5 2 8-8 2-8-2 4-4 6-3" />
        </symbol>
      </defs>
    </svg>
  );
}

export function Doodle({ name, large = false }) {
  return (
    <svg className={large ? "icon icon-lg" : "icon"} aria-hidden="true">
      <use href={`#d-${name}`} />
    </svg>
  );
}
