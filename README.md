# 🏖️ 브레이크타임 (Breaktime)

남은 연차를 가장 알차게 쓸 수 있는 **최적의 휴가 기간**을 찾아주는 웹 앱입니다.
공휴일과 주말을 연결하는 **브릿지 데이(bridge day)** 최적화와 **비수기** 가중치를 반영해,
연차 대비 휴식일이 가장 많은 구간을 점수순으로 추천합니다.

개인용 · 백엔드 없음 · 입력값은 브라우저(localStorage)에만 저장됩니다.

## 주요 기능

- 남은 연차 일수, 휴가 연도, 휴가 불가 기간(블랙아웃) 입력
- 상위 5개 휴가 구간을 0–100 점수로 추천
- 각 추천마다: 기간, 총 휴식일 / 사용 연차, 브릿지 효율·비수기 지수·공휴일 보너스, 포함 공휴일
- 결과 복사 및 `.ics` 캘린더 파일 내보내기
- 입력값 자동 저장(새로고침해도 유지)

## 추천 알고리즘

각 후보 구간(3–16일)에 대해 다음 점수를 계산합니다.

```
raw = 0.6 × 브릿지효율(leverage) + 0.3 × 비수기가중치 + 0.1 × 공휴일보너스
score = round(100 × raw / 최고raw)   // 상위 5개 정규화
```

- **비근무일** = 토요일 ∪ 일요일 ∪ 공휴일 ∪ 대체공휴일
- **leverage** = (구간 내 비근무일 수) − (사용 연차 일수); `leverage ≥ 1`인 구간만 후보
- 블랙아웃과 겹치는 구간은 제외, 연도 경계(12월→1월) 구간은 MVP에서 제외
- 3일 이상 겹치는 구간은 더 높은 점수만 유지(dedup), 동점 시 연차 적은 순 → 시작일 빠른 순

## 기술 스택

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict)
- **Tailwind CSS**
- **Zod** (입력 검증)
- **Vitest** + Testing Library (55개 테스트)
- 배포: **Vercel** (환경변수 불필요)

## 로컬 실행

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # 프로덕션 빌드
npm run lint       # ESLint
npm run test       # 단위 테스트 (알고리즘 + 공휴일 데이터)
```

## Vercel 배포

1. 이 저장소를 GitHub에 푸시합니다.
2. [vercel.com](https://vercel.com)에서 **New Project → Import**로 저장소를 선택합니다.
3. 프레임워크는 자동으로 **Next.js**로 감지됩니다. 환경변수 설정은 필요 없습니다.
4. **Deploy**를 누르면 공개 URL이 생성됩니다. 이후 `main`에 푸시할 때마다 자동 재배포됩니다.

## 공휴일 데이터

- **지원 범위:** 2026 ~ 2027년 (`lib/holidays/korea.ts`의 `coverageRange`)
- **데이터 버전:** `dataVersion` 필드로 스냅샷 날짜를 관리합니다.
- 지원 범위 밖 연도는 추측하지 않고 "지원하지 않는 연도" 상태를 표시합니다(정확성 우선).

### 공휴일 수정 런북

정부 공휴일 변경/오류 발견 시:

1. `lib/holidays/korea.ts`의 해당 날짜 수정
2. `dataVersion`을 새 날짜로 갱신
3. `npm run test`로 검증 (공휴일 픽스처 테스트 통과 확인)
4. 재배포

> ⚠️ 프로덕션 배포 전 공휴일 날짜는 [KASI(한국천문연구원)](https://www.kasi.re.kr/) 공식 데이터로 검증하세요.
> 특히 설날·추석·부처님오신날 등 음력 기반 공휴일과 대체공휴일 규정을 확인해야 합니다.

## 한계 (MVP)

- 한국 공휴일만 지원 (국가 선택 UI는 확장 대비용으로 잠금 처리)
- 실시간 항공/숙박 가격 미연동 (비수기는 정적 가중치 테이블 사용)
- 연도 경계(12월→1월) 브릿지 구간 미포함
- 캘린더 동기화·예약 연동·다중 사용자 기능 없음

## 프로젝트 구조

```
app/                 # Next.js App Router (layout, page)
components/           # PlannerForm, SuggestionList/Card, EmptyState
hooks/               # usePlannerStorage (localStorage)
lib/
  types.ts           # 도메인 타입
  holidays/          # 공휴일 프로바이더 + 한국 데이터
  candidates.ts      # 후보 구간 생성
  score.ts, rank.ts  # 점수 계산 + 랭킹
  scoring/weights.ts # 가중치 (튜닝 단일 지점)
  validation.ts      # Zod 스키마
  format.ts          # 날짜 포맷 + .ics 내보내기
data/seasonality-kr.ts  # 월별 비수기 가중치
```
