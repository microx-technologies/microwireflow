import { defineFlow } from "microwireflow";
import { Home } from "@/screens/Home.tsx";
import { Login } from "@/screens/Login.tsx";
import { LogoutConfirm } from "@/screens/LogoutConfirm.tsx";
import { Reset } from "@/screens/Reset.tsx";

export const authFlow = defineFlow({
  nodes: [
    {
      id: "login",
      title: "Login",
      kind: "<<screen>>",
      component: <Login />,
      notes:
        "Entry point. Submit branches on validity; both leaves stay visible.",
    },
    {
      id: "login-error",
      title: "Login",
      kind: "<<error>>",
      component: <Login error="Bad credentials — try again." />,
      notes: "Error state, same file. Red-inked to read as a correction.",
    },
    {
      id: "home",
      title: "Home",
      kind: "<<screen>>",
      component: <Home />,
      notes: "Signed-in landing. Logout asks first via a modal.",
    },
    {
      id: "logout-confirm",
      title: "Confirm logout",
      kind: "<<modal>>",
      component: <LogoutConfirm />,
      notes:
        "Modal kind proof: double-ruled badge. Confirm exits, cancel returns.",
    },
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
    { from: "home", trigger: "logout", to: "logout-confirm", label: "tap" },
    {
      from: "logout-confirm",
      trigger: "confirm",
      to: "login",
      label: "yes, out",
    },
    {
      from: "logout-confirm",
      trigger: "cancel",
      to: "home",
      label: "stay",
      lineStyle: "dashed",
    },
    { from: "reset", trigger: "send", to: "login" },
  ],
});
