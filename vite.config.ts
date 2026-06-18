import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 3
            },
            {
              name: "icons-vendor",
              test: /node_modules[\\/]lucide-react[\\/]/,
              priority: 2
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 1
            },
            {
              name: "audio-engine",
              test: /src[\\/]audio[\\/]/,
              priority: 2
            },
            {
              name: "workstation-core",
              test: /src[\\/]domain[\\/]/,
              priority: 2
            },
            {
              name: "workstation-ui-model",
              test: /src[\\/]ui[\\/]workstationUiModel\.ts$/,
              priority: 2
            },
            {
              name: "workstation-pattern-tools",
              test: /src[\\/]ui[\\/](workstationPatternTools\.ts|workstationPatternResults\.tsx)$/,
              priority: 2
            },
            {
              name: "workstation-mix-panels",
              test: /src[\\/]ui[\\/]workstationMixPanels\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-compose-panels",
              test: /src[\\/]ui[\\/]workstationComposePanels\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-shell-panels",
              test: /src[\\/]ui[\\/]workstationShellPanels\.tsx$/,
              priority: 2
            }
          ]
        }
      }
    }
  },
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  }
});
