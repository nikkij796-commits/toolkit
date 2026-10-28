export type ScreenId =
  | "home"
  | "toolkit"
  | "tracker"
  | "journal"
  | "more"
  | "planner"
  | "posttherapy"
  | "morningcheckin"
  | "communication"
  | "resources";

// A native-style 5-tab bar — the previous 6-8 tab versions ran out of room
// on narrow phones. Talk, Resources, Action Planner, and Post-Therapy
// Check-In live one tap deeper, in the More list, rather than each getting
// a permanent slot on the bar.
const TABS: { id: ScreenId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "◎" },
  { id: "toolkit", label: "Toolkit", icon: "◈" },
  { id: "tracker", label: "Tracker", icon: "▦" },
  { id: "journal", label: "Journal", icon: "✎" },
  { id: "more", label: "More", icon: "✺" },
];

export function NavBar({ current, onChange }: { current: ScreenId; onChange: (id: ScreenId) => void }) {
  return (
    // viewport-fit=cover (index.html) is what makes env(safe-area-inset-bottom)
    // resolve to a real value on iPhone instead of 0 — without it this padding
    // was a no-op and the bar sat right against the home-indicator swipe area.
    // The extra 6px on top of the inset gives a little more breathing room.
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t border-line/5 pb-[calc(env(safe-area-inset-bottom)+6px)]">
      <div className="mx-auto max-w-md grid grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.id === current;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center justify-center gap-1 py-2.5 text-xs"
              aria-current={active}
            >
              <span
                className={`text-lg leading-none ${active ? "text-sage-text" : "text-ink-soft"}`}
                aria-hidden
              >
                {tab.icon}
              </span>
              <span className={active ? "text-ink font-medium" : "text-ink-soft"}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
