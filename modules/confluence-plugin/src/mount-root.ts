import { createApp, Component, h } from "vue";
import {Diagram, DiagramType} from "@/model/Diagram/Diagram";
import store from "@/model/store2";

function parseTitle(code: string): string | undefined {
  const lines = code?.split('\n');
  const titleLine = lines?.find(l => l.startsWith('title '));
  if (titleLine) {
    return titleLine.substring(6).trim();
  }
}

export function mountRoot(doc: Diagram, component: Component) {
  console.debug('Mounting root', doc);
  // extract title from diagram code
  if (!doc.title && (doc.diagramType === DiagramType.Sequence || doc.diagramType === DiagramType.Mermaid)) {
    doc.title = parseTitle(doc.code);
  }
  store.state.diagram = doc;
  if (document.getElementById('app')) {

    const app = createApp(component);
    app.use(store).mount('#app')
  }
}
