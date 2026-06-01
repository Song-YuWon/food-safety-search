"""
빌드 + 배포 가이드 PDF 생성기.

reportlab으로 한글 PDF 생성.
폰트: Windows 기본 Malgun Gothic (시스템에 설치되어 있어야 함).
입력: 이 파일 내부에 정의된 SECTIONS.
출력: ../빌드_배포_가이드.pdf
"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Preformatted,
    Table, TableStyle, KeepTogether,
)

# ─────────────────────────────────────────────────────────
# 폰트 등록 — Malgun Gothic (Windows 기본 한글 폰트)
# ─────────────────────────────────────────────────────────
FONT_DIR = "C:/Windows/Fonts"
pdfmetrics.registerFont(TTFont("Malgun",     os.path.join(FONT_DIR, "malgun.ttf")))
pdfmetrics.registerFont(TTFont("MalgunBold", os.path.join(FONT_DIR, "malgunbd.ttf")))
registerFontFamily("Malgun",
                   normal="Malgun", bold="MalgunBold",
                   italic="Malgun", boldItalic="MalgunBold")

# ─────────────────────────────────────────────────────────
# 색상 토큰 — 본문 디자인 토큰과 비슷한 톤
# ─────────────────────────────────────────────────────────
TEXT_1 = colors.HexColor("#0F1820")
TEXT_2 = colors.HexColor("#475160")
TEXT_3 = colors.HexColor("#7A8493")
BG_CODE = colors.HexColor("#F4F6F9")
BORDER = colors.HexColor("#DDE3EA")
ACCENT = colors.HexColor("#D62828")

# ─────────────────────────────────────────────────────────
# 스타일
# ─────────────────────────────────────────────────────────
STYLE_TITLE = ParagraphStyle(
    "Title", fontName="MalgunBold", fontSize=22, leading=28,
    textColor=TEXT_1, spaceAfter=4,
)
STYLE_SUBTITLE = ParagraphStyle(
    "Subtitle", fontName="Malgun", fontSize=10.5, leading=15,
    textColor=TEXT_3, spaceAfter=18,
)
STYLE_H1 = ParagraphStyle(
    "H1", fontName="MalgunBold", fontSize=15, leading=22,
    textColor=TEXT_1, spaceBefore=18, spaceAfter=8,
)
STYLE_H2 = ParagraphStyle(
    "H2", fontName="MalgunBold", fontSize=12, leading=18,
    textColor=TEXT_1, spaceBefore=12, spaceAfter=4,
)
STYLE_BODY = ParagraphStyle(
    "Body", fontName="Malgun", fontSize=10, leading=16,
    textColor=TEXT_1, spaceAfter=6,
)
STYLE_BULLET = ParagraphStyle(
    "Bullet", parent=STYLE_BODY, leftIndent=14, bulletIndent=4,
    spaceAfter=3,
)
STYLE_NOTE = ParagraphStyle(
    "Note", fontName="Malgun", fontSize=9, leading=14,
    textColor=TEXT_2, leftIndent=12, borderColor=ACCENT,
    borderWidth=0, borderPadding=8, backColor=BG_CODE,
    spaceBefore=6, spaceAfter=10,
)
STYLE_CODE = ParagraphStyle(
    "Code", fontName="Courier", fontSize=9, leading=14,
    textColor=TEXT_1, backColor=BG_CODE,
    borderColor=BORDER, borderWidth=0.5, borderPadding=8,
    leftIndent=0, rightIndent=0, spaceBefore=6, spaceAfter=10,
)
# 표 셀 전용 — 자동 줄바꿈을 위해 Paragraph로 감싸 사용
STYLE_CELL_BODY = ParagraphStyle(
    "CellBody", fontName="Malgun", fontSize=9.5, leading=13,
    textColor=TEXT_2,
)
STYLE_CELL_LABEL = ParagraphStyle(
    "CellLabel", fontName="Malgun", fontSize=9.5, leading=13,
    textColor=TEXT_1,
)


def p(text, style=STYLE_BODY):
    return Paragraph(text, style)


def bullet(text):
    return Paragraph(f"• {text}", STYLE_BULLET)


def code(text):
    # Preformatted는 자동 줄바꿈 안 하니 직접 wrap된 텍스트 넣기
    return Preformatted(text, STYLE_CODE)


def cell(text, label=False):
    """표 셀에 들어갈 Paragraph — 셀 폭에 맞춰 자동 줄바꿈."""
    style = STYLE_CELL_LABEL if label else STYLE_CELL_BODY
    return Paragraph(text, style)


def note(text):
    return Paragraph(f"<b>참고</b> &nbsp; {text}", STYLE_NOTE)


def tbl(rows, col_widths=None):
    style = TableStyle([
        ("FONT",       (0, 0), (-1, -1), "Malgun", 9.5),
        ("FONT",       (0, 0), (-1,  0), "MalgunBold", 9.5),
        ("BACKGROUND", (0, 0), (-1,  0), BG_CODE),
        ("TEXTCOLOR",  (0, 0), (-1,  0), TEXT_1),
        ("TEXTCOLOR",  (0, 1), (-1, -1), TEXT_2),
        ("ALIGN",      (0, 0), (-1, -1), "LEFT"),
        ("VALIGN",     (0, 0), (-1, -1), "TOP"),
        ("LINEBELOW",  (0, 0), (-1, -1), 0.4, BORDER),
        ("LEFTPADDING",(0, 0), (-1, -1), 6),
        ("RIGHTPADDING",(0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 6),
    ])
    t = Table(rows, colWidths=col_widths)
    t.setStyle(style)
    return t


# ─────────────────────────────────────────────────────────
# 본문
# ─────────────────────────────────────────────────────────
def build_story():
    s = []

    # 표지
    s.append(p("안심식품 검색기", STYLE_TITLE))
    s.append(p("빌드 &amp; 배포 가이드 · v1.0 · 2026-05-31", STYLE_SUBTITLE))
    s.append(p(
        "이 문서는 <b>안심식품 검색기</b> 풀스택 서비스를 로컬 개발 환경에서 "
        "프로덕션으로 옮길 때 필요한 단계를 정리합니다. "
        "React/Vite 프론트엔드와 Node.js/Express 백엔드, 그리고 식품의약품안전처 "
        "OpenAPI 연동 + 매일 04:00 동기화까지 한 번에 다룹니다."
    ))

    # ───────── 1장
    s.append(p("1. 시스템 구조 한눈에 보기", STYLE_H1))
    s.append(p(
        "프론트엔드는 Vite로 빌드된 정적 자산이고, 백엔드는 Express + node-cron 프로세스입니다. "
        "데이터베이스가 없으며 식약처에서 받은 회수 이력은 메모리와 "
        "<font face='Courier'>backend/data/recalls.json</font>에 영속화됩니다."
    ))
    s.append(Spacer(1, 6))
    s.append(tbl([
        ["구성요소", "역할", "프로세스"],
        ["frontend/dist", "정적 자산 (HTML/JS/CSS)", "Nginx · Vercel · Express static 등"],
        ["backend (Express)", "검색 API + 동기화 cron", "PM2 · Docker · systemd"],
        ["backend/data/recalls.json", "회수 이력 캐시 (~355건)", "백엔드가 읽기/쓰기"],
        ["backend/logs/sync.log", "동기화 시도/결과 누적", "운영자만 봄 (UTF-8)"],
        ["식약처 OpenAPI", "원본 데이터 출처", "매일 04:00 증분 호출"],
    ], col_widths=[42*mm, 60*mm, 60*mm]))

    # ───────── 2장
    s.append(p("2. 필수 준비물", STYLE_H1))
    s.append(bullet("Node.js 18 이상 (LTS 권장)"))
    s.append(bullet("npm 9 이상 (Node와 함께 설치됨)"))
    s.append(bullet("식약처 OpenAPI 인증키 — data.go.kr 또는 foodsafetykorea.go.kr에서 발급. 개발계정은 자동 승인이라 즉시 가능."))
    s.append(bullet("(선택) Discord 웹훅 URL — 동기화 실패 시 즉시 알림"))
    s.append(bullet("(프로덕션) 도메인 + HTTPS 인증서 — Let's Encrypt 권장"))

    # ───────── 3장
    s.append(p("3. 로컬 빌드 — 정적 자산 만들기", STYLE_H1))
    s.append(p(
        "프론트엔드를 정적 자산으로 빌드합니다. 결과물은 "
        "<font face='Courier'>frontend/dist/</font>에 떨어지며 이걸 그대로 정적 호스팅에 올리면 됩니다."
    ))
    s.append(code(
        "cd frontend\n"
        "npm install      # only first time\n"
        "npm run build\n"
        "# -> outputs to frontend/dist/index.html, assets/*"
    ))
    s.append(note(
        "Vite의 dev 서버(<font face='Courier'>npm run dev</font>)는 "
        "/api/* 요청을 backend(3001)로 프록시하지만, "
        "프로덕션 빌드된 정적 자산은 프록시 설정을 들고 가지 않습니다. "
        "→ 다음 장의 호스팅 방식 중 하나로 /api/* 라우팅을 맞춰주세요."
    ))

    s.append(PageBreak())

    # ───────── 4장
    s.append(p("4. 정적 자산 호스팅 — 3가지 선택지", STYLE_H1))
    s.append(p(
        "서비스 규모와 예산에 따라 적절한 방식을 선택합니다. "
        "복잡도가 가장 낮은 순서로 정리했습니다."
    ))

    s.append(p("옵션 A. 백엔드가 정적 자산까지 서빙 (1대 서버)", STYLE_H2))
    s.append(p(
        "Express에 <font face='Courier'>express.static</font> 한 줄만 추가하면 "
        "프론트엔드를 백엔드 같은 포트에서 서빙합니다. 가장 단순하고 무료. "
        "소규모 트래픽이거나 개인 프로젝트라면 충분합니다."
    ))
    s.append(code(
        "// Append to backend/src/server.js\n"
        "const path = require('path');\n"
        "app.use(express.static(path.resolve(__dirname, '../../frontend/dist')));\n"
        "app.get('*', (req, res) => {\n"
        "  res.sendFile(path.resolve(__dirname, '../../frontend/dist/index.html'));\n"
        "});"
    ))
    s.append(bullet("장점: 추가 인프라 없음, CORS 신경 안 써도 됨, /api/*도 같은 origin"))
    s.append(bullet("단점: Node 프로세스가 정적 파일까지 처리 (트래픽 많아지면 비효율)"))

    s.append(p("옵션 B. Vercel · Netlify (프론트만 별도 호스팅)", STYLE_H2))
    s.append(p(
        "프론트엔드는 Vercel/Netlify의 무료 정적 호스팅에 두고, "
        "백엔드는 별도 서버(VPS 등)에 둡니다. CDN 캐싱 자동, 글로벌 전송 빠름. "
        "API URL을 환경변수로 주입해야 합니다."
    ))
    s.append(code(
        "# Build with API origin injected as env var\n"
        "VITE_API_BASE=https://api.example.com npm run build"
    ))
    s.append(p(
        "그리고 <font face='Courier'>src/constants/config.js</font>에서 "
        "<font face='Courier'>import.meta.env.VITE_API_BASE</font>를 읽도록 수정합니다. "
        "백엔드는 <font face='Courier'>cors({ origin: 'https://your-site.vercel.app' })</font> "
        "로 origin을 좁혀주세요."
    ))

    s.append(p("옵션 C. Nginx + PM2 (자체 VPS / 클라우드)", STYLE_H2))
    s.append(p(
        "표준 프로덕션 구성. Nginx가 정적 자산을 직접 서빙하고 "
        "/api/* 만 백엔드로 reverse proxy. HTTPS 종단도 Nginx가 담당."
    ))
    s.append(code(
        "# /etc/nginx/sites-available/food-safety.conf\n"
        "server {\n"
        "  listen 443 ssl http2;\n"
        "  server_name food-safety.example.com;\n"
        "\n"
        "  ssl_certificate     /etc/letsencrypt/live/.../fullchain.pem;\n"
        "  ssl_certificate_key /etc/letsencrypt/live/.../privkey.pem;\n"
        "\n"
        "  root /var/www/food-safety/dist;\n"
        "  index index.html;\n"
        "\n"
        "  # SPA fallback -- serve index.html on refresh\n"
        "  location / {\n"
        "    try_files $uri $uri/ /index.html;\n"
        "  }\n"
        "\n"
        "  # Backend API\n"
        "  location /api/ {\n"
        "    proxy_pass http://127.0.0.1:3001;\n"
        "    proxy_set_header Host $host;\n"
        "    proxy_set_header X-Real-IP $remote_addr;\n"
        "  }\n"
        "}"
    ))
    s.append(bullet("HTTPS는 Let's Encrypt(certbot)로 무료 발급, 자동 갱신"))
    s.append(bullet("프론트 빌드는 cron 또는 CI에서 빌드 후 dist/만 rsync"))

    # ───────── 5장 (PageBreak 없이 자연스럽게 흐르게 — 빈 페이지 방지)
    s.append(p("5. 백엔드를 영구 실행하기", STYLE_H1))

    s.append(p("PM2로 데몬화", STYLE_H2))
    s.append(p(
        "터미널을 닫아도 계속 돌고, 죽으면 자동 재시작합니다. "
        "메모리 누수 시 일정 시점에 재시작도 설정 가능."
    ))
    s.append(code(
        "npm install -g pm2\n"
        "cd backend\n"
        "pm2 start src/server.js --name food-safety-api\n"
        "pm2 save\n"
        "pm2 startup        # auto-start on system boot"
    ))
    s.append(bullet("로그 확인: <font face='Courier'>pm2 logs food-safety-api</font>"))
    s.append(bullet("상태 확인: <font face='Courier'>pm2 status</font>"))
    s.append(bullet("재시작: <font face='Courier'>pm2 restart food-safety-api</font>"))

    s.append(p("Docker로 컨테이너화 (대안)", STYLE_H2))
    s.append(p(
        "PM2 대신 컨테이너 표준을 따르고 싶다면. 한 가지 주의: "
        "<font face='Courier'>backend/data/</font>와 <font face='Courier'>backend/logs/</font>는 "
        "볼륨으로 빼야 컨테이너 재시작 시 데이터가 유지됩니다."
    ))
    s.append(code(
        "# backend/Dockerfile\n"
        "FROM node:20-alpine\n"
        "WORKDIR /app\n"
        "COPY package*.json ./\n"
        "RUN npm ci --omit=dev\n"
        "COPY src ./src\n"
        "EXPOSE 3001\n"
        "CMD [\"node\", \"src/server.js\"]\n"
        "\n"
        "# Run\n"
        "docker build -t food-safety-api ./backend\n"
        "docker run -d --name fsa \\\n"
        "  -p 3001:3001 \\\n"
        "  --env-file ./.env \\\n"
        "  -v $(pwd)/backend/data:/app/data \\\n"
        "  -v $(pwd)/backend/logs:/app/logs \\\n"
        "  food-safety-api"
    ))

    # ───────── 6장
    s.append(p("6. 프로덕션 환경 설정 (.env)", STYLE_H1))
    s.append(p(
        "<font face='Courier'>C:/food-safety/.env.example</font>을 "
        "<font face='Courier'>.env</font>로 복사한 뒤 값을 채웁니다. "
        "<b>키는 절대 git에 커밋하지 마세요</b> — .gitignore에 .env가 이미 포함되어 있습니다."
    ))
    s.append(code(
        "FOODSAFETY_API_KEY=your_actual_key_here\n"
        "DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...\n"
        "PORT=3001\n"
        "SYNC_CRON=0 4 * * *"
    ))
    s.append(bullet("개발계정 API는 일일 10,000건 제한 — 본 서비스는 1일 ~10건만 호출하므로 충분"))
    s.append(bullet("Discord 웹훅을 비워두면 알림이 건너뛰어지고 로그 파일에만 기록"))
    s.append(bullet("SYNC_CRON 형식: 분 시 일 월 요일 (예: <font face='Courier'>0 4 * * *</font> = 매일 04:00)"))

    s.append(PageBreak())

    # ───────── 7장
    s.append(p("7. 운영 점검 체크리스트", STYLE_H1))

    s.append(p("배포 직후", STYLE_H2))
    s.append(bullet("<b>최초 동기화 성공 확인</b> — 로그에 \"동기화 성공 | 유형: 전체 | 건수: N건\" 1줄"))
    s.append(bullet("<font face='Courier'>GET /api/status</font> 호출 → count, lastUpdated 응답"))
    s.append(bullet("브라우저로 진입 → 홈 화면 + \"마지막 업데이트\" 표시 확인"))
    s.append(bullet("실제 검색어로 결과 1건 이상 노출 확인"))

    s.append(p("매일", STYLE_H2))
    s.append(bullet("04:00 cron 동기화 → 로그 마지막 라인이 당일 04:00인지"))
    s.append(bullet("Discord 알림 채널 — 전일 실패 메시지 없는지"))

    s.append(p("주기적 (월 1회)", STYLE_H2))
    s.append(bullet("<font face='Courier'>backend/logs/sync.log</font> 크기 — 너무 크면 로테이션 (winston + daily-rotate-file)"))
    s.append(bullet("의존성 보안 업데이트 — <font face='Courier'>npm audit fix</font>"))
    s.append(bullet("프론트 정적 자산 재빌드 + 배포 (의존성 메이저 업데이트가 있었을 때)"))

    # ───────── 8장
    s.append(p("8. 문제 해결 (Troubleshooting)", STYLE_H1))

    # 셀 내용을 Paragraph로 감싸 자동 줄바꿈 — 폭 좁아도 잘리지 않음
    s.append(tbl([
        ["증상", "원인 / 해결"],
        [cell("서버 시작 시 \"동기화 실패\"", label=True),
         cell("API 키 오타(INFO-100) · 인터넷 차단 · 식약처 서버 장애. "
              "logs/sync.log에서 코드 확인.")],
        [cell("검색 결과 0건만 나옴 (정상 데이터가 있는데)", label=True),
         cell("recalls.json이 비어있거나 손상. 서버 재시작 시 "
              "자동 전체 동기화가 트리거됩니다.")],
        [cell("프론트에서 /api/* 가 404", label=True),
         cell("프록시 미설정 (옵션 B/C). Nginx location /api/ 또는 "
              "환경변수 VITE_API_BASE 확인.")],
        [cell("다크 모드 깜빡임", label=True),
         cell("정적 자산은 첫 페인트가 라이트 토큰. index.html에 "
              "inline script로 data-theme 즉시 적용 가능.")],
        [cell("새로고침 시 404", label=True),
         cell("정적 호스팅에서 SPA fallback 미설정. Nginx의 "
              "try_files $uri /index.html; 등 추가.")],
        [cell("메모리 증가 (PM2)", label=True),
         cell("현재 데이터 규모(1MB 미만)는 무관. node 캐시일 수 있으니 "
              "24h 단위 자동 재시작 설정.")],
    ], col_widths=[55*mm, 110*mm]))

    # ───────── 9장
    s.append(p("9. 보안 체크 — 배포 전 한 번 더", STYLE_H1))
    s.append(bullet("<b>.env가 .gitignore에 들어가 있는지</b> — <font face='Courier'>git status</font>로 확인"))
    s.append(bullet("API 키가 코드/로그에 평문 노출되지 않는지 — 로그는 ***KEY***로 마스킹됨"))
    s.append(bullet("백엔드 CORS — 옵션 B처럼 다른 origin일 때만 origin 좁히기 (옵션 A/C는 같은 origin이라 무관)"))
    s.append(bullet("HTTPS 강제 — Nginx에서 80→443 리다이렉트"))
    s.append(bullet("백엔드 포트(3001)는 외부 노출 X — 방화벽에서 차단, Nginx만 접근"))
    s.append(bullet("PM2 / Docker가 root 권한이 아닌 일반 유저로 실행되는지"))

    # ───────── 부록
    s.append(p("부록. 주요 파일 위치", STYLE_H1))
    s.append(tbl([
        ["경로", "설명"],
        [".env",                          "환경 변수 (절대 커밋 X)"],
        [".env.example",                  "환경 변수 템플릿 (커밋 OK)"],
        ["backend/src/server.js",         "진입점, cron 등록"],
        ["backend/src/config.js",         ".env 값 모음"],
        ["backend/src/services/sync.js",  "식약처 동기화"],
        ["backend/src/services/notify.js","로그 + Discord 알림"],
        ["backend/data/recalls.json",     "회수 이력 캐시 (자동 생성)"],
        ["backend/logs/sync.log",         "동기화 시도 누적 로그"],
        ["frontend/dist/",                "프로덕션 빌드 결과물"],
        ["frontend/src/constants/",       "한국어 문자열, 등급, API 설정"],
    ], col_widths=[70*mm, 95*mm]))

    s.append(Spacer(1, 16))
    s.append(p(
        "<i>이 가이드는 v1.0 풀스택 구현 (백엔드 Express + 프론트 React/Vite) 기준입니다. "
        "더 자세한 코드 흐름은 프로젝트 메모리(.claude/projects/.../memory/)와 "
        "각 모듈 상단 주석을 참고하세요.</i>",
        STYLE_SUBTITLE
    ))

    return s


# ─────────────────────────────────────────────────────────
# 페이지 헤더/푸터
# ─────────────────────────────────────────────────────────
def on_page(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont("Malgun", 8)
    canvas_obj.setFillColor(TEXT_3)
    # 헤더
    canvas_obj.drawString(20*mm, A4[1] - 12*mm, "안심식품 검색기 — 빌드 & 배포 가이드")
    canvas_obj.drawRightString(A4[0] - 20*mm, A4[1] - 12*mm, "v1.0")
    canvas_obj.setStrokeColor(BORDER)
    canvas_obj.setLineWidth(0.3)
    canvas_obj.line(20*mm, A4[1] - 14*mm, A4[0] - 20*mm, A4[1] - 14*mm)
    # 푸터 페이지 번호
    canvas_obj.drawCentredString(A4[0]/2, 12*mm, f"— {doc.page} —")
    canvas_obj.restoreState()


def main():
    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "빌드_배포_가이드.pdf"))
    doc = SimpleDocTemplate(
        out_path, pagesize=A4,
        leftMargin=20*mm, rightMargin=20*mm,
        topMargin=22*mm, bottomMargin=20*mm,
        title="안심식품 검색기 빌드 & 배포 가이드",
        author="food-safety project",
    )
    doc.build(build_story(), onFirstPage=on_page, onLaterPages=on_page)
    print(f"OK: {out_path}")


if __name__ == "__main__":
    main()
