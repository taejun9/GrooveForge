/**
 * 웹과 Electron 렌더러가 공유하는 React 애플리케이션 진입점이다.
 * 정적 HTML의 root 요소를 확인한 뒤 전역 스타일과 App을 연결하며,
 * 개발 중 생명주기 문제를 조기에 찾기 위해 StrictMode를 유지한다.
 */
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import { LocalizationProvider } from "./ui/localization";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  // 잘못된 HTML 셸에서 조용히 빈 화면이 되는 대신 패키징/통합 오류를 즉시 드러낸다.
  throw new Error("GrooveForge root element is missing.");
}

createRoot(root).render(
  <React.StrictMode>
    <LocalizationProvider>
      <App />
    </LocalizationProvider>
  </React.StrictMode>
);
