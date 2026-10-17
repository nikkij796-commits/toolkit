import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { CATEGORIES, DEFAULT_TOOLS } from "../data/toolkitData";
import type {
  ActionPlan,
  CategoryId,
  CheckIn,
  CustomTool,
  DayLog,
  JournalEntry,
  PostTherapyCheckIn,
  Resource,
  Tool,
  ToolEdits,
  ToolListItem,
} from "../types";
import { normalizeIntensity } from "../types";

function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateKeyFromISO(iso: string): string {
  return todayKey(new Date(iso));
}

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface AppDataValue {
  tools: Tool[];
  toolsByCategory: (categoryId: CategoryId) => Tool[];
  toolById: (id: string) => Tool | undefined;
  categories: typeof CATEGORIES;

  favorites: string[];
  toggleFavorite: (toolId: string) => void;

  updateTool: (toolId: string, patch: Partial<Pick<Tool, "name" | "howTo" | "guidedSeconds" | "moods">>) => void;
  addCustomTool: (categoryId: CategoryId, name: string) => string;
  removeCustomTool: (toolId: string) => void;

  checkIns: CheckIn[];
  addCheckIn: (checkIn: Omit<CheckIn, "id" | "timestamp">) => void;
  checkInsForDate: (date: string) => CheckIn[];

  dayLogs: Record<string, DayLog>;
  todayKeyStr: string;
  getDayLog: (date: string) => DayLog;
  updateDayLog: (date: string, patch: Partial<Omit<DayLog, "date">>) => void;
  toggleDayTool: (date: string, toolId: string) => void;

  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "createdAt">) => void;
  updateJournalEntry: (id: string, patch: Partial<Pick<JournalEntry, "text" | "tags" | "date">>) => void;
  deleteJournalEntry: (id: string) => void;

  resources: Resource[];
  addResource: (resource: Omit<Resource, "id" | "createdAt">) => void;
  updateResource: (id: string, patch: Partial<Pick<Resource, "title" | "body">>) => void;
  deleteResource: (id: string) => void;

  getToolListItems: (toolId: string, bucket: string) => ToolListItem[];
  addToolListItem: (toolId: string, bucket: string, text: string) => void;
  removeToolListItem: (toolId: string, bucket: string, itemId: string) => void;

  actionPlans: ActionPlan[];
  addActionPlan: (plan: Omit<ActionPlan, "id" | "createdAt" | "updatedAt">) => void;
  updateActionPlan: (id: string, patch: Partial<Pick<ActionPlan, "title" | "intention" | "values" | "behavior">>) => void;
  deleteActionPlan: (id: string) => void;

  postTherapyCheckIns: PostTherapyCheckIn[];
  addPostTherapyCheckIn: (checkIn: Omit<PostTherapyCheckIn, "id" | "createdAt">) => void;
  deletePostTherapyCheckIn: (id: string) => void;
}

const AppDataContext = createContext<AppDataValue | null>(null);

