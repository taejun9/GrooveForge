/**
 * GrooveForge 렌더러의 개발 서버와 프로덕션 번들 경계를 정의한다.
 * 데스크톱 패키지의 로컬 파일 경로에서도 자산을 찾도록 상대 base를 사용하고,
 * 기능 영역별 청크를 분리해 초기 UI 로딩과 장기 캐시의 변경 범위를 제한한다.
 */
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // Electron의 file:// 진입점은 절대 루트가 없으므로 모든 생성 자산 URL을 상대 경로로 만든다.
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    rolldownOptions: {
      output: {
        // 외부 라이브러리와 큰 내부 기능 묶음을 안정된 이름으로 분리한다.
        // 순서는 priority로 결정되며, 더 구체적인 그룹이 포괄적인 vendor보다 먼저 매칭된다.
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
              name: "workstation-editor-audition",
              test: /src[\\/]ui[\\/]editorAudition\.ts$/,
              priority: 2
            },
            {
              name: "workstation-selected-actions",
              test: /src[\\/]ui[\\/]selectedEventQuickActions\.ts$/,
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
              name: "workstation-guidance-panels",
              test: /src[\\/]ui[\\/]workstationGuidancePanels\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-shell-panels",
              test: /src[\\/]ui[\\/]workstationShellPanels\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-snapshot-compare",
              test: /src[\\/]ui[\\/]workstationSnapshotCompare\.ts$/,
              priority: 2
            },
            {
              name: "workstation-analysis",
              test: /src[\\/]ui[\\/]workstationAnalysis\.ts$/,
              priority: 2
            },
            {
              name: "workstation-app-helpers",
              test: /src[\\/]ui[\\/]workstationAppHelpers\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-app-quick-action-route-labels",
              test: /src[\\/]ui[\\/]workstationAppQuickActionRouteLabels\.ts$/,
              priority: 2
            },
            {
              name: "workstation-app-quick-action-palette",
              test: /src[\\/]ui[\\/]workstationAppQuickActionPalette\.ts$/,
              priority: 2
            },
            {
              name: "workstation-app-quick-actions",
              test: /src[\\/]ui[\\/]workstationAppQuickActions\.tsx$/,
              priority: 2
            },
            {
              name: "workstation-app-derivations",
              test: /src[\\/]ui[\\/]workstationAppDerivations\.tsx$/,
              priority: 2
            }
          ]
        }
      }
    }
  },
  server: {
    // 개발 서버를 루프백에만 열어 로컬 우선 앱이 의도치 않게 LAN에 노출되지 않게 한다.
    host: "127.0.0.1",
    port: 5173,
    strictPort: false
  }
});
