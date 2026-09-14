# 🤖 AGENTS.md — AI Agent Guidelines & Engineering Standards

> **프로젝트**: `hanpla-chart` (코드명: **PulseStream**)  
> **핵심 미션**: 초당 100건 이상의 고빈도 실시간 시세 데이터 스트림을 브라우저 메인 스레드 지연 없이 **60 FPS**로 렌더링하는 대용량 금융 데이터 터미널 구축  
> **대상**: 본 레포지토리에서 작업하는 모든 AI 에이전트(Antigravity 등) 및 개발자

---

## 1. 에이전트 역할 및 기본 원칙

당신은 **"고성능 프론트엔드 엔지니어링 전문가"**로서 본 프로젝트에 참여합니다.  
단순히 "동작하는 코드"를 작성하는 데 그치지 않고, **"극단적인 렌더링 최적화, 메모리 누수 방지, 타입 안정성, 확장 가능한 모듈 아키텍처"**를 최우선 가치로 삼아야 합니다.

### 🛡️ 6대 절대 원칙 (Non-Negotiables)

1. **Never Block the Main Thread**: 메인 스레드를 블로킹하는 연산이나 잦은 렌더링 루프를 유발하지 않는다.
2. **Strict Performance Throttling**: 고빈도 스트리밍 데이터를 직접 React State에 주입하지 않는다.
3. **No `any` Type**: TypeScript `strict` 모드를 준수하며, `any` 사용을 일체 금지한다.
4. **Virtualize Everything Large**: 대량의 리스트는 반드시 DOM 가상화(`@tanstack/react-virtual`)를 적용한다.
5. **Test Core Business Logic**: 링 버퍼, 데이터 파이프라인, 지표 연산 등 핵심 비즈니스 로직은 반드시 Vitest 단위 테스트를 동반한다.
6. **Design System First (No Inline Primitives)**: 버튼, 뱃지, 입력창 등 반복되는 저수준 UI 요소는 개별 컴포넌트에 인라인 Tailwind로 즉석 구현하지 않고, 반드시 `src/components/ui/`의 CVA 기반 공통 컴포넌트를 사용하거나 먼저 구축한 후 재사용한다.

---

## 2. 기술 스택 & 툴체인

| 영역                  | 스택                                                      | 비고                                    |
| :-------------------- | :-------------------------------------------------------- | :-------------------------------------- |
| **Runtime / Tooling** | **Node.js LTS, pnpm**                                     | 패키지 관리는 반드시 `pnpm` 사용        |
| **Framework**         | **React 19 + TypeScript (Strict)**                        | Vite 기반 SPA                           |
| **상태 관리**         | **Zustand**                                               | Transient updates 및 정밀 Selector 활용 |
| **차트 엔진**         | **Lightweight Charts (TradingView)**                      | Canvas 기반 초고속 시세 렌더링          |
| **가상화 & 캐시**     | **@tanstack/react-virtual, TanStack Query v5**            | 대량 렌더링 방어 및 REST 데이터 캐싱    |
| **스타일링**          | **Tailwind CSS + Radix UI Primitives + CVA**              | Headless A11y & 컴포넌트 변형 체계      |
| **아이콘**            | **Lucide Icons (`lucide-react`)**                         | 일관된 모던 아이콘 세트                 |
| **코드 품질**         | **ESLint (Flat Config) + Prettier + Husky + lint-staged** | 커밋 시 자동 린트 및 포맷팅             |
| **테스트**            | **Vitest, React Testing Library, Playwright**             | 파이프라인 단위 테스트 & E2E 테스트     |

---

## 3. Strict Performance-First 엔지니어링 제약 (Do's & Don'ts)

### ❌ 절대 하지 말아야 할 것 (Don'ts)

- **❌ `ws.onmessage = (e) => setState(e.data)` 직접 호출 금지**:
  초당 수십~수백 번의 리렌더링이 발생하여 브라우저가 프리징됩니다.
- **❌ 1,000건 이상의 아이템을 `array.map()`으로 직접 DOM 렌더링 금지**:
  DOM 노드 폭증으로 인한 메모리 누수와 가비지 컬렉터(GC) 스파이크를 초래합니다.
- **❌ 호가창(OrderBook) 50개 행 전체 리렌더링 금지**:
  1개 호가의 잔량이 바뀔 때마다 50개 Row 전체를 리렌더링하지 마십시오.
- **❌ `useEffect` 내부에서 데이터 가공 및 상태 연속 업데이트 남발 금지**:
  React 19 렌더링 사이클을 존중하고 불필요한 이펙트 체인을 만들지 마십시오.
- **❌ `any` 또는 무분별한 `as unknown as T` 단언 금지**:
  웹소켓 응답 등 외부 데이터는 Zod 또는 명확한 인터페이스와 타입 가드(`is...`)를 통해 검증하십시오.
- **❌ 개별 컴포넌트 내부 인라인 버튼/뱃지/인풋 즉석 조합 금지**:
  피처 작업 시 `<button className="rounded px-2 ...">` 형태로 그때그때 스타일을 임의 조합하지 마십시오.

### ✅ 반드시 지켜야 할 것 (Do's)

- **✅ Ring Buffer + RAF (requestAnimationFrame) 스케줄러 패턴 적용**:
  웹소켓 수신 데이터는 인메모리 링 버퍼에 적재하고, 16.6ms(60FPS) 주기의 RAF 틱에 맞춰 배치로 플러시(Flush)하십시오.
- **✅ 가상화 리스트(`@tanstack/react-virtual`) 적용**:
  체결창(Trade Stream) 및 종목 리스트는 화면 뷰포트에 보이는 20~30개 노드만 DOM에 유지하십시오.
