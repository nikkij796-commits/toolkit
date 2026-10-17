import { useState } from "react";
import { AppDataProvider } from "./state/AppDataContext";
import { NavBar, type ScreenId } from "./components/NavBar";
import { LauncherScreen } from "./screens/LauncherScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { ToolkitScreen } from "./screens/ToolkitScreen";
import { TrackerScreen } from "./screens/TrackerScreen";
import { JournalScreen } from "./screens/JournalScreen";
import { ActionPlannerScreen } from "./screens/ActionPlannerScreen";
import { PostTherapyCheckInScreen } from "./screens/PostTherapyCheckInScreen";
import { CommunicationScreen } from "./screens/CommunicationScreen";
import { ResourcesScreen } from "./screens/ResourcesScreen";
import { ToolDetailSheet } from "./components/ToolDetailSheet";
import { GuidedMode } from "./components/GuidedMode";
import type { Tool } from "./types";

type AppScreen = "launcher" | ScreenId;

function AppShell() {
  const [screen, setScreen] = useState<AppScreen>("launcher");
  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [guidedStartTool, setGuidedStartTool] = useState<Tool | undefined>(undefined);

  if (screen === "launcher") {
    return (
      <div className="min-h-dvh mx-auto max-w-md">
        <LauncherScreen onOpen={setScreen} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh mx-auto max-w-md">
      <button
        onClick={() => setScreen("launcher")}
        className="fixed right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-ink-soft shadow-sm border border-line/5"
        aria-label="Back to app home"
      >
        {/* Inline SVG rather than a Unicode glyph (⌂ previously) — that
            character has no reliable fallback across phone fonts and was
            rendering as an ambiguous bell-like shape instead of "home". An
            app-grid icon is unambiguous and renders identically everywhere. */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
          <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" />
        </svg>
      </button>

      {screen === "home" && (
        <HomeScreen
          onOpenTool={setOpenTool}
          onStartGuided={() => {
            setGuidedStartTool(undefined);
            setGuidedOpen(true);
          }}
        />
      )}
      {screen === "toolkit" && <ToolkitScreen onOpenTool={setOpenTool} />}
      {screen === "tracker" && <TrackerScreen />}
      {screen === "journal" && <JournalScreen />}
      {screen === "planner" && <ActionPlannerScreen />}
      {screen === "posttherapy" && <PostTherapyCheckInScreen />}
      {screen === "communication" && <CommunicationScreen />}
      {screen === "resources" && <ResourcesScreen />}

      <NavBar current={screen} onChange={setScreen} />

      {openTool && (
        <ToolDetailSheet
          tool={openTool}
          onClose={() => setOpenTool(null)}
          onStartGuided={(tool) => {
            setOpenTool(null);
            setGuidedStartTool(tool);
            setGuidedOpen(true);
          }}
          onOpenScreen={(screenId) => {
            setOpenTool(null);
            setScreen(screenId as AppScreen);
          }}
        />
      )}

      {guidedOpen && (
        <GuidedMode
          startTool={guidedStartTool}
          onClose={() => {
            setGuidedOpen(false);
            setGuidedStartTool(undefined);
          }}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppShell />
    </AppDataProvider>
  );
}

export default App;
