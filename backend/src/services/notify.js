const fs = require('fs');
const path = require('path');
const config = require('../config');

// 운영자 알림 모듈 — 기획서 4-3절
// 채널 1: Discord 웹훅 (실패 즉시 전송)
// 채널 2: logs/sync.log (모든 시도와 결과를 누적 기록)

/** ISO 타임스탬프를 포함한 한 줄을 로그 파일에 append */
function writeLog(level, message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}\n`;

  try {
    const dir = path.dirname(config.LOG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(config.LOG_FILE, line, 'utf8');
  } catch (err) {
    // 로그 파일 쓰기 실패는 콘솔로만 — 무한 재귀 방지
    console.error('[notify] 로그 파일 기록 실패:', err.message);
  }

  // 콘솔에도 동시 출력 (개발 환경 편의)
  console.log(line.trimEnd());
}

/** Discord 웹훅으로 메시지 전송 */
async function sendDiscord(content) {
  if (!config.DISCORD_WEBHOOK_URL) {
    writeLog('WARN', 'DISCORD_WEBHOOK_URL 미설정 — 알림 건너뜀');
    return;
  }
  try {
    const fetch = require('node-fetch');
    const res = await fetch(config.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) writeLog('WARN', `Discord 전송 실패: HTTP ${res.status}`);
  } catch (err) {
    writeLog('WARN', `Discord 전송 오류: ${err.message}`);
  }
}

/** 동기화 성공 — 로그 파일에만 기록 */
async function logSyncSuccess({ type, count, durationMs }) {
  writeLog('INFO', `동기화 성공 | 유형: ${type} | 건수: ${count}건 | 소요: ${durationMs}ms`);
}

/** 동기화 실패 — 로그 파일 + Discord 알림 */
async function logSyncFailure({ type, reason, code }) {
  const msg = `동기화 실패 | 유형: ${type} | 코드: ${code || 'N/A'} | 원인: ${reason}`;
  writeLog('ERROR', msg);
  await sendDiscord(`🚨 **안심식품 검색기 동기화 실패**\n${msg}`);
}

module.exports = { writeLog, logSyncSuccess, logSyncFailure };
