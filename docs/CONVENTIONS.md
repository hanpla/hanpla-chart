# 📐 PulseStream 개발 및 협업 컨벤션 가이드 (docs/CONVENTIONS.md)

본 문서는 **PulseStream (`hanpla-chart`)** 프로젝트의 코드 일관성, 확장성 및 협업 효율성을 유지하기 위한 종합 개발 규칙입니다.

---

## 1. 코드 스타일 & TypeScript 컨벤션

### 1.1 기본 규칙

- **Strict TypeScript**: `tsconfig.json`의 `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`를 엄격히 준수합니다.
- **`any` 사용 절대 금지**: 불가피하게 동적 타입이 필요한 경우 `unknown`을 사용하고, 사용자 정의 타입 가드(`is...`)나 Zod 스키마를 통해 좁혀서(Narrowing) 사용합니다.
- **Type vs Interface**:
  - 객체 지향 모델 및 확장(`extends`)이 필요한 컴포넌트 Props는 `interface` 선언을 권장합니다.
  - 유니온, 인터섹션, 튜플, 원시 타입 별칭은 `type`을 사용합니다.
- **명시적 반환 타입**: 유틸리티 함수 및 훅은 반환 타입을 명시하여 예기치 않은 추론 오류를 방지합니다.

```typescript
// ✅ 좋은 예시: Discriminated Union과 타입 가드
export type WebSocketMessage =
  | { type: "ticker"; code: string; tradePrice: number }
  | { type: "orderbook"; code: string; units: OrderBookUnit[] };

export function isTickerMessage(
  msg: WebSocketMessage,
): msg is Extract<WebSocketMessage, { type: "ticker" }> {
  return msg.type === "ticker";
}
```

### 1.2 모듈 임포트 순서 (Import Order)

ESLint/Prettier에 의해 자동 정렬되도록 구성하며, 논리적 순서는 다음과 같습니다:

1. React 및 프레임워크 내장 모듈 (`react`, `react-dom`)
2. 외부 서드파티 라이브러리 (`zustand`, `@tanstack/react-virtual`, `lucide-react`)
3. 전역 공통 모듈 (`@/components`, `@/services`, `@/stores`, `@/utils`)
4. 현재 피처 내부 모듈 (`./components`, `./hooks`, `./types`)
5. 스타일 파일 (`./styles.css`)

---

## 2. 컴포넌트 & 피처 아키텍처 규칙

### 2.1 Feature-driven 디렉토리 격리

- 모든 비즈니스 도메인은 `src/features/<feature-name>/` 아래에 격리합니다.
- 각 피처는 외부로 공개할 컴포넌트/훅/타입만 `index.ts`를 통해 노출(Public API)합니다.
- **교차 참조 금지 규칙**: 피처 A가 피처 B의 내부 파일(`features/B/components/InternalModal.tsx`)을 직접 임포트할 수 없으며, 반드시 `features/B/index.ts`를 통해서만 접근해야 합니다.

### 2.2 React 19 컴포넌트 작성 수칙

- **불필요한 `useEffect` 금지**: 데이터 변환이나 파생 상태는 렌더링 도중 계산하거나 `useMemo`를 사용하고, 부수 효과(Side Effect)가 아닌 이상 `useEffect`로 상태를 동기화하지 않습니다.
- **콜백 안정성**: 하위 메모이제이션 컴포넌트로 전달되는 콜백은 `useCallback`으로 참조 동일성을 유지합니다.
- **Named Export 원칙**: 모든 컴포넌트는 `export default` 대신 `export const ComponentName = () => {}` 형태의 Named Export를 사용합니다.

---

## 3. UI 스타일링 및 디자인 시스템 (Tailwind + CVA + Radix)

### 3.1 Class Variance Authority (CVA) 작성 표준

반복되는 UI 변형(버튼 크기, 상태 색상, 뱃지 등)은 CVA를 활용하여 타입 안정성을 확보합니다.

