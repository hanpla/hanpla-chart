# 🗺️ PulseStream 4주 개발 로드맵 & 마일스톤 (docs/ROADMAP.md)

본 문서는 **PulseStream (`hanpla-chart`)** 프로젝트의 4주 개발 마일스톤과 단계별 세부 태스크 및 완료 검증 기준을 정의합니다.

---

## 📅 로드맵 개요 (Milestones Overview)

| 단계        | 기간  | 주요 목표                                          | 핵심 산출물                                                   |
| :---------- | :---- | :------------------------------------------------- | :------------------------------------------------------------ |
| **Phase 1** | 1주차 | 프로젝트 기반 환경 구축 & 고빈도 데이터 파이프라인 | Vite 세팅, WebSocket 매니저, Ring Buffer, RAF 스케줄러        |
| **Phase 2** | 2주차 | 핵심 대시보드 UI 및 Canvas 차트 연동               | TradingView 차트, 50호가창, 가상화 체결창, 마켓 리스트        |
| **Phase 3** | 3주차 | 성능 최적화 & Web Worker 분리 & Performance HUD    | Web Worker 지표 계산, Direct CSS 호가 게이지, 성능 진단 HUD   |
| **Phase 4** | 4주차 | 테스트 자동화, 프로덕션 배포 & 포트폴리오 문서화   | Vitest / Playwright 테스트, Vercel 배포, 트러블슈팅 수치 정리 |

---

## 📌 Phase 1: 기반 인프라 & 데이터 파이프라인 (1주차)

> **목표**: 고빈도 웹소켓 수신 시 메인 스레드 프리징을 원천 차단하는 인메모리 버퍼링 파이프라인을 완성하고 단위 테스트로 안정성을 입증한다.

### 세부 태스크

- [x] **프로젝트 초기화 및 툴체인 설정**
  - [x] Vite + React 19 + TypeScript (Strict) 보일러플레이트 구성
  - [x] Tailwind CSS + CVA + Lucide Icons 환경 설정
  - [x] ESLint 9 Flat Config + Prettier + Husky + lint-staged 연동
- [ ] **WebSocket 통신 계층 (`src/services/websocket/`)**
  - [ ] `WebSocketManager` 클래스 구현
  - [ ] 업비트 Public WebSocket 연동 (Blob 바이너리 포맷 수신 처리)
  - [ ] 지수 백오프(Exponential Backoff) 기반 자동 재연결 로직 구현
  - [ ] Heartbeat Ping-Pong 및 탭 복귀 감지 메커니즘 구축
- [ ] **인메모리 버퍼링 파이프라인 (`src/utils/`)**
  - [ ] 고정 크기(2048) `CircularRingBuffer` 자료구조 구현
  - [ ] 16.6ms(60FPS) 주기 `RAFScheduler` 배치 플러시 모듈 구현
  - [ ] 링 버퍼 및 스케줄러에 대한 Vitest 단위 테스트 케이스 100% 작성
- [ ] **전역 기본 스토어 (`src/stores/`)**
  - [ ] Zustand 마켓 선택 스토어 (`useMarketStore`) 구성 (현재 심볼, 연결 상태)

---

## 📌 Phase 2: 핵심 대시보드 UI 구축 (2주차)

> **목표**: 금융 터미널의 필수 구성 요소(차트, 호가, 체결, 종목)를 조화롭게 배치하고 실시간 데이터를 부드럽게 시각화한다.

### 세부 태스크

- [ ] **종목 감시창 (`src/features/ticker-list/`)**
  - [ ] 전체 KRW 마켓 목록 TanStack Query 캐싱
  - [ ] `@tanstack/react-virtual` 적용 가상화 종목 리스트
  - [ ] 실시간 시세/등락률 검색, 정렬(거래대금순, 등락률순) 및 로컬스토리지 북마크
- [ ] **Canvas 캔들 차트 (`src/features/chart/`)**
  - [ ] TradingView `lightweight-charts` 엔진 컴포넌트 래핑
  - [ ] 과거 캔들 REST API 로드 및 실시간 틱 캔들 머지(`update()`) 로직
  - [ ] 차트 리사이즈 옵저버(ResizeObserver) 대응
- [ ] **실시간 체결창 (`src/features/trade-stream/`)**
  - [ ] 최근 1,000건 체결 링 버퍼 적재
  - [ ] `@tanstack/react-virtual` 가상 스크롤 뷰 구현 (DOM 25개 고정)
  - [ ] 대량 체결 발생 시 시각적 하이라이트 애니메이션
- [ ] **50단계 실시간 호가창 (`src/features/orderbook/`)**
  - [ ] 매수/매도 50단계 호가 테이블 렌더링
  - [ ] 누적 수량 기반 Depth Bar 너비 계산 및 CSS Variable 주입
  - [ ] 현재가 중심 자동 스크롤(Auto-Centering) 기능

---

## 📌 Phase 3: 성능 최적화 & Web Worker & Performance HUD (3주차)

> **목표**: React Profiler로 렌더링 병목을 수치화하고, Web Worker 연산 분리와 Direct DOM 기법으로 60FPS를 방어한다.

### 세부 태스크

- [ ] **Web Worker 연산 오프로딩 (`src/workers/`)**
  - [ ] `indicator.worker.ts` 작성 (이동평균선 SMA 20/60/120, 볼린저 밴드 연산)
  - [ ] Worker 통신 래퍼 훅 (`useIndicatorWorker`) 구현
  - [ ] 메인 스레드 연산 시간과 Worker 분리 후의 프레임 유지율 비교
- [ ] **호가창 및 리스트 렌더링 최적화**
  - [ ] 호가 Row 컴포넌트에 React.memo 및 세분화된 Zustand Selector 적용
  - [ ] CSS Custom Property(`--depth-ratio`) 기반 게이지 바 업데이트로 리렌더링 제거
- [ ] **실시간 성능 진단 HUD (`src/components/PerformanceHud/`)**
  - [ ] 실시간 FPS 카운터 구현 (`requestAnimationFrame` 델타 기반)
  - [ ] 메인 스레드 Latency 측정 위젯
  - [ ] 초당 처리 틱(TPS) 및 화면 내 DOM 노드 수 실시간 표시
  - [ ] 토글 가능한 다크 테마 금융 HUD UI 완성

---

## 📌 Phase 4: 테스트 자동화, 배포 & 포트폴리오 문서화 (4주차)

> **목표**: 포트폴리오로서 서류 통과율과 기술 면접 합격률을 극대화하기 위해 완성도 높은 테스트와 트러블슈팅 스토리를 완성한다.

### 세부 태스크

- [ ] **테스트 코드 완성**
  - [ ] Vitest: 데이터 버퍼, 웹소켓 재연결 상태 머신, 지표 함수 단위 테스트
  - [ ] React Testing Library: Performance HUD, 가상화 리스트 렌더링 테스트
  - [ ] Playwright: 마켓 전환 및 웹소켓 연결 성공 E2E 시나리오 테스트
- [ ] **CI/CD 및 프로덕션 배포**
  - [ ] GitHub Actions: PR 생성 시 Type-check, Lint, Test 자동 검증 파이프라인
  - [ ] Vercel 또는 Cloudflare Pages 프로덕션 배포
- [ ] **GitHub README & 트러블슈팅 문서 완성**
  - [ ] Chrome DevTools Performance 탭 전/후 프로파일링 스크린샷 첨부
  - [ ] 해결한 기술적 챌린지 3대 수치 성과 문서화
  - [ ] 라이브 데모 링크 및 인터랙티브 시연 가이드 작성