function emptyDayLog(date: string): DayLog {
  return { date, checked: false, note: "", toolIds: [] };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [toolEdits, setToolEdits] = useLocalStorage<ToolEdits>("anxiety-toolkit:tool-edits", {});
  const [customTools, setCustomTools] = useLocalStorage<CustomTool[]>("anxiety-toolkit:custom-tools", []);
  const [favorites, setFavorites] = useLocalStorage<string[]>("anxiety-toolkit:favorites", []);
  const [rawCheckIns, setCheckIns] = useLocalStorage<CheckIn[]>("anxiety-toolkit:checkins", []);
  // Same old-scale guard as tool moods (see normalizeIntensity) — applied
  // on read so historical entries display correctly without touching
  // storage.
  const checkIns = useMemo<CheckIn[]>(
    () => rawCheckIns.map((c) => ({ ...c, intensity: normalizeIntensity(c.intensity) })),
    [rawCheckIns],
  );
  const [dayLogs, setDayLogs] = useLocalStorage<Record<string, DayLog>>("anxiety-toolkit:day-logs", {});
  const [journalEntries, setJournalEntries] = useLocalStorage<JournalEntry[]>("anxiety-toolkit:journal", []);
  const [resources, setResources] = useLocalStorage<Resource[]>("anxiety-toolkit:resources", []);
  const [toolLists, setToolLists] = useLocalStorage<Record<string, Record<string, ToolListItem[]>>>(
    "anxiety-toolkit:tool-lists",
    {},
  );
  const [actionPlans, setActionPlans] = useLocalStorage<ActionPlan[]>("anxiety-toolkit:action-plans", []);
  const [postTherapyCheckIns, setPostTherapyCheckIns] = useLocalStorage<PostTherapyCheckIn[]>(
    "anxiety-toolkit:post-therapy-checkins",
    [],
  );

  const tools = useMemo<Tool[]>(() => {
    const base = [...DEFAULT_TOOLS, ...customTools];
    return base.map((t) => {
      const edit = toolEdits[t.id];
      if (!edit) return t;
      const merged = { ...t, ...edit };
      // Guard against mood values saved under the app's old 5-level scale
      // (see normalizeIntensity) — without this, a tool tagged back then
      // silently stops matching any of today's 3 levels.
      if (merged.moods) {
        merged.moods = Array.from(new Set(merged.moods.map(normalizeIntensity))).sort((a, b) => a - b);
      }
      return merged;
    });
  }, [toolEdits, customTools]);

  const toolsByCategory = (categoryId: CategoryId) => tools.filter((t) => t.categoryId === categoryId);
  const toolById = (id: string) => tools.find((t) => t.id === id);

  const toggleFavorite = (toolId: string) => {
    setFavorites((prev) => (prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]));
  };

  const updateTool: AppDataValue["updateTool"] = (toolId, patch) => {
    setToolEdits((prev) => ({ ...prev, [toolId]: { ...prev[toolId], ...patch } }));
  };

  const addCustomTool: AppDataValue["addCustomTool"] = (categoryId, name) => {
    const id = newId();
    setCustomTools((prev) => [
      ...prev,
      { id, categoryId, name, howTo: "Add your own notes on how you use this tool.", custom: true },
    ]);
    return id;
  };

  const removeCustomTool = (toolId: string) => {
    setCustomTools((prev) => prev.filter((t) => t.id !== toolId));
    setFavorites((prev) => prev.filter((id) => id !== toolId));
  };

  const addCheckIn: AppDataValue["addCheckIn"] = (checkIn) => {
    setCheckIns((prev) => [{ ...checkIn, id: newId(), timestamp: new Date().toISOString() }, ...prev].slice(0, 500));
  };

  const checkInsForDate = (date: string) => checkIns.filter((c) => dateKeyFromISO(c.timestamp) === date);

  const getDayLog = (date: string) => dayLogs[date] ?? emptyDayLog(date);

  const updateDayLog: AppDataValue["updateDayLog"] = (date, patch) => {
    setDayLogs((prev) => ({ ...prev, [date]: { ...emptyDayLog(date), ...prev[date], ...patch } }));
  };

  const toggleDayTool = (date: string, toolId: string) => {
    setDayLogs((prev) => {
      const current = prev[date] ?? emptyDayLog(date);
      const has = current.toolIds.includes(toolId);
      const toolIds = has ? current.toolIds.filter((id) => id !== toolId) : [...current.toolIds, toolId];
      return { ...prev, [date]: { ...current, toolIds } };
    });
  };

  const addJournalEntry: AppDataValue["addJournalEntry"] = (entry) => {
    setJournalEntries((prev) => [{ ...entry, id: newId(), createdAt: new Date().toISOString() }, ...prev]);
  };

  const updateJournalEntry: AppDataValue["updateJournalEntry"] = (id, patch) => {
    setJournalEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const addResource: AppDataValue["addResource"] = (resource) => {
    setResources((prev) => [{ ...resource, id: newId(), createdAt: new Date().toISOString() }, ...prev]);
  };

  const updateResource: AppDataValue["updateResource"] = (id, patch) => {
    setResources((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const deleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const getToolListItems: AppDataValue["getToolListItems"] = (toolId, bucket) =>
    toolLists[toolId]?.[bucket] ?? [];

  const addToolListItem: AppDataValue["addToolListItem"] = (toolId, bucket, text) => {
    const item: ToolListItem = { id: newId(), text, createdAt: new Date().toISOString() };
    setToolLists((prev) => {
      const forTool = prev[toolId] ?? {};
      const forBucket = forTool[bucket] ?? [];
      return { ...prev, [toolId]: { ...forTool, [bucket]: [...forBucket, item] } };
    });
  };

  const removeToolListItem: AppDataValue["removeToolListItem"] = (toolId, bucket, itemId) => {
    setToolLists((prev) => {
      const forTool = prev[toolId] ?? {};
      const forBucket = forTool[bucket] ?? [];
      return { ...prev, [toolId]: { ...forTool, [bucket]: forBucket.filter((i) => i.id !== itemId) } };
    });
  };

  const addActionPlan: AppDataValue["addActionPlan"] = (plan) => {
    const now = new Date().toISOString();
    setActionPlans((prev) => [{ ...plan, id: newId(), createdAt: now, updatedAt: now }, ...prev]);
  };

  const updateActionPlan: AppDataValue["updateActionPlan"] = (id, patch) => {
    setActionPlans((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    );
  };

  const deleteActionPlan = (id: string) => {
    setActionPlans((prev) => prev.filter((p) => p.id !== id));
  };

  const addPostTherapyCheckIn: AppDataValue["addPostTherapyCheckIn"] = (checkIn) => {
    setPostTherapyCheckIns((prev) => [{ ...checkIn, id: newId(), createdAt: new Date().toISOString() }, ...prev]);
  };

  const deletePostTherapyCheckIn = (id: string) => {
    setPostTherapyCheckIns((prev) => prev.filter((c) => c.id !== id));
  };

  const value: AppDataValue = {
    tools,
    toolsByCategory,
    toolById,
    categories: CATEGORIES,
    favorites,
    toggleFavorite,
    updateTool,
    addCustomTool,
    removeCustomTool,
    checkIns,
    addCheckIn,
    checkInsForDate,
    dayLogs,
    todayKeyStr: todayKey(),
    getDayLog,
    updateDayLog,
    toggleDayTool,
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    resources,
    addResource,
    updateResource,
    deleteResource,
    getToolListItems,
    addToolListItem,
    removeToolListItem,
    actionPlans,
    addActionPlan,
    updateActionPlan,
    deleteActionPlan,
    postTherapyCheckIns,
    addPostTherapyCheckIn,
    deletePostTherapyCheckIn,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export { todayKey };
