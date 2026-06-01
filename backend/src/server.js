// dotenv를 가장 먼저 로드해야 다른 모듈에서 process.env를 읽을 수 있다
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const config = require('./config');
const store = require('./services/store');
const { syncFull, syncIncremental } = require('./services/sync');
const { writeLog } = require('./services/notify');
const searchRouter = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json());

// ─── 라우트 ───────────────────────────────────────────────
app.use('/api/search', searchRouter);

// 마지막 업데이트 시각과 데이터 건수 — 프론트 홈화면 표시용
// recent: 가장 최근에 등록된 회수 제품 3개 — 추천 검색 칩 생성에 사용
app.get('/api/status', (_req, res) => {
  res.json({
    count: store.getCount(),
    lastUpdated: store.getLastUpdated(),
    recent: store.getRecentProductNames(3),
  });
});

// ─── 부트스트랩 ───────────────────────────────────────────
async function bootstrap() {
  // 파일에서 메모리로 로드 → 재시작 시에도 즉시 검색 가능
  store.loadFromFile();

  if (store.getCount() === 0) {
    // 데이터가 없으면 전체 동기화 (최초 기동 또는 데이터 파일 삭제 후)
    writeLog('INFO', '데이터 없음 → 전체 동기화 실행');
    await syncFull();
  } else {
    // 이미 데이터가 있으면 증분으로 최신화
    writeLog('INFO', `기존 ${store.getCount()}건 로드 완료 → 증분 동기화 실행`);
    await syncIncremental();
  }

  // 매일 04:00 증분 동기화 (기획서 4-1절)
  cron.schedule(config.SYNC_CRON, async () => {
    writeLog('INFO', `cron 트리거 (${config.SYNC_CRON})`);
    await syncIncremental();
  });

  app.listen(config.PORT, () => {
    writeLog('INFO', `서버 시작 — http://localhost:${config.PORT}`);
  });
}

bootstrap().catch(err => {
  // 부트스트랩 실패는 프로세스 종료 (서비스 불가 상태이므로)
  console.error('[FATAL] 서버 시작 실패:', err.message);
  process.exit(1);
});
