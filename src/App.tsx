import {
  ImperativePanelGroupHandle,
  ImperativePanelHandle,
} from "react-resizable-panels";
import "./App.css";

import { useEffect, useRef, useState } from "react";
import { AdjacencyMatrix } from "./AdjacencyMatrixComponent";
import { InfoPanel } from "./InfoPanel";
import { Network } from "./Network";
import { FilterEvents, Timeline } from "./Timeline";
import { ObjV2 } from "./types";
function App() {
  const ref = useRef<ImperativePanelGroupHandle>(null);

  const resetLayout = () => {
    const panelGroup = ref.current;
    if (panelGroup) {
      // Reset each Panel to 50% of the group's width
      panelGroup.setLayout([50, 50]);
    }
  };

  const timelinePanelRef = useRef<ImperativePanelHandle>(null);
  const [paneSize, setPaneSize] = useState<number | null>(null);

  useEffect(() => {
    if (timelinePanelRef.current) {
      setPaneSize(timelinePanelRef.current.getSize());
    }
  }, [timelinePanelRef.current?.getSize]);
  const canvasSize: ObjV2 = { x: 1000, y: 300 };
  return (
    <div
      style={{
        width: canvasSize.x,
        height: canvasSize.y,
      }}
    >
      <FilterEvents />
      {/* <div className={styles.Container}> */}
      {/* <PanelGroup direction="vertical">
          <Panel
          defaultSize={100}
          className={styles.Panel}
          ref={timelinePanelRef}
          >
        <div className={styles.PanelContent}> */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            border: "3px solid black",
          }}
        >
          <InfoPanel />
          <Timeline stageSize={{ x: 1000, y: 500 }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            border: "3px solid black",
          }}
        >
          <div
            style={{
              border: "3px solid black",
            }}
          >
            <AdjacencyMatrix />
          </div>
          <div
            style={{
              border: "3px solid black",
            }}
          >
            <Network stageSize={{ x: 500, y: 500 }} />
          </div>
        </div>
      </div>
      {/* </div> */}
      {/* TEST */}
      {/* </Panel>
          <ResizeHandle /> */}
      {/* <Panel className={styles.Panel}> */}
      {/* <div className={styles.PanelContent}> */}
      {/* <Network stageSize={{ x: canvasSize.x, y: paneSize || 0 }} /> */}
      {/* </div> */}
      {/* <Timeline /> */}
      {/* <AddNewEvent /> */}
      {/* </Panel> */}
      {/* </PanelGroup> */}
      {/* </div> */}
    </div>
  );
}

export default App;
const PanelStyles: Record<string, React.CSSProperties> = {
  container: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: " center",
    justifyContent: " center",
    overflow: "hidden",
    borderRadius: " 0.5rem",
  },
};
