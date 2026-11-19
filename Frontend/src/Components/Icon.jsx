/* Line-art icons, same hand-drawn feel as the brand doodles */
const ICONS = {
  Coffee: (
    <>
      <ellipse cx="12" cy="12" rx="6" ry="9" transform="rotate(35 12 12)" />
      <path d="M8.5 7c3 2 1 4 4 5s1 4 3.5 5" />
    </>
  ),
  Drink: (
    <>
      <path d="M7 5h10l-1.2 14a1.5 1.5 0 0 1-1.5 1.4h-4.6A1.5 1.5 0 0 1 8.2 19z" />
      <path d="M13 5l2-3" />
      <path d="M7.6 11h8.8" />
    </>
  ),
  Pasta: (
    <>
      <circle cx="12" cy="12" r="2.5" />
      <path d="M4.5 12a7.5 7.5 0 0 1 15 0" />
      <path d="M7.5 17.5a6 6 0 0 0 10-4" />
      <path d="M6 9.5a6.5 6.5 0 0 1 4-3.5" />
    </>
  ),
  Bread: (
    <path d="M6 9a3 3 0 0 1 1-5.5c1-.7 2-.5 3 0h4c1-.5 2-.7 3 0A3 3 0 0 1 18 9v10a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 6 19z" />
  ),
  Rice: (
    <>
      <path d="M4 11h16a8 8 0 0 1-16 0z" />
      <path d="M8 20.5h8" />
      <path d="M9 8c0-1.2 1-1.2 1-2.5M13 8c0-1.2 1-1.2 1-2.5" />
    </>
  ),
  Snack: (
    <>
      <path d="M7 9l1 11h8l1-11z" />
      <path d="M9 9V4M12 9V3M15 9V4" />
    </>
  ),
  Sweets: (
    <>
      <path d="M12 7.5c-5 0-7 3-6 7 1 4 4 6.5 6 6.5s5-2.5 6-6.5c1-4-1-7-6-7z" />
      <path d="M9 4.5l3 3 3-3" />
      <path d="M10 12v.01M14 12v.01M12 15.5v.01" />
    </>
  ),
  Plus: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  Clover: (
    <>
      <circle cx="9" cy="9" r="3.5" />
      <circle cx="15" cy="9" r="3.5" />
      <circle cx="9" cy="15" r="3.5" />
      <circle cx="15" cy="15" r="3.5" />
    </>
  ),
};

export default function Icon({ name, size = 28 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}