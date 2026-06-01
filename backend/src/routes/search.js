const express = require('express');
const router = express.Router();
const store = require('../services/store');
const logic = require('./search.logic');

/**
 * GET /api/search?q=검색어
 *
 * 응답:
 * {
 *   query, kind, total, dangerCount, cautionCount,
 *   lastUpdated, results: [ ...식약처 원본 필드 ]
 * }
 *
 * 검색 매칭 로직은 search.logic.js에 분리되어 있어 단위 테스트 가능.
 */
router.get('/', (req, res) => {
  const raw = (req.query.q || '').trim();
  const tokens = logic.tokenize(raw);
  if (tokens.length === 0) {
    return res.status(400).json({ error: '검색어를 입력해 주세요.' });
  }

  const matched = store.getAll().filter(row => logic.matchRow(row, tokens));
  const sorted  = logic.sortResults(matched);
  const dangerCount = logic.countDanger(sorted);

  res.json({
    query: raw,
    kind: logic.decideKind(sorted),
    total: sorted.length,
    dangerCount,
    cautionCount: sorted.length - dangerCount,
    lastUpdated: store.getLastUpdated(),
    results: sorted,
  });
});

module.exports = router;
