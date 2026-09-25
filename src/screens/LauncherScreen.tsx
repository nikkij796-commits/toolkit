import type { ScreenId } from "../components/NavBar";

const LINKS: { id: ScreenId; label: string; blurb: string; icon: string }[] = [
  { id: "home", label: "Home", blurb: "Quick check-in", icon: "◎" },
  { id: "toolkit", label: "Toolkit", blurb: "Browse coping tools", icon: "◈" },
  { id: "tracker", label: "Tracker", blurb: "Your week at a glance", icon: "▦" },
  { id: "journal", label: "Journal", blurb: "Freeform entries", icon: "✎" },
  { id: "planner", label: "Action Planner", blurb: "Plan how you'll handle it", icon: "✦" },
  { id: "communication", label: "Talk", blurb: "Conversation scripts", icon: "◐" },
  { id: "resources", label: "Resources", blurb: "Feelings wheel & notes", icon: "✺" },
];

export function LauncherScreen({ onOpen }: { onOpen: (screen: ScreenId) => void }) {
  return (
    <div className="min-h-dvh flex flex-col justify-center px-5 py-10">
      <div className="text-center">
        <h1 className="text-3xl font-semibold text-ink">Anxiety Toolkit</h1>
        <p className="mt-2 text-base text-ink-soft">Your personal coping-skills companion.</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3">
        {LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onOpen(link.id)}
            className="flex flex-col items-start gap-2 rounded-2xl bg-white/70 border border-black/10 p-5 text-left shadow-sm active:scale-[0.98] transition-transform"
          >
            <span className="text-2xl text-sage" aria-hidden>
              {link.icon}
            </span>
            <span className="text-base font-semibold text-ink">{link.label}</span>
            <span className="text-sm text-ink-soft">{link.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
