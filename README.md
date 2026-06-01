# 안심식품 검색기 (Food Safety Search)

식품의약품안전처가 공식 발표한 **회수·판매중지 이력**을 식품명·제조사명·바코드로 즉시 조회하는 모바일 우선 웹 서비스.

검색 결과를 **위험 / 주의 / 안전** 3단계로 직관적으로 표시해, 일반 소비자가 마트나 집에서 빠르게 안전성을 확인할 수 있습니다.

## 주요 기능

- 🔍 **빠른 검색** — 메모리 기반 검색으로 응답 1ms 미만 (전체 ~355건)
- 🚨 **3단계 등급** — 1·2등급(위험, 빨강) / 3등급(주의, 앰버) / 0건(안전, 초록)
- 📱 **모바일 우선** — 데스크탑에선 phone 카드 형태로 표시
- 🌙 **다크 모드** — OS 설정 자동 인식 + 토글 (localStorage 영속화)
- 🔗 **공유 가능한 링크** — `?q=낙지&seq=20260529...` 형태로 검색/상세 직접 링크
- 🕒 **검색 히스토리** — localStorage LRU 5개
- 🖼️ **이미지 뷰어** — 상세 사진 클릭 시 풀스크린 확대
- 💡 **추천 검색** — 가장 최근 등록된 회수 제품 3개 (매일 04:00 자동 갱신)
- 🔁 **자동 동기화** — 매일 04:00 식약처 API 증분 동기화
- 🛡️ **운영 알림** — 동기화 실패 시 Discord 웹훅 즉시 전송 + 로그 누적

## 기술 스택

- **프론트엔드**: React 18 + Vite 5 (JavaScript, TypeScript 미사용)
- **백엔드**: Node.js + Express 4
- **데이터**: 식약처 OpenAPI (`I0490`) → 메모리 + JSON 파일 (DB 없음)
- **테스트**: `node:test` (백엔드 의존성 0) + Vitest (프론트)
- **외부 의존성**: cors, dotenv, fast-xml-parser, node-cron, node-fetch

## 빠른 시작

### 사전 준비
- Node.js 18 이상
- 식약처 OpenAPI 인증키 ([data.go.kr](https://data.go.kr) 또는 [foodsafetykorea.go.kr](https://foodsafetykorea.go.kr)에서 발급, 개발계정은 자동 승인)

### 설치 및 실행

```bash
# 1. 클론
git clone https://github.com/<your-account>/food-safety-search.git
cd food-safety-search

# 2. 환경 변수
cp .env.example .env
# .env 열어서 FOODSAFETY_API_KEY 채우기

# 3. 백엔드 (한 터미널)
cd backend
npm install
npm start
# → 최초 기동 시 식약처에서 약 355건 다운로드 (~5초)
# → http://localhost:3001

# 4. 프론트엔드 (다른 터미널)
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

브라우저로 http://localhost:5173 열면 끝. 추천 검색 칩이 자동으로 채워집니다.

### 테스트

```bash
cd backend && npm test    # 42개 통과
cd frontend && npm test   # 27개 통과
```

## 프로젝트 구조

```
food-safety-search/
├── backend/
│   ├── src/
│   │   ├── server.js         # Express + cron 부트스트랩
│   │   ├── config.js         # .env 값 모음
│   │   ├── constants/        # API 응답 코드, FIELDS, GRADES
│   │   ├── routes/
│   │   │   ├── search.js     # GET /api/search
│   │   │   └── search.logic.js  # 순수 함수 (테스트 가능)
│   │   ├── services/
│   │   │   ├── store.js      # 메모리 + JSON I/O
│   │   │   ├── sync.js       # 식약처 동기화
│   │   │   └── notify.js     # Discord + 로그
│   │   └── utils/sanitize.js # 데이터 정제 (placeholder 8종)
│   ├── data/recalls.json     # 회수 이력 캐시 (자동 생성)
│   └── logs/sync.log         # 동기화 누적 로그
└── frontend/
    └── src/
        ├── App.jsx           # 모드 라우팅 (home/results/detail)
        ├── components/       # GradeBadge, ResultCard, ImageViewer 등
        ├── screens/          # HomeScreen, ResultsScreen, DetailScreen
        ├── hooks/            # useSearch, useTheme, useUrlSync, useSearchHistory
        ├── constants/        # 한국어 문자열, 등급, API 설정
        ├── utils/            # formatDate
        └── styles/           # tokens / base / layout / components / animations
```

## API

### `GET /api/search?q=검색어`

```json
{
  "query": "낙지",
  "kind": "danger",
  "total": 1,
  "dangerCount": 1,
  "cautionCount": 0,
  "lastUpdated": "2026-06-01T10:37:09.486Z",
  "results": [
    { "PRDTNM": "낙지젓", "BSSHNM": "...", "RTRVL_GRDCD_NM": "1등급", ... }
  ]
}
```

검색 매칭은 **공백 분리 토큰의 AND**, 각 토큰은 제품명·제조사명·바코드 중 하나에라도 부분일치하면 매칭됩니다.
예: `q=강황가루 진성` → 제품명에 "강황가루" + 제조사에 "진성"이 모두 있는 row만.

### `GET /api/status`

```json
{
  "count": 355,
  "lastUpdated": "2026-06-01T10:37:09.486Z",
  "recent": ["국화", "꼴뚜기젓", "명란젓"]
}
```

`recent`는 추천 검색 칩에 사용됩니다.

## 배포

별도 가이드 PDF가 `빌드_배포_가이드.pdf`에 정리되어 있습니다. 포함 내용:
- 호스팅 3옵션 (Express static / Vercel·Netlify / Nginx+PM2)
- PM2 / Docker 영구 실행
- 프로덕션 `.env` + 보안 체크리스트
- 운영 점검 + Troubleshooting

## 데이터 출처

- **식품의약품안전처 식품안전나라** (`openapi.foodsafetykorea.go.kr`)
- 서비스 ID: `I0490` (식품의 회수 및 판매중지 정보)

## 면책

> 본 서비스의 "안전" 표시는 식약처 회수 이력이 조회되지 않음을 의미할 뿐, **절대적 안전을 보증하지 않습니다.** 식약처 미등록·미신고 사례, 데이터 반영 이전의 사고, 개인 알레르기 반응 등은 본 결과에 포함되지 않습니다. 제품 라벨과 보관 상태를 함께 확인해 주세요.

## 라이선스

(미정 — 필요 시 추가)
