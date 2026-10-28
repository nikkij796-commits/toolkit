export type CategoryId = "predicting" | "identifying" | "selfcare" | "communication";

export interface Category {
  id: CategoryId;
  name: string;
  blurb: string;
}

export interface JournalPrompt {
  key: string;
  label: string;
  placeholder?: string;
}

export interface Tool {
  id: string;
  categoryId: CategoryId;
  name: string;
  /** Short "how to use it" text. Placeholder unless the user has filled it in. */
  howTo: string;
  /** Optional guided-mode script for the "I need help now" flow. */
  guidedSteps?: string[];
  /** Seconds for the guided-mode timer, when relevant. */
  guidedSeconds?: number;
  /** When set, "Log entry" on this tool opens a structured journal form using these prompts instead of freeform text. */
  journalPrompts?: JournalPrompt[];
  /** Which check-in intensities this tool should be suggested for under "Might help right now". */
  moods?: Intensity[];
  /**
   * When set, this tool gets a persistent, cumulative list under each named
   * bucket (e.g. ["Start", "Stop", "Continue"]) instead of a one-off
   * journal entry — items you add stick around and build up over time,
   * shown as removable bubbles.
   */
  listBuckets?: string[];
  /**
   * When set, opening this tool offers a button that navigates to a
   * dedicated app screen (a NavBar ScreenId, e.g. "planner") instead of, or
   * alongside, its normal in-sheet actions.
   */
  opensScreen?: string;
}

export interface ToolListItem {
  id: string;
  text: string;
  createdAt: string; // ISO
}

// 1 = Calm, 2 = Stressed, 3 = Overwhelming.
export type Intensity = 1 | 2 | 3;

/**
 * Clamps any stored number into a valid Intensity. Needed because the app
 * briefly shipped a 5-level scale (1 Calm, 2 Unsettled, 3 Noticeable, 4
 * High, 5 Overwhelming) before settling on this 3-level one — any mood tag
 * or check-in saved to a browser during that window would otherwise sit
 * outside the current 1-3 range forever, silently never matching anything.
 *
 * This is a boundary clamp, not a semantic remap: 1-3 already mean exactly
 * what they mean today and pass through unchanged (a value of 3 is a
 * legitimate, current "Overwhelming" and must stay 3, not get pulled down
 * to 2). Only the genuinely out-of-range legacy values 4 and 5 — which
 * can't be anything but leftovers from the old scale — collapse to 3.
 */
export function normalizeIntensity(n: number): Intensity {
  if (n <= 1) return 1;
  if (n >= 3) return 3;
  return 2;
}

export interface CheckIn {
  id: string;
  timestamp: string; // ISO
  intensity: Intensity;
  note?: string;
  /**
   * How strong a specific named feeling was (1-5), set when logging a
   * feeling from the feelings wheel. Purely descriptive — unlike
   * `intensity`, it doesn't drive "Might help right now" recommendations
   * or any other app behavior, so it's shown alongside the feeling instead
   * of the coarse Calm/Stressed/Overwhelming label when present.
   */
  strength?: 1 | 2 | 3 | 4 | 5;
}

export const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export interface DayLog {
  /** yyyy-mm-dd */
  date: string;
  checked: boolean;
  note: string;
  toolIds: string[];
}

export interface JournalEntry {
  id: string;
  /** yyyy-mm-dd */
  date: string;
  createdAt: string; // ISO
  text: string;
  tags: string[];
}

/**
 * A saved, reopenable plan for handling something you're anxious about —
 * built around your own intention, values and behavior rather than an
 * outside opinion. Unlike JournalEntry, these are meant to be revisited and
 * edited as a situation evolves, so they carry a title and an updatedAt.
 */
export interface ActionPlan {
  id: string;
  title: string;
  intention: string;
  values: string;
  behavior: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * A dated, write-once snapshot logged right after a therapy session —
 * unlike ActionPlan, these aren't meant to be edited afterward, just
 * looked back on.
 */
export interface PostTherapyCheckIn {
  id: string;
  createdAt: string; // ISO
  feeling: string;
  needsDecompress: string;
  decompressPlan: string;
  noTimeReasons: string;
}

/**
 * A dated, write-once morning check-in — same spirit as PostTherapyCheckIn
 * (a daily snapshot, not something you go back and edit), just for
 * starting the day: today's critical tasks, personal time, and a
 * heads-up on where low self-esteem might show up and what to do about it.
 */
export interface MorningCheckIn {
  id: string;
  createdAt: string; // ISO
  criticalTasks: string;
  personalTime: string;
  insecurityMoments: string;
  insecurityPlan: string;
}

export interface ToolEdits {
  [toolId: string]: Partial<Pick<Tool, "name" | "howTo" | "guidedSteps" | "guidedSeconds" | "moods">>;
}

export interface CustomTool extends Tool {
  custom: true;
}

/** A user-added note in the Resources tab (links, articles, anything besides a coping tool). */
export interface Resource {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
}

export interface FeelingSecondary {
  name: string;
  tertiary: string[];
}

export type FeelingColor = "sage" | "lavender" | "clay" | "sky" | "rose" | "amber" | "slate";

export interface FeelingCore {
  name: string;
  color: FeelingColor;
  secondary: FeelingSecondary[];
}
