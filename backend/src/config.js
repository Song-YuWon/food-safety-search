const path = require('path');

// 설정값을 한 곳에 모아 관리 — .env 또는 기본값 사용
// dotenv는 server.js에서 가장 먼저 로드하므로 여기서는 process.env만 읽음

module.exports = {
  PORT: parseInt(process.env.PORT || '3001', 10),

  // 식약처 OpenAPI (기획서 5절)
  FOODSAFETY_API_KEY: process.env.FOODSAFETY_API_KEY || '',
  FOODSAFETY_BASE_URL: 'http://openapi.foodsafetykorea.go.kr/api',
  FOODSAFETY_SERVICE_ID: 'I0490',
  // 한 번에 최대 1,000건 (기획서 5-3절 ERROR-336 참조)
  FOODSAFETY_PAGE_SIZE: 1000,

  // Discord 웹훅 (기획서 4-3절)
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL || '',

  // 동기화 스케줄 — cron 형식 (기획서: 매일 새벽 04:00)
  SYNC_CRON: process.env.SYNC_CRON || '0 4 * * *',

  // 파일 경로 (__dirname = backend/src → ../ 한 번만 올라가면 backend/)
  DATA_FILE: path.resolve(__dirname, '../data/recalls.json'),
  LOG_FILE: path.resolve(__dirname, '../logs/sync.log'),
};
