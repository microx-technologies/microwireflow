import { Home } from "@demo/screens/Home.tsx";
import { Login } from "@demo/screens/Login.tsx";
import { Reset } from "@demo/screens/Reset.tsx";
import { defineFlow } from "microwireflow";

export const authFlow = defineFlow({
  nodes: [
    {
      id: "login",
      title: "Login",
      kind: "<<screen>>",
      component: <Login />,
      notes: "Entry point.",
    },
    {
      id: "login-error",
      title: "Login",
      kind: "<<error>>",
      component: <Login error="Bad credentials" />,
      notes: "Error state, same file.",
    },
    { id: "home", title: "Home", kind: "<<screen>>", component: <Home /> },
    {
      id: "reset",
      title: "Reset",
      kind: "<<screen>>",
      component: <Reset />,
      notes: "Password reset. Added: spec forgot edge needs a target.",
    },
  ],
  edges: [
    {
      from: "login",
      trigger: "submit",
      to: "home",
      label: "if valid",
      lineStyle: "solid",
    },
    {
      from: "login",
      trigger: "submit",
      to: "login-error",
      label: "if invalid",
      lineStyle: "dashed",
    },
    { from: "login", trigger: "forgot", to: "reset", lineStyle: "dotted" },
    { from: "home", trigger: "logout", to: "login" },
    { from: "reset", trigger: "send", to: "login" },
  ],
});
