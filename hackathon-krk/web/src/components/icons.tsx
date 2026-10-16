import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 18, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export const IconLogout = (p: IconProps) => (
  <Svg {...p}><path d="M15 4h3.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H15" /><path d="M10 16l-4-4 4-4" /><path d="M6 12h10" /></Svg>
);
export const IconHome = (p: IconProps) => (
  <Svg {...p}><path d="M4 10.5L12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z" /></Svg>
);
export const IconTasks = (p: IconProps) => (
  <Svg {...p}><path d="M8.5 12l2.5 2.5 4.5-5M7 4h10a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3z" /></Svg>
);
export const IconWallet = (p: IconProps) => (
  <Svg {...p}><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3M15.5 13.5h1M6.5 8h11a2.5 2.5 0 0 1 2.5 2.5v6a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-6A2.5 2.5 0 0 1 6.5 8z" /></Svg>
);
export const IconChat = (p: IconProps) => (
  <Svg {...p}><path d="M5 5.5h14v10h-9l-5 4z" /></Svg>
);
export const IconActivity = (p: IconProps) => (
  <Svg {...p}><path d="M3.5 12h4L10 6l4 12 2.5-6h4" /></Svg>
);
export const IconUser = (p: IconProps) => (
  <Svg {...p}><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5M15.5 8.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" /></Svg>
);
export const IconSettings = (p: IconProps) => (
  <Svg {...p}><path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2M6 6l1.4 1.4M16.6 16.6L18 18M6 18l1.4-1.4M16.6 7.4L18 6M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /></Svg>
);
export const IconHelp = (p: IconProps) => (
  <Svg {...p}><path d="M9.8 9.5a2.2 2.2 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.5v.4M12 16.5v.2M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z" /></Svg>
);
export const IconSearch = (p: IconProps) => (
  <Svg {...p}><path d="M16 16l4 4M17.5 11a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" /></Svg>
);
export const IconBell = (p: IconProps) => (
  <Svg {...p}><path d="M10 20.5h4M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" /></Svg>
);
export const IconTool = (p: IconProps) => (
  <Svg {...p}><path d="M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5L16 12l-3-1-1-3z" /></Svg>
);
export const IconBrief = (p: IconProps) => (
  <Svg {...p}><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M4.5 7h15v11a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z" /></Svg>
);
export const IconUpDown = (p: IconProps) => (
  <Svg {...p}><path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4" /></Svg>
);
export const IconSide = (p: IconProps) => (
  <Svg {...p}><path d="M9.5 4.5v15M15 10l-2 2 2 2M6.5 4.5h11a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3z" /></Svg>
);
export const IconLock = (p: IconProps) => (
  <Svg {...p}><path d="M8 10.5v-3a4 4 0 0 1 8 0v3M7 10.5h10a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18v-5A2.5 2.5 0 0 1 7 10.5z" /></Svg>
);
export const IconInfo = (p: IconProps) => (
  <Svg {...p}><path d="M12 11v5M12 8v.2M20.5 12a8.5 8.5 0 1 1-17 0 8.5 8.5 0 0 1 17 0z" /></Svg>
);
export const IconArrow = (p: IconProps) => (
  <Svg {...p}><path d="M5 12h14M13 18l6-6-6-6" /></Svg>
);
export const IconDown = (p: IconProps) => (
  <Svg {...p}><path d="M7 10l5 5 5-5" /></Svg>
);
export const IconSparkle = (p: IconProps) => (
  <Svg {...p}><path d="M12 3.5l1.8 5 5 1.8-5 1.8-1.8 5-1.8-5-5-1.8 5-1.8z" /></Svg>
);
export const IconCheck = (p: IconProps) => (
  <Svg {...p} strokeWidth={2}><path d="M5 12l4.5 4.5L19 7" /></Svg>
);
export const IconAlert = (p: IconProps) => (
  <Svg {...p}><path d="M12 8v4.5M12 15.5v.1M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" /></Svg>
);
export const IconFile = (p: IconProps) => (
  <Svg {...p}><path d="M13 4H7.5A1.5 1.5 0 0 0 6 5.5v13A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V9zM13 4v5h5" /></Svg>
);
export const IconX = (p: IconProps) => (
  <Svg {...p} strokeWidth={1.9}><path d="M7 7l10 10M17 7L7 17" /></Svg>
);
export const IconPlus = (p: IconProps) => (
  <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
);
export const IconRight = (p: IconProps) => (
  <Svg {...p}><path d="M10 7l5 5-5 5" /></Svg>
);

export const ICONS = {
  logout: IconLogout,
  home: IconHome,
  tasks: IconTasks,
  wallet: IconWallet,
  chat: IconChat,
  activity: IconActivity,
  user: IconUser,
  settings: IconSettings,
  help: IconHelp,
  search: IconSearch,
  bell: IconBell,
  tool: IconTool,
  brief: IconBrief,
  updown: IconUpDown,
  side: IconSide,
  lock: IconLock,
  info: IconInfo,
  arrow: IconArrow,
  down: IconDown,
  sparkle: IconSparkle,
  check: IconCheck,
  alert: IconAlert,
  file: IconFile,
  x: IconX,
  plus: IconPlus,
  right: IconRight,
} as const;

export type IconName = keyof typeof ICONS;
