import type { Category, Intensity, JournalPrompt, Tool } from "../types";

/**
 * Starter toolkit data, transcribed from the user's handwritten toolkit.
 * Edit freely — names, categories, and "how to use it" text are all yours
 * to fill in. In-app edits (pencil icon on the Toolkit screen) are stored
 * separately in local storage and layered on top of this file, so this
 * file stays a clean source you can also hand-edit any time.
 *
 * `howTo` is left as a placeholder on purpose — write your own version of
 * how you actually use each tool.
 */

export const PLACEHOLDER_HOWTO = "Add your own notes on how you use this tool.";

export const CATEGORIES: Category[] = [
  {
    id: "predicting",
    name: "Predicting & Preventing",
    blurb: "Tools for catching anxiety early, before it builds.",
  },
  {
    id: "identifying",
    name: "Identifying & Feeling",
    blurb: "Tools for naming and moving through what's coming up.",
  },
  {
    id: "selfcare",
    name: "Self Care",
    blurb: "The daily-life basics that keep your baseline steady.",
  },
  {
    id: "communication",
    name: "Communication",
    blurb: "Phrases and habits for talking with the people in your life.",
  },
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Stable id (category + slugified name, or an explicit `extra.id` override)
// rather than an incrementing counter, so a user's saved favorites/tracker
// logs/journal tags don't shift when tools are added, removed, reordered,
// or renamed above — pass `id` in `extra` when renaming a tool so it keeps
// its original identity.
function tool(categoryId: Tool["categoryId"], name: string, extra: Partial<Tool> = {}): Tool {
  return {
    categoryId,
    name,
    howTo: PLACEHOLDER_HOWTO,
    ...extra,
    id: extra.id ?? `${categoryId}-${slugify(name)}`,
  };
}

// The classic 5-step CBT thought record.
export const CBT_PROMPTS: JournalPrompt[] = [
  { key: "situation", label: "Situation", placeholder: "What happened?" },
  { key: "thought", label: "Automatic thought", placeholder: "What went through your mind?" },
  { key: "feeling", label: "Feeling & intensity", placeholder: "e.g. anxious, 7/10" },
  {
    key: "evidence",
    label: "Evidence for & against the thought",
    placeholder: "What supports it? What argues against it?",
  },
  {
    key: "balanced",
    label: "Balanced thought & how you feel now",
    placeholder: "A fairer way to see it, and your feeling/intensity now",
  },
];

export const THOUGHTS_ON_TRIAL_PROMPTS: JournalPrompt[] = [
  { key: "thought", label: "The thought on trial", placeholder: "What thought are you examining?" },
  { key: "prosecution", label: "Evidence for the prosecution", placeholder: "What supports this thought?" },
  { key: "defense", label: "Evidence for the defense", placeholder: "What argues against it?" },
  { key: "verdict", label: "Verdict", placeholder: "What's a fairer conclusion?" },
];

export const GRATITUDE_PROMPTS: JournalPrompt[] = [
  { key: "one", label: "1." },
  { key: "two", label: "2." },
  { key: "three", label: "3." },
];

export const HONESTY_FRAMEWORK_PROMPTS: JournalPrompt[] = [
  { key: "lie", label: "What is it that you want to lie about?", placeholder: "Name it plainly." },
  { key: "why", label: "Why?", placeholder: "What are you hoping to avoid or protect?" },
  { key: "truth", label: "What is the truth?", placeholder: "Say it straight." },
  { key: "change", label: "How are you going to change your behavior?", placeholder: "What will you do differently?" },
];

export const IM_SORRY_WHAT_PROMPTS: JournalPrompt[] = [
  { key: "note", label: "I'm sorry you want me to feel bad for…", placeholder: "Say what it is, plainly." },
];

/**
 * Starter "might help right now" moods per tool — which check-in
 * intensities (1 Calm, 2 Stressed, 3 Overwhelming) each tool gets
 * suggested for on the Home screen. Fully editable in the app (open a
 * tool, tap a mood chip), this is just the starting point:
 * - the four grounding/in-the-moment predicting tools + everything in
 *   Identifying & Feeling cover Stressed and Overwhelming
 * - the rest of Predicting & Preventing is preventive/planning-oriented —
 *   it only shows up under Calm
 * - Self Care covers Calm and Stressed, stepping back once things tip
 *   into Overwhelming
 */
const MOODS_GROUNDING: Intensity[] = [2, 3];
const MOODS_PREVENTIVE: Intensity[] = [1];
const MOODS_IDENTIFYING: Intensity[] = [2, 3];
const MOODS_SELFCARE: Intensity[] = [1, 2];

export const DEFAULT_TOOLS: Tool[] = [
  // 1. Predicting & Preventing
  tool("predicting", "Start Stop Continue", {
    id: "predicting-ins-outs",
    moods: MOODS_PREVENTIVE,
    listBuckets: ["Start", "Stop", "Continue"],
  }),
  tool("predicting", "Identify Triggers", {
    id: "predicting-triggers",
    moods: MOODS_PREVENTIVE,
    listBuckets: ["Triggers"],
  }),
  tool("predicting", "Breath work", { guidedSeconds: 60, moods: MOODS_GROUNDING }),
  tool("predicting", "Take a break / walk away", { guidedSeconds: 90, moods: MOODS_GROUNDING }),
  tool("predicting", "5-4-3-2-1 (PQ exercise)", { guidedSeconds: 5 * 60, moods: MOODS_GROUNDING }),
  tool("predicting", "Muscle relaxation", { guidedSeconds: 90, moods: MOODS_GROUNDING }),
  tool("predicting", "Gratitude journaling", { journalPrompts: GRATITUDE_PROMPTS, moods: MOODS_PREVENTIVE }),
  tool("predicting", "Affirmations", { guidedSeconds: 60, moods: MOODS_PREVENTIVE }),
  tool("predicting", "List boundaries", { moods: MOODS_PREVENTIVE }),
  tool("predicting", "Action Planner", {
    howTo:
      "Use this when you're anxious about something coming up. Name your intention, your values, and the specific behavior you'll commit to — so you're measuring yourself against your own compass instead of waiting for someone else's approval. Save it, and come back to update your thinking as the situation gets closer or changes.",
    opensScreen: "planner",
  }),
  tool("predicting", "Morning Check-In", {
    howTo:
      "A few minutes before the day gets going. Name today's critical tasks, protect 30 minutes for yourself, and get ahead of where low self-esteem might show up — so you've already got a plan for it instead of getting caught off guard.",
    opensScreen: "morningcheckin",
  }),

  // 2. Identifying & Feeling
  tool("identifying", "Meditation", { id: "identifying-reiki", guidedSeconds: 36 * 60, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Prayers", { id: "identifying-abhishek", moods: MOODS_IDENTIFYING }),
  tool("identifying", "Journaling", { id: "identifying-journaling-blue-book", moods: MOODS_IDENTIFYING }),
  tool("identifying", "Therapy", { moods: MOODS_IDENTIFYING }),
  tool("identifying", "CBT", { journalPrompts: CBT_PROMPTS, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Ice cube", { guidedSeconds: 60, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Talk it out", { moods: MOODS_IDENTIFYING }),
  tool("identifying", "Text it out", { moods: MOODS_IDENTIFYING }),
  tool("identifying", "Make it cold", { guidedSeconds: 60, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Reduce sensory inputs", { guidedSeconds: 90, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Music", { guidedSeconds: 90, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Clarify assumptions", { moods: MOODS_IDENTIFYING }),
  tool("identifying", "Thoughts on trial", { journalPrompts: THOUGHTS_ON_TRIAL_PROMPTS, moods: MOODS_IDENTIFYING }),
  tool("identifying", "Honesty Framework", { journalPrompts: HONESTY_FRAMEWORK_PROMPTS, moods: [2] }),

  // 3. Self Care
  tool("selfcare", "Nutrition / water", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Gym", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Sleep", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Run", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Yoga", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Workout class", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Sports", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Call friend / family", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Shower", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Change clothes", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Walk", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Talk to Partner", { id: "selfcare-talk-to-nikki", moods: MOODS_SELFCARE }),
  tool("selfcare", "Cuddles", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Cooking", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Screen break", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Doodling", { moods: MOODS_SELFCARE }),
  tool("selfcare", "Post-Therapy Check-In", {
    howTo:
      "Use this right after a session, before you jump back into your day. Check in on how you're feeling, whether you need time to decompress, what you'll actually do about it, and — if you can't make the time — be honest with yourself about why.",
    opensScreen: "posttherapy",
  }),

  // 4. Communication
  tool("communication", "Talk it out"),
  tool("communication", "Text it out"),
  tool("communication", "Disclaimers"),
  tool("communication", "Read it out loud"),
  tool("communication", "Time limits"),
  tool("communication", "Energy check in"),
  tool("communication", "“Reset” or “redo”", { howTo: "Can we reset / redo that?" }),
  tool("communication", "“I'm having trouble listening right now”", {
    howTo: "I'm having trouble listening right now.",
  }),
  tool("communication", "Pause & come back"),
  tool("communication", "Rehearse / prep"),
  tool("communication", "Eye contact & body language"),
  tool("communication", "Find a safe environment", { id: "communication-safe-environment" }),
  tool("communication", "Communicate boundaries"),
  tool("communication", "Communicate triggers"),
  tool("communication", "Clarifying questions"),
  tool("communication", "Active listening"),
];