- **✅ 호가 잔량 게이지는 CSS Variable 또는 Direct DOM 조작**:
  호가창의 잔량 막대 너비(Width) 변화는 React 컴포넌트 리렌더링 대신 CSS Variable(`--depth-ratio`) 주입을 우선 고려하십시오.
- **✅ 무거운 연산은 Web Worker로 오프로딩**:
  이동평균선(SMA), 볼린저 밴드, 바이너리 디코딩 연산은 메인 스레드가 아닌 `src/workers/`의 Web Worker에서 처리하십시오.
- **✅ 세분화된 Zustand Selector 구독**:
  `const state = useMarketStore()` 형태의 전체 구독을 금지하고, `useMarketStore(state => state.currentPrice)`처럼 필요한 최소 단위만 구독하십시오.
- **✅ CVA 기반 공통 UI 프리미티브(`src/components/ui/`) 우선 구축 및 재사용**:
  새로운 UI 인터랙션(버튼, 뱃지, 인풋 등)이 필요할 경우 `src/components/ui/`에 CVA 변형(variant/size/intent)을 정의하고 재사용하십시오.

---

## 4. 디렉토리 구조 & 아키텍처 컨벤션

본 프로젝트는 **피처 중심 모듈 구조 (Feature-driven Architecture)**를 채택합니다.  
각 피처는 독립적인 모듈로 격리되며, 필요한 컴포넌트, 훅, 스토어, 타입을 내부에 응집시킵니다.

```text
src/
├── app/                  # 앱 루트, 라우터, 전역 프로바이더
├── assets/               # 정적 애셋 (이미지, 폰트 등)
├── components/           # 전역 공통 UI 컴포넌트 (Button, Modal, Card 등 - Radix/CVA 기반)
│   ├── ui/               # 공통 저수준 프리미티브
│   └── PerformanceHud/   # 실시간 성능 진단 위젯 (FPS, Latency, 리렌더 카운트)
├── features/             # 도메인별 핵심 피처 모듈 (Feature-driven)
│   ├── chart/            # Canvas 캔들 차트, 보조지표 오버레이
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── orderbook/        # 실시간 50호가창 및 Depth 시각화
│   ├── trade-stream/     # 실시간 체결 내역 및 가상화 스크롤
│   └── ticker-list/      # 실시간 종목 감시창 (검색, 정렬, 북마크)
├── services/             # 네트워크 및 외부 연동 계층
│   ├── websocket/        # WebSocketManager (재연결, Ping-Pong, 버퍼)
│   └── api/              # Upbit/Binance REST API 클라이언트
├── stores/               # 전역 공유 상태 (앱 설정, 활성 심볼 등)
├── workers/              # Web Worker 스크립트 (지표 연산, 디코딩)
├── types/                # 프로젝트 전역 타입 정의
└── utils/                # 공통 유틸리티 (RingBuffer, RAFScheduler, 포맷터)
```

---

## 5. 명령어 레퍼런스 (Command Reference)

모든 작업은 `pnpm`을 기준으로 실행합니다.

```bash
# 의존성 설치
pnpm install

# 로컬 개발 서버 실행
pnpm dev

# 타입 검사
pnpm type-check

# 린트 검증 및 자동 수정
pnpm lint
pnpm lint:fix

# 코드 포맷팅
pnpm format

# 단위 테스트 실행 (Vitest)
pnpm test
pnpm test:watch

# 프로덕션 빌드
pnpm build
```

---

## 6. Git 커밋 & 브랜치 컨벤션

### 브랜치 전략 (GitHub Flow)

- `main`: 상시 배포 가능한 안정 버전
- `feat/<기능명>`: 신규 피처 개발
- `fix/<버그명>`: 버그 수정
- `perf/<최적화명>`: 렌더링/메모리 성능 최적화
- `refactor/<리팩토링명>`: 구조 개선
- `docs/<문서명>`: 문서 작성 및 수정

### 커밋 메시지 (Conventional Commits)

타입은 반드시 아래 태그 중 하나를 소문자로 사용합니다:

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `perf`: 성능 개선 (메모리 절감, 렌더링 최적화 등)
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `test`: 테스트 코드 추가 또는 수정
- `docs`: 문서 수정
- `chore`: 빌드 설정, 패키지 매니저 설정 등 잡무

```text
# 예시:
feat(orderbook): 50호가창 누적 잔량 시각화 바 구현
perf(pipeline): 링 버퍼 기반 16.6ms RAF 배치 디스패처 적용
test(utils): RingBuffer 용량 초과 시 FIFO 오버플로우 테스트 추가
```

---

## 7. AI 에이전트 작업 체크리스트

코드를 생성하거나 수정하기 전, 다음 체크리스트를 점검하십시오:

- [ ] 고빈도 데이터를 다룰 때 `setState`가 초당 60회 이상 직접 호출되고 있지 않은가?
- [ ] 대용량 리스트에 `@tanstack/react-virtual` 가상화가 적용되었는가?
- [ ] Zustand 구독이 전체 스토어가 아닌 필요한 selector 단위로 쪼개져 있는가?
- [ ] 신규 유틸리티나 버퍼 자료구조에 대응하는 단위 테스트가 작성되었는가?
- [ ] `any` 타입 없이 명확한 TypeScript 인터페이스가 정의되었는가?
- [ ] 버튼, 뱃지, 인풋 등 UI 요소가 인라인이 아닌 `src/components/ui/` 공통 CVA 컴포넌트로 구현되었는가?
- [ ] `pnpm type-check` 및 `pnpm lint`를 통과하는가?
