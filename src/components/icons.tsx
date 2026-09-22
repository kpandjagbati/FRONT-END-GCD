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

export function IconSun({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6.2 6.2l1.4 1.4M16.4 16.4l1.4 1.4M6.2 17.8l1.4-1.4M16.4 7.6l1.4-1.4" />
    </svg>
  );
}

export function IconMoon({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M18.5 13.5A7.5 7.5 0 1 1 10.5 5.5 6 6 0 0 0 18.5 13.5Z" />
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

export function IconCalendar({ className }: Readonly<IconProps>) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3.5V7M16 3.5V7M3.5 10h17" />
    </svg>
  );
}