```tsx
import { cva, type VariantProps } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium font-mono transition-colors",
  {
    variants: {
      intent: {
        up: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        down: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
        neutral: "bg-zinc-800 text-zinc-300 border border-zinc-700",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.2",
        md: "text-xs px-2 py-0.5",
      },
    },
    defaultVariants: {
      intent: "neutral",
      size: "md",
    },
  },
);
```

### 3.2 Tailwind 클래스 작성 순서

1. **Layout / Display**: `flex`, `grid`, `block`, `relative`, `absolute`
2. **Sizing / Box Model**: `w-full`, `h-10`, `max-w-md`
3. **Spacing**: `p-4`, `mx-auto`, `gap-2`
4. **Typography**: `font-mono`, `text-sm`, `font-semibold`, `text-zinc-100`
5. **Backgrounds & Borders**: `bg-zinc-900`, `border`, `border-zinc-800`, `rounded-lg`
6. **Effects & Interactivity**: `shadow-md`, `hover:bg-zinc-800`, `transition-all`

---

## 4. 상태 관리 컨벤션 (Zustand)

### 4.1 스토어 분리 원칙

- **전역 공통 스토어 (`src/stores/`)**: 마켓 심볼(`selectedSymbol`), 테마, 전체 WebSocket 연결 상태
- **피처 전용 스토어 (`src/features/*/stores/`)**: 해당 피처에서만 국소적으로 공유되는 상태 (예: 차트 지표 토글 상태)

### 4.2 Selector 정밀 구독

스토어 전체를 구독하는 안티패턴을 금지하고, 컴포넌트가 필요로 하는 최소 원시값(Primitive)만을 선택합니다.

```typescript
// ❌ 나쁜 예시 (전체 스토어 구독 -> 무분별한 리렌더링)
const { currentPrice, volume, symbol } = useMarketStore();

// ✅ 좋은 예시 (개별 셀렉터 구독)
const currentPrice = useMarketStore((state) => state.currentPrice);
const volume = useMarketStore((state) => state.volume);
```

---

## 5. Git 브랜치 전략 & 커밋 컨벤션

### 5.1 브랜치 전략 (GitHub Flow)

- `main`: 상시 배포 가능한 최신 프로덕션 브랜치
- 작업 브랜치 네이밍:
  - `feat/<기능-키워드>`: 신규 피처 (예: `feat/orderbook-gauge`)
  - `fix/<버그-키워드>`: 버그 수정 (예: `fix/ws-reconnect-leak`)
  - `perf/<최적화-키워드>`: 성능 튜닝 (예: `perf/ring-buffer-raf`)
  - `refactor/<리팩토링-키워드>`: 구조 변경 (예: `refactor/extract-cva-button`)
  - `docs/<문서-키워드>`: 문서 변경 (예: `docs/update-architecture`)

### 5.2 Conventional Commits 표준

커밋 메시지는 반드시 아래 포맷을 준수합니다:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

- **Header 예시**:
  - `feat(chart): TradingView Lightweight 차트에 실시간 볼륨 오버레이 추가`
  - `perf(pipeline): 링 버퍼 2048 크기 할당 및 RAF 배치 처리 구현`
  - `fix(websocket): 비정상 소켓 종료 시 지수 백오프 타이머가 중복 생성되는 버그 수정`
  - `test(utils): CircularRingBuffer 오버플로우 및 인덱스 롤오버 단위 테스트 추가`

---

## 6. 테스트 및 품질 보증 컨벤션

- **단위 테스트 (Vitest)**:
  - 순수 함수, 자료구조(RingBuffer), 수학 계산(이동평균, 볼린저밴드), 데이터 파서에 대해 테스트 코드 작성 (`*.test.ts`).
  - 정상 케이스, 경계값(Boundary) 케이스, 예외 케이스(에러 throw)를 모두 커버.
- **컴포넌트 테스트 (React Testing Library)**:
  - 가상화 리스트 렌더링, HUD 수치 표시 검증.
- **E2E 테스트 (Playwright)**:
  - 메인 대시보드 로드, 마켓 변경 인터랙션, 웹소켓 수신 상태 뱃지 전환 검증.
