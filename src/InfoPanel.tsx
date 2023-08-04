import { InfoPanelDateElement } from "./types";

// TODO abstract this a bit - maybe drive from query?
export function InfoElement({
  element,
}: {
  element: InfoPanelDateElement;
}): JSX.Element {
  return (
    <div style={{ border: "2px solid black", display: "grid" }}>
      <div style={{ fontSize: 20 }}>{element.title}</div>
      <div>{element.desc}</div>
      <div>{element.dates}</div>
    </div>
  );
}
export function InfoPanel(): JSX.Element {
  // const [{ infoPanelElements }] = useData(["infoPanelElements"]);
  const infoPanelElements: any[] = [];
  return (
    <div style={{ backgroundColor: "green" }}>
      {infoPanelElements &&
        infoPanelElements.map((element) => {
          return <InfoElement element={element} />;
        })}
    </div>
  );
}
