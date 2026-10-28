import { useState } from "react";
import { AppDataProvider } from "./state/AppDataContext";
import { NavBar, type ScreenId } from "./components/NavBar";
import { HomeScreen } from "./screens/HomeScreen";
import { ToolkitScreen } from "./screens/ToolkitScreen";
import { TrackerScreen } from "./screens/TrackerScreen";
import { JournalScreen } from "./screens/JournalScreen";
import { MoreScreen } from "./screens/MoreScreen";
import { ActionPlannerScreen } from "./screens/ActionPlannerScreen";
import { PostTherapyCheckInScreen } from "./screens/PostTherapyCheckInScreen";
import { MorningCheckInScreen } from "./screens/MorningCheckInScreen";
import { CommunicationScreen } from "./screens/CommunicationScreen";
import { ResourcesScreen } from "./screens/ResourcesScreen";
import { ToolDetailSheet } from "./components/ToolDetailSheet";
import { GuidedMode } from "./components/GuidedMode";
import type { Tool } from "./types";

// Screens reached via the More list rather than the tab bar — like a
// pushed detail view in a native app, they hide the tab bar and rely on
// their own "‹ More" link to go back instead.
const MORE_SUB_SCREENS: ScreenId[] = ["planner", "posttherapy", "morningcheckin", "communication", "resources"];

function AppShell() {
  const [screen, setScreen] = useState<ScreenId>("home");
  const [openTool, setOpenTool] = useState<Tool | null>(null);
  const [guidedOpen, setGuidedOpen] = useState(false);
  const [guidedStartTool, setGuidedStartTool] = useState<Tool | undefined>(undefined);

  const backToMore = () => setScreen("more");

  return (
    <div className="min-h-dvh mx-auto max-w-md">
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
      {screen === "more" && <MoreScreen onOpen={setScreen} />}
      {screen === "planner" && <ActionPlannerScreen onBack={backToMore} />}
      {screen === "posttherapy" && <PostTherapyCheckInScreen onBack={backToMore} />}
      {screen === "morningcheckin" && <MorningCheckInScreen onBack={backToMore} />}
      {screen === "communication" && <CommunicationScreen onBack={backToMore} />}
      {screen === "resources" && <ResourcesScreen onBack={backToMore} />}

      {!MORE_SUB_SCREENS.includes(screen) && <NavBar current={screen} onChange={setScreen} />}

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
            setScreen(screenId as ScreenId);
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
