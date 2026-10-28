import type { ScreenId } from "../components/NavBar";
import { ScreenHeader } from "../components/ui";

const LINKS: { id: ScreenId; label: string; blurb: string; icon: string }[] = [
  { id: "communication", label: "Talk", blurb: "Conversation scripts", icon: "◐" },
  { id: "resources", label: "Resources", blurb: "Feelings wheel & notes", icon: "✺" },
  { id: "planner", label: "Action Planner", blurb: "Plan how you'll handle it", icon: "✦" },
  { id: "morningcheckin", label: "Morning Check-In", blurb: "Start the day with a plan", icon: "☀" },
  { id: "posttherapy", label: "Post-Therapy Check-In", blurb: "Decompress after a session", icon: "☾" },
];

export function MoreScreen({ onOpen }: { onOpen: (screen: ScreenId) => void }) {
  return (
    <div className="pb-28">
      <ScreenHeader title="More" subtitle="Everything else, one tap away." />
      <div className="px-5 space-y-2">
        {LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onOpen(link.id)}
            className="flex w-full items-center gap-3 rounded-2xl bg-surface/70 border border-line/10 p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage-soft text-lg text-ink"
              aria-hidden
            >
              {link.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold text-ink">{link.label}</span>
              <span className="block text-sm text-ink-soft">{link.blurb}</span>
            </span>
            <span className="text-ink-faint" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
