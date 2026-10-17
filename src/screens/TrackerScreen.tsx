import { useState } from "react";
import { useAppData } from "../state/AppDataContext";
import { currentWeekDates, formatDayNumber } from "../lib/week";
import { Card, ScreenHeader } from "../components/ui";
import { INTENSITY_LABELS } from "../components/IntensitySlider";
import type { Tool } from "../types";

export function TrackerScreen() {
  const { getDayLog, updateDayLog, toggleDayTool, tools, favorites, todayKeyStr, checkInsForDate } = useAppData();
  const week = currentWeekDates();
  const [openDate, setOpenDate] = useState<string | null>(todayKeyStr);

  const checkedCount = week.filter((d) => getDayLog(d.date).checked).length;

  const quickTools: Tool[] = [
    ...tools.filter((t) => favorites.includes(t.id)),
    ...tools.filter((t) => !favorites.includes(t.id)),
  ].slice(0, 12);

  return (
    <div className="pb-28">
      <ScreenHeader title="Tracker" subtitle="A simple week-at-a-glance." />

      <div className="px-5">
        <Card className="p-4 mb-4">
          <p className="text-sm text-ink-soft">
            {checkedCount === 0
              ? "Nothing logged yet this week — no rush."
              : `You've checked in on ${checkedCount} of 7 days this week.`}
          </p>
        </Card>

        <div className="space-y-2">
          {week.map((d) => {
            const log = getDayLog(d.date);
            const isOpen = openDate === d.date;
            return (
              <Card key={d.date} className={d.isToday ? "border-sage/40" : ""}>
                <div className="flex items-center gap-2 py-1 pl-1.5 pr-2">
                  <button
                    onClick={() => updateDayLog(d.date, { checked: !log.checked })}
                    aria-pressed={log.checked}
                    aria-label={`Mark ${d.label} ${formatDayNumber(d.date)} as ${log.checked ? "not done" : "done"}`}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm ${
                      log.checked
                        ? "bg-sage border-sage text-white"
                        : "border-line/15 text-transparent active:bg-line/5"
                    }`}
                  >
                    ✓
                  </button>
                  <button
                    className="flex flex-1 items-center gap-3 py-3 text-left"
                    onClick={() => setOpenDate(isOpen ? null : d.date)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex-1">
                      <span className={`font-medium ${d.isToday ? "text-ink" : "text-ink-soft"}`}>
                        {d.label} {formatDayNumber(d.date)}
                        {d.isToday && <span className="ml-2 text-xs text-sage-text">today</span>}
                      </span>
                      {log.toolIds.length > 0 && (
                        <p className="mt-0.5 text-xs text-ink-soft">
                          {log.toolIds.length} tool{log.toolIds.length === 1 ? "" : "s"} used
                        </p>
                      )}
                    </div>
                    <span className="text-ink-soft text-sm">{isOpen ? "−" : "+"}</span>
                  </button>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <textarea
                      value={log.note}
                      onChange={(e) => updateDayLog(d.date, { note: e.target.value })}
                      placeholder="A short note about the day (optional)"
                      rows={2}
                      className="w-full rounded-xl border border-line/10 bg-surface/80 px-3 py-2 text-sm"
                    />

                    {checkInsForDate(d.date).length > 0 && (
                      <>
                        <p className="mt-3 mb-1.5 text-xs font-medium text-ink-soft">Feelings logged</p>
                        <div className="space-y-1">
                          {checkInsForDate(d.date).map((c) => (
                            <div key={c.id} className="flex items-center justify-between text-xs text-ink-soft">
                              <span>
                                {c.note ? c.note : INTENSITY_LABELS[c.intensity]}
                                {c.note && (
                                  <span className="ml-1.5 text-ink-soft">
                                    ({c.strength ? `${c.strength}/5` : INTENSITY_LABELS[c.intensity]})
                                  </span>
                                )}
                              </span>
                              <span className="text-ink-soft">
                                {new Date(c.timestamp).toLocaleTimeString([], {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <p className="mt-3 mb-1.5 text-xs font-medium text-ink-soft">Tools used</p>
                    <div className="flex flex-wrap gap-1.5">
                      {quickTools.map((t) => {
                        const active = log.toolIds.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            onClick={() => toggleDayTool(d.date, t.id)}
                            aria-pressed={active}
                            className={`rounded-full px-3 py-1.5 text-xs ${
                              active ? "bg-sage text-white" : "bg-surface/70 border border-line/10 text-ink-soft"
                            }`}
                          >
                            {t.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
