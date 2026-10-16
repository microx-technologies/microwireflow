import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default {
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
};
