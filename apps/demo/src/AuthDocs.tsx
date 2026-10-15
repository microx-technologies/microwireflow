import { Wireflow } from "microwireflow";
import "microwireflow/styles.css";
import { authFlow } from "@/flows/auth.tsx";

export function AuthDocs() {
  return <Wireflow flow={authFlow} />;
}
