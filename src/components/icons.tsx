type IconProps = { className?: string };

export function IconHome({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function IconPhone({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3c0 1-1 2-2 2C10 19.5 4.5 14 4.5 5.5c0-1 1-2 2-2z" />
    </svg>
  );
}

export function IconUser({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.5-3.5 4-5 7-5s5.5 1.5 7 5" />
    </svg>
  );
}

export function IconScan({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function IconDollar({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M12 3v18M16.5 7.5c0-2-2-3.5-4.5-3.5S7.5 6 7.5 8s1.5 3 4.5 3.5 4.5 1.5 4.5 3.5-2 3.5-4.5 3.5-4.5-1.5-4.5-3.5" />
    </svg>
  );
}

export function IconFile({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M7 3.5h7l5 5V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
      <path d="M14 3.5V9h5" />
    </svg>
  );
}

export function IconLogin({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M10 7V4.5h10V19.5H10V17" />
      <path d="M3 12h12M11 8l4 4-4 4" />
    </svg>
  );
}

export function IconEye({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M2.5 12S6.5 6 12 6s9.5 6 9.5 6-4 6-9.5 6S2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function IconEyeOff({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5" />
      <path d="M6.7 6.8C4.4 8.2 2.5 12 2.5 12s4 6 9.5 6c1.6 0 3.1-.4 4.4-1" />
      <path d="M17.2 15.2C19.1 13.9 21.5 12 21.5 12S17.5 6 12 6c-.7 0-1.4.1-2 .3" />
    </svg>
  );
}

export function IconLock({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="5" y="11" width="14" height="9" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconChevronsLeft({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m11 6-6 6 6 6M19 6l-6 6 6 6" />
    </svg>
  );
}

export function IconWarning({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3.2 22 20.8H2L12 3.2Zm0 5.6-.9 6.4h1.8L12 8.8Zm0 8.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z" />
    </svg>
  );
}

export function IconChevronDown({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconChevronLeft({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m15 6-6 6 6 6" />
    </svg>
  );
}

export function IconChevronRight({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export function IconLogout({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M10 7V4.5h10V19.5H10V17" />
      <path d="M15 12H3M7 8l-4 4 4 4" />
    </svg>
  );
}

export function IconArrowRight({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronsRight({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m13 6 6 6-6 6M5 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronsDown({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m6 5 6 6 6-6M6 13l6 6 6-6" />
    </svg>
  );
}

export function IconChevronsUp({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m6 19 6-6 6 6M6 11l6-6 6 6" />
    </svg>
  );
}

export function IconCopy({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="8" y="8" width="11" height="13" rx="1.5" />
      <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20H8" />
    </svg>
  );
}

export function IconClose({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconMenu({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconChip({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3" />
      <rect x="10" y="10" width="4" height="4" rx="0.5" />
    </svg>
  );
}

export function IconSim({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M7 4.5h7.5L19 9v10.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z" />
      <rect x="9" y="12" width="6" height="5" rx="0.8" />
      <path d="M10 8.5h4" />
    </svg>
  );
}

export function IconPhoneOutgoing({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3c0 1-1 2-2 2C10 19.5 4.5 14 4.5 5.5c0-1 1-2 2-2z" />
      <path d="M14.5 5.5H20M16.5 3.5 20 5.5 16.5 7.5" />
    </svg>
  );
}

export function IconHistory({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
      <path d="M4.5 4.5V8H8" />
      <path d="M12 8v4.5l3 2" />
    </svg>
  );
}

export function IconCalendar({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M3.5 10h17" />
    </svg>
  );
}

/** Adobe-style PDF mark (readable on colored buttons). */
export function IconPdf({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 2.75h7.2L19.25 8v13.25A1 1 0 0 1 18.25 22.25H7A1 1 0 0 1 6 21.25V3.75A1 1 0 0 1 7 2.75z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14.1 2.9V7.4c0 .5.4.9.9.9h4.4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path
        d="M8.2 16.1V11h1.15c1.05 0 1.7.55 1.7 1.4 0 .82-.62 1.38-1.55 1.38H9.05v2.32H8.2zm.85-3.05h.28c.48 0 .78-.24.78-.65s-.3-.66-.78-.66h-.28v1.31zM12.35 16.1l1.05-5.1h1.05l.72 3.55.72-3.55h1.02l1.05 5.1h-.95l-.55-3.12-.58 3.12h-.93l-.58-3.12-.55 3.12h-.92z"
        fill="currentColor"
      />
    </svg>
  );
}

/** PDF + lock for secured export. */
export function IconPdfLock({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.5 2.75h6.4L17.25 7.2v9.05a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V3.75a1 1 0 0 1 1-1z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M12.8 2.9V6.7c0 .45.36.8.8.8h3.7" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path
        d="M7.55 14.35V10.2h.95c.88 0 1.42.46 1.42 1.18 0 .68-.5 1.15-1.28 1.15H8.3v1.82H7.55zm.75-2.55h.22c.4 0 .64-.2.64-.52s-.24-.53-.64-.53h-.22v1.05z"
        fill="currentColor"
      />
      <rect x="15.1" y="15.35" width="5.4" height="4.35" rx="0.85" stroke="currentColor" strokeWidth="1.45" />
      <path
        d="M16.35 15.35v-1.15a1.55 1.55 0 0 1 3.1 0v1.15"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Microsoft Excel-style mark. */
export function IconExcel({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13.5 3H8a1 1 0 0 0-1 1v3.5H4.75A.75.75 0 0 0 4 8.25v11A.75.75 0 0 0 4.75 20H13a1 1 0 0 0 1-1v-3.5h4.25a.75.75 0 0 0 .75-.75V8.5L13.5 3z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.2V7.5c0 .55.45 1 1 1h4.2" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="4" y="8.25" width="10" height="11.75" rx="0.75" fill="currentColor" opacity="0.95" />
      <path
        d="M6.35 11.05 8.2 14.05l-1.85 3h1.4l1.1-2 .1-.18.1.18 1.1 2h1.4l-1.85-3 1.85-3h-1.4l-1.1 2-.1.18-.1-.18-1.1-2h-1.4z"
        fill="#217346"
      />
      <path d="M15.2 10.6h4.3M15.2 13.2h4.3M15.2 15.8h3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

/** Microsoft Word-style mark. */
export function IconWord({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M13.5 3H8a1 1 0 0 0-1 1v3.5H4.75A.75.75 0 0 0 4 8.25v11A.75.75 0 0 0 4.75 20H13a1 1 0 0 0 1-1v-3.5h4.25a.75.75 0 0 0 .75-.75V8.5L13.5 3z"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.2V7.5c0 .55.45 1 1 1h4.2" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <rect x="4" y="8.25" width="10" height="11.75" rx="0.75" fill="currentColor" opacity="0.95" />
      <path
        d="M5.55 17.05 6.85 11.1h1.35l.9 4.15.9-4.15h1.35l1.3 5.95h-1.3l-.7-3.7-.9 3.7H8.35l-.9-3.7-.7 3.7H5.55z"
        fill="#2b579a"
      />
      <path d="M15.2 10.6h4.3M15.2 13h4.3M15.2 15.4h3" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}
