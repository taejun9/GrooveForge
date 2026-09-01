/**
 * 역할: Node smoke 프로세스가 저장소의 TypeScript 모듈을 직접 불러올 수 있도록 전용 확장자 로더를 등록한다.
 * 흐름: 현재 모듈 기준으로 로더 URL을 계산해 Node 등록 API에 한 번 전달하고 이후 import 해석을 위임한다.
 * 안전 경계: 로더 등록 외의 파일·환경·네트워크 상태는 변경하지 않으며, 등록 실패는 상위 smoke를 즉시 실패시킨다.
 */
import { register } from "node:module";

register(new URL("./ts_extension_loader.mjs", import.meta.url));
