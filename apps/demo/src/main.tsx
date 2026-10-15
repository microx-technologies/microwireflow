import { AuthDocs } from "@demo/AuthDocs.tsx";
import * as React from "react";
import * as ReactDOM from "react-dom/client";

const root = document.getElementById("root");
if (!root) {
  throw new Error("missing #root");
}
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AuthDocs />
  </React.StrictMode>,
);
