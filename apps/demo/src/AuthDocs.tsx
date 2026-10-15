import { Wireflow } from "microwireflow";
import "microwireflow/styles.css";
import { authFlow } from "@demo/flows/auth.tsx";

export function AuthDocs() {
  return <Wireflow flow={authFlow} />;
}
