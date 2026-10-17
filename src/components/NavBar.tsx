export type ScreenId =
  | "home"
  | "toolkit"
  | "tracker"
  | "journal"
  | "planner"
  | "posttherapy"
  | "communication"
  | "resources";

// Action Planner and Post-Therapy Check-In are deliberately left off the
// bottom nav — at 8 tabs, labels collided at narrow phone widths (e.g.
// "Tracker"/"Journal" touching at 360px). Both stay fully reachable from
// the launcher and their Toolkit entries.
const TABS: { id: ScreenId; label: string; icon: string }[] = [
  { id: "home", label: "Home", icon: "◎" },
  { id: "toolkit", label: "Toolkit", icon: "◈" },
  { id: "tracker", label: "Tracker", icon: "▦" },
  { id: "journal", label: "Journal", icon: "✎" },
  { id: "communication", label: "Talk", icon: "◐" },
  { id: "resources", label: "More", icon: "✺" },
];

export function NavBar({ current, onChange }: { current: ScreenId; onChange: (id: ScreenId) => void }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-paper/95 backdrop-blur border-t border-line/5 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md grid grid-cols-6">
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
