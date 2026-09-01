#!/usr/bin/env python3
"""GrooveForge 한국어 사용자 안내서와 프로젝트 포트폴리오 PDF를 만든다.

로컬 문서·이미지를 읽어 페이지 구성 요소를 조립하고 PDF를 렌더링한 뒤 필수 페이지와 산출 경로를 확인한다.
필수 자산이 없거나 레이아웃 입력이 유효하지 않으면 실패하며, 네트워크 전송 없이 지정된 빌드 디렉터리에만 결과를 쓴다.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable, Sequence
from xml.sax.saxutils import escape

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[2]
ASSET_DIR = ROOT / "docs" / "assets" / "grooveforge-guide"
OUTPUT_DIR = ROOT / "output" / "pdf"
TMP_DIR = ROOT / "tmp" / "pdfs"

USER_GUIDE_PDF = OUTPUT_DIR / "grooveforge-user-guide-ko.pdf"
PORTFOLIO_PDF = OUTPUT_DIR / "grooveforge-project-portfolio-ko.pdf"

FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")
FONT = "GrooveForgeSans"
FONT_BOLD = "GrooveForgeSansBold"

PAGE_W, PAGE_H = A4
MARGIN_X = 16 * mm
TOP_MARGIN = 21 * mm
BOTTOM_MARGIN = 18 * mm
CONTENT_W = PAGE_W - (2 * MARGIN_X)

INK = colors.HexColor("#14202B")
INK_SOFT = colors.HexColor("#3D4B57")
MUTED = colors.HexColor("#6F7A83")
PAPER = colors.HexColor("#F5F3EC")
PAPER_ALT = colors.HexColor("#ECEAE2")
WHITE = colors.HexColor("#FFFFFF")
DARK = colors.HexColor("#111917")
DARK_2 = colors.HexColor("#1B2723")
MINT = colors.HexColor("#66E2BC")
MINT_SOFT = colors.HexColor("#DDF7EE")
GOLD = colors.HexColor("#D9A848")
GOLD_SOFT = colors.HexColor("#F6EACB")
BLUE = colors.HexColor("#5BA6CF")
BLUE_SOFT = colors.HexColor("#DCEEF7")
RED = colors.HexColor("#B84F55")
RED_SOFT = colors.HexColor("#F7E2E2")
BORDER = colors.HexColor("#D2D0C7")


def register_fonts() -> None:
    if not FONT_PATH.exists():
        raise FileNotFoundError(f"Korean font not found: {FONT_PATH}")
    pdfmetrics.registerFont(TTFont(FONT, str(FONT_PATH), shapable=True))
    pdfmetrics.registerFont(TTFont(FONT_BOLD, str(FONT_PATH), shapable=True))
    pdfmetrics.registerFontFamily(
        "GrooveForgeSans",
        normal=FONT,
        bold=FONT_BOLD,
        italic=FONT,
        boldItalic=FONT_BOLD,
    )


register_fonts()


def make_styles() -> dict[str, ParagraphStyle]:
    sample = getSampleStyleSheet()

    def style(name: str, parent: str = "BodyText", **kwargs) -> ParagraphStyle:
        base = sample[parent]
        defaults = {
            "fontName": FONT,
            "textColor": INK,
            "fontSize": 9.4,
            "leading": 15.2,
            "wordWrap": "CJK",
            "splitLongWords": True,
            "spaceAfter": 5.5,
        }
        defaults.update(kwargs)
        return ParagraphStyle(name, parent=base, **defaults)

    return {
        "CoverEyebrow": style(
            "CoverEyebrow",
            fontName=FONT_BOLD,
            textColor=MINT,
            fontSize=10.5,
            leading=14,
            tracking=1.2,
            spaceAfter=7,
        ),
        "CoverTitle": style(
            "CoverTitle",
            fontName=FONT_BOLD,
            textColor=WHITE,
            fontSize=30,
            leading=37,
            spaceAfter=12,
        ),
        "CoverSubtitle": style(
            "CoverSubtitle",
            textColor=colors.HexColor("#D6E3DE"),
            fontSize=13,
            leading=21,
            spaceAfter=13,
        ),
        "CoverMeta": style(
            "CoverMeta",
            textColor=colors.HexColor("#AEBDB7"),
            fontSize=8.6,
            leading=13,
            spaceAfter=4,
        ),
        "H1": style(
            "H1",
            fontName=FONT_BOLD,
            textColor=INK,
            fontSize=22,
            leading=29,
            spaceBefore=1,
            spaceAfter=8,
            keepWithNext=True,
        ),
        "H2": style(
            "H2",
            fontName=FONT_BOLD,
            textColor=colors.HexColor("#805D19"),
            fontSize=13.5,
            leading=19,
            spaceBefore=9,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "H3": style(
            "H3",
            fontName=FONT_BOLD,
            textColor=INK,
            fontSize=10.6,
            leading=15,
            spaceBefore=6,
            spaceAfter=3,
            keepWithNext=True,
        ),
        "Deck": style(
            "Deck",
            textColor=INK_SOFT,
            fontSize=11.2,
            leading=18,
            spaceAfter=11,
        ),
        "Body": style("Body"),
        "BodyTight": style("BodyTight", fontSize=8.8, leading=13.5, spaceAfter=3.8),
        "Small": style("Small", textColor=MUTED, fontSize=7.6, leading=11.4, spaceAfter=3),
        "Caption": style(
            "Caption",
            textColor=MUTED,
            fontSize=7.5,
            leading=11,
            alignment=TA_LEFT,
            spaceBefore=4,
            spaceAfter=7,
        ),
        "Bullet": style(
            "Bullet",
            fontSize=9.1,
            leading=14.2,
            leftIndent=12,
            firstLineIndent=-8,
            bulletIndent=0,
            spaceAfter=3.2,
        ),
        "Number": style(
            "Number",
            fontSize=9.2,
            leading=14.8,
            leftIndent=22,
            firstLineIndent=-22,
            spaceAfter=5,
        ),
        "CalloutTitle": style(
            "CalloutTitle",
            fontName=FONT_BOLD,
            fontSize=10,
            leading=14,
            spaceAfter=3,
        ),
        "CalloutBody": style("CalloutBody", fontSize=8.8, leading=13.8, spaceAfter=0),
        "TableHead": style(
            "TableHead",
            fontName=FONT_BOLD,
            textColor=WHITE,
            fontSize=8.2,
            leading=11.5,
            alignment=TA_LEFT,
            spaceAfter=0,
        ),
        "TableCell": style("TableCell", fontSize=7.8, leading=11.7, spaceAfter=0),
        "TableCellSmall": style("TableCellSmall", fontSize=7.1, leading=10.5, spaceAfter=0),
        "MetricValue": style(
            "MetricValue",
            fontName=FONT_BOLD,
            textColor=INK,
            fontSize=19,
            leading=22,
            alignment=TA_CENTER,
            spaceAfter=2,
        ),
        "MetricLabel": style(
            "MetricLabel",
            textColor=MUTED,
            fontSize=7.4,
            leading=10.5,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "Quote": style(
            "Quote",
            fontName=FONT_BOLD,
            textColor=INK,
            fontSize=15,
            leading=23,
            alignment=TA_CENTER,
            spaceAfter=0,
        ),
        "RightSmall": style(
            "RightSmall",
            textColor=MUTED,
            fontSize=7.3,
            leading=10,
            alignment=TA_RIGHT,
            spaceAfter=0,
        ),
        "Code": ParagraphStyle(
            "Code",
            fontName="Courier",
            fontSize=8,
            leading=12,
            textColor=colors.HexColor("#E5F2ED"),
            leftIndent=0,
            rightIndent=0,
            spaceAfter=0,
        ),
    }


STYLES = make_styles()


def para(text: str, style: str = "Body") -> Paragraph:
    safe_text = escape(text).replace("\n", "<br/>")
    return Paragraph(safe_text, STYLES[style])


def bullet(text: str) -> Paragraph:
    return Paragraph(f"<bullet>•</bullet>{escape(text)}", STYLES["Bullet"])


def numbered(index: int, title: str, body: str) -> Paragraph:
    return Paragraph(
        f"<b>{index:02d}</b>&nbsp;&nbsp;<b>{escape(title)}</b><br/>{escape(body)}",
        STYLES["Number"],
    )


def section_title(number: str, title: str, deck: str | None = None) -> list[Flowable]:
    items: list[Flowable] = [para(f"{number}  {title}", "H1")]
    if deck:
        items.append(para(deck, "Deck"))
    items.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=9))
    return items


def subhead(title: str) -> Paragraph:
    return para(title, "H2")


def code_block(lines: Sequence[str]) -> Table:
    text = "\n".join(lines)
    block = Preformatted(text, STYLES["Code"])
    table = Table([[block]], colWidths=[CONTENT_W], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), DARK_2),
                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#385047")),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def callout(title: str, body: str, tone: str = "mint") -> Table:
    palette = {
        "mint": (MINT_SOFT, MINT),
        "gold": (GOLD_SOFT, GOLD),
        "blue": (BLUE_SOFT, BLUE),
        "red": (RED_SOFT, RED),
        "neutral": (PAPER_ALT, BORDER),
    }
    background, accent = palette[tone]
    cell = [para(title, "CalloutTitle"), para(body, "CalloutBody")]
    table = Table([[cell]], colWidths=[CONTENT_W], hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), background),
                ("LINEBEFORE", (0, 0), (0, -1), 4, accent),
                ("BOX", (0, 0), (-1, -1), 0.5, accent),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                ("TOPPADDING", (0, 0), (-1, -1), 9),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def prepare_image(source_name: str, crop: tuple[int, int, int, int] | None = None) -> Path:
    source = ASSET_DIR / source_name
    if not source.exists():
        raise FileNotFoundError(source)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    crop_key = "full" if crop is None else "-".join(str(value) for value in crop)
    target = TMP_DIR / f"{Path(source_name).stem}-{crop_key}.png"
    with PILImage.open(source) as image:
        image.load()
        if crop is not None:
            image = image.crop(crop)
        image = image.convert("RGB")
        image.save(target, format="PNG", optimize=True)
    return target


def framed_image(
    source_name: str,
    *,
    width: float = CONTENT_W,
    max_height: float = 92 * mm,
    crop: tuple[int, int, int, int] | None = None,
    border_color=colors.HexColor("#2B3B35"),
) -> Table:
    path = prepare_image(source_name, crop=crop)
    with PILImage.open(path) as image:
        pixel_w, pixel_h = image.size
    scale = min(width / pixel_w, max_height / pixel_h)
    draw_w = pixel_w * scale
    draw_h = pixel_h * scale
    image = Image(str(path), width=draw_w, height=draw_h)
    table = Table([[image]], colWidths=[draw_w], rowHeights=[draw_h], hAlign="CENTER")
    table.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 1, border_color),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return table


def screenshot(
    source_name: str,
    caption: str,
    *,
    width: float = CONTENT_W,
    max_height: float = 94 * mm,
    crop: tuple[int, int, int, int] | None = None,
) -> list[Flowable]:
    return [
        framed_image(source_name, width=width, max_height=max_height, crop=crop),
        para(caption, "Caption"),
    ]


def image_text_pair(
    source_name: str,
    text_flowables: Sequence[Flowable],
    *,
    image_width: float,
    crop: tuple[int, int, int, int] | None = None,
) -> Table:
    image_box = framed_image(source_name, width=image_width, max_height=140 * mm, crop=crop)
    gap = 7 * mm
    text_width = CONTENT_W - image_width - gap
    table = Table(
        [[[image_box], list(text_flowables)]],
        colWidths=[image_width, text_width],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), gap),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return table


def data_table(
    headers: Sequence[str],
    rows: Sequence[Sequence[str]],
    widths: Sequence[float] | None = None,
    *,
    small: bool = False,
) -> Table:
    cell_style = "TableCellSmall" if small else "TableCell"
    data: list[list[Paragraph]] = [[para(header, "TableHead") for header in headers]]
    data.extend([[para(value, cell_style) for value in row] for row in rows])
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
                ("BACKGROUND", (0, 1), (-1, -1), WHITE),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, PAPER_ALT]),
                ("GRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return table


def metric_grid(metrics: Sequence[tuple[str, str]], columns: int = 4) -> Table:
    cells: list[list[list[Flowable]]] = []
    row: list[list[Flowable]] = []
    for value, label in metrics:
        row.append([para(value, "MetricValue"), para(label, "MetricLabel")])
        if len(row) == columns:
            cells.append(row)
            row = []
    if row:
        while len(row) < columns:
            row.append([para("", "MetricValue"), para("", "MetricLabel")])
        cells.append(row)
    table = Table(cells, colWidths=[CONTENT_W / columns] * columns, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BOX", (0, 0), (-1, -1), 0.6, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
            ]
        )
    )
    return table


def workflow_strip(items: Sequence[tuple[str, str]]) -> Table:
    data: list[list[Flowable]] = []
    row: list[Flowable] = []
    widths: list[float] = []
    item_width = (CONTENT_W - ((len(items) - 1) * 8 * mm)) / len(items)
    for index, (label, detail) in enumerate(items):
        box = [para(label, "CalloutTitle"), para(detail, "Small")]
        row.append(box)
        widths.append(item_width)
        if index < len(items) - 1:
            row.append(para("→", "Quote"))
            widths.append(8 * mm)
    data.append(row)
    table = Table(data, colWidths=widths, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BOX", (0, 0), (-1, -1), 0.5, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (1, 0), (-1, -1), "CENTER"),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def architecture_stack(rows: Sequence[tuple[str, str, str]]) -> Table:
    data: list[list[Flowable]] = []
    for index, (layer, title, detail) in enumerate(rows):
        cell = [
            para(layer, "Small"),
            para(title, "CalloutTitle"),
            para(detail, "CalloutBody"),
        ]
        data.append([cell])
        if index < len(rows) - 1:
            data.append([para("↓", "Quote")])
    table = Table(data, colWidths=[CONTENT_W], hAlign="LEFT")
    style = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]
    for row_index in range(0, len(data), 2):
        style.extend(
            [
                ("BACKGROUND", (0, row_index), (0, row_index), WHITE),
                ("BOX", (0, row_index), (0, row_index), 0.8, MINT),
            ]
        )
    table.setStyle(TableStyle(style))
    return table


class BookmarkDocTemplate(SimpleDocTemplate):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._bookmark_counter = 0

    def afterFlowable(self, flowable: Flowable) -> None:
        if not isinstance(flowable, Paragraph):
            return
        if flowable.style.name not in {"H1", "H2"}:
            return
        level = 0 if flowable.style.name == "H1" else 1
        self._bookmark_counter += 1
        key = f"bookmark-{self._bookmark_counter}"
        title = flowable.getPlainText()
        self.canv.bookmarkPage(key)
        self.canv.addOutlineEntry(title, key, level=level, closed=False)


def page_callback(document_title: str, document_label: str):
    def draw_page(canvas, doc) -> None:
        canvas.saveState()
        canvas.setTitle(document_title)
        canvas.setAuthor("Team Forge")
        canvas.setCreator("GrooveForge publication builder")
        canvas.setSubject(document_label)
        canvas.setKeywords("GrooveForge, beat workstation, user guide, project portfolio, Korean")

        if doc.page == 1:
            canvas.setFillColor(DARK)
            canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
            canvas.setFillColor(colors.HexColor("#18372E"))
            canvas.circle(PAGE_W - 18 * mm, PAGE_H - 18 * mm, 42 * mm, stroke=0, fill=1)
            canvas.setFillColor(colors.HexColor("#1F4B3E"))
            canvas.circle(PAGE_W - 10 * mm, 10 * mm, 34 * mm, stroke=0, fill=1)
            canvas.restoreState()
            return

        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, PAGE_W, PAGE_H, stroke=0, fill=1)
        canvas.setStrokeColor(BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(MARGIN_X, PAGE_H - 15 * mm, PAGE_W - MARGIN_X, PAGE_H - 15 * mm)
        canvas.line(MARGIN_X, 12 * mm, PAGE_W - MARGIN_X, 12 * mm)

        canvas.setFillColor(INK_SOFT)
        canvas.setFont(FONT_BOLD, 7.2)
        canvas.drawString(MARGIN_X, PAGE_H - 11 * mm, "GROOVEFORGE")
        canvas.setFont(FONT, 7.2)
        canvas.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 11 * mm, document_label)
        canvas.setFillColor(MUTED)
        canvas.setFont(FONT, 7)
        canvas.drawString(MARGIN_X, 8 * mm, "v0.1.0 · 2026-08-05 · local-first")
        canvas.drawRightString(PAGE_W - MARGIN_X, 8 * mm, f"{doc.page}")
        canvas.restoreState()

    return draw_page


def cover_story(
    eyebrow: str,
    title: str,
    subtitle: str,
    meta_lines: Sequence[str],
    image_name: str,
    image_crop: tuple[int, int, int, int] | None = None,
) -> list[Flowable]:
    items: list[Flowable] = [
        Spacer(1, 28 * mm),
        para(eyebrow, "CoverEyebrow"),
        para(title, "CoverTitle"),
        para(subtitle, "CoverSubtitle"),
        Spacer(1, 5 * mm),
        framed_image(
            image_name,
            width=CONTENT_W,
            max_height=72 * mm,
            crop=image_crop,
            border_color=MINT,
        ),
        Spacer(1, 9 * mm),
    ]
    items.extend(para(line, "CoverMeta") for line in meta_lines)
    items.append(PageBreak())
    return items


def build_user_guide_story() -> list[Flowable]:
    story: list[Flowable] = []
    story.extend(
        cover_story(
            "ACTUAL USE GUIDE · KOREAN EDITION",
            "GrooveForge\n실제 사용 설명서",
            "실행부터 8마디 비트 작곡, 편곡, 믹스, 마스터, WAV/스템/MIDI 전달까지",
            [
                "검증 기준: 실제 Electron 프로덕션 앱 + 격리된 로컬 합성 세션",
                "제품 버전 0.1.0 · 기준일 2026-08-05 · commit 0ebd6ebe",
                "개인 프로젝트, 외부 계정, 저작권 샘플을 사용하지 않음",
            ],
            "00-electron-desktop.png",
        )
    )

    story.extend(section_title("00", "이 문서를 읽는 법", "화면에 보이는 영어 버튼 이름은 따옴표로 병기했습니다. 처음부터 따라 해도 되고, 필요한 작업만 찾아봐도 됩니다."))
    story.append(
        callout(
            "실제 실행 검증 범위",
            "`npm run desktop`으로 Electron의 file 기반 프로덕션 UI를 실행해 접근성 트리와 화면을 확인했습니다. 이후 조작과 스크린샷은 사용자의 복구 프로젝트를 건드리지 않도록 별도 IPv6 루프백의 격리된 합성 세션에서 수행했습니다. 앱 콘솔의 error/warn은 0건이었습니다.",
            "mint",
        )
    )
    story.append(Spacer(1, 5 * mm))
    story.append(subhead("5분 빠른 시작"))
    quick_steps = [
        ("앱 실행", "저장소에서 `npm install` 후 `npm run desktop`을 실행합니다."),
        ("Guided 시작", "상단의 `Start an 8-bar beat`를 누릅니다."),
        ("드럼 수정", "Pattern A/B/C를 고르고 Kick, Clap, Hat, Perc 스텝을 켭니다."),
        ("베이스와 멜로디", "Bass/Synth 피치 그리드와 Chord 이벤트를 편집합니다."),
        ("8마디 편곡", "Intro 1 + Verse 2 + Hook 4 + Outro 1 블록을 확인합니다."),
        ("믹스", "채널 Volume/Pan, Tone & Space, Master ceiling을 조정합니다."),
        ("전달", "`Preview WAV`로 확인한 뒤 WAV, Stems, MIDI, Sheet, Bundle을 만듭니다."),
    ]
    story.extend(numbered(i + 1, title, body) for i, (title, body) in enumerate(quick_steps))
    story.append(Spacer(1, 3 * mm))
    story.append(
        callout(
            "처음에 가장 많이 헷갈리는 두 가지",
            "앱이 처음 열린 대기 상태는 82 BPM이지만 `Start an 8-bar beat`를 실행하면 `First Guided Beat`, 86 BPM으로 바뀝니다. 또한 16-step 그리드는 1마디이고, 전체 8마디는 Arrangement 블록의 합계입니다.",
            "gold",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("01", "설치와 실행", "현재 저장소 기준으로 개발용 웹 화면과 실제 Electron 데스크톱 앱을 모두 실행할 수 있습니다."))
    story.append(subhead("필수 환경"))
    story.extend(
        [
            bullet("Node.js 22.12 이상과 npm"),
            bullet("macOS 데스크톱 실행 및 패키징 검증에는 macOS 도구 체인"),
            bullet("모든 기본 작곡과 렌더는 로컬에서 동작하며 계정 로그인이 필요하지 않음"),
        ]
    )
    story.append(subhead("권장 실행 명령"))
    story.append(code_block(["npm install", "npm run desktop"]))
    story.append(Spacer(1, 3 * mm))
    story.append(para("개발 중 UI만 빠르게 확인할 때는 아래 명령을 사용합니다.", "BodyTight"))
    story.append(code_block(["npm run dev"]))
    story.append(Spacer(1, 4 * mm))
    story.extend(
        screenshot(
            "00-electron-desktop.png",
            "그림 1. 실제 Electron 프로덕션 앱을 실행한 상단 화면. 프로젝트 설정과 시작 선택지가 한 화면에 배치됩니다.",
            max_height=58 * mm,
        )
    )
    story.append(
        callout(
            "실행은 되었는데 창이 비어 보일 때",
            "첫 로드 직후 잠깐 어두운 창이 보일 수 있습니다. 창을 앞으로 가져오면 file 기반 renderer가 로드됩니다. 계속 비어 있으면 터미널의 build 오류를 확인하고 `npm run build`를 먼저 실행하세요.",
            "neutral",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("02", "첫 화면 이해하기", "첫 화면은 샘플 브라우저가 아니라 프로젝트 설정, 재생, 저장, 작곡 흐름으로 바로 진입합니다."))
    story.extend(
        screenshot(
            "01-overview.png",
            "그림 2. 초기 대기 상태. 82 BPM, A minor, Lo-fi, Guided, 8 bars song loop가 보입니다.",
        )
    )
    overview_rows = [
        ("Title / BPM / Key", "프로젝트 이름, 템포, 조성을 정합니다."),
        ("Time signature", "현재 버전은 4/4 고정 그리드입니다."),
        ("Style", "16개 장르 시작점 중 하나입니다. 선택 후 변경 내용을 검토하고 Apply합니다."),
        ("Song / Block / Turn / Pattern", "어느 범위를 반복 청취할지 정합니다."),
        ("Play / Metronome", "재생과 박자 확인을 담당합니다."),
        ("Actions / Help", "Quick Actions와 Command Reference를 엽니다."),
        ("Undo / Redo / Open / Save", "프로젝트 편집과 파일 작업의 안전 장치입니다."),
    ]
    story.append(data_table(["영역", "역할"], overview_rows, [48 * mm, CONTENT_W - 48 * mm]))
    story.append(PageBreak())

    story.extend(section_title("03", "Guided 8마디 프로젝트 시작", "초보자 경로는 편집 가능한 내장 이벤트가 이미 들어 있는 8마디 기반을 만듭니다."))
    story.extend(
        screenshot(
            "02-guided-header.png",
            "그림 3. `Start an 8-bar beat` 실행 뒤 상단. 제목은 First Guided Beat, BPM은 86으로 바뀝니다.",
        )
    )
    story.append(subhead("시작 직후 확인할 항목"))
    story.extend(
        [
            bullet("Title: `First Guided Beat`"),
            bullet("Mode: Guided"),
            bullet("Tempo / Key: 86 BPM / A minor"),
            bullet("Style / Target: Lo-fi / Starter Sketch"),
            bullet("Pattern: A가 선택되고 B/C 변형도 함께 준비됨"),
            bullet("Arrangement: 8 bars, Song loop가 재생 범위로 선택됨"),
        ]
    )
    story.append(
        callout(
            "Style 변경 전 주의",
            "Style은 단순 색상 필터가 아니라 BPM, swing, sound, 선택 Pattern의 이벤트 구성을 바꿀 수 있는 생성 시작점입니다. 가치 있는 편집이 있으면 먼저 Save하거나 Snapshot을 만들고, 미리보기에서 변화를 확인한 뒤 Apply하세요. 필요하면 즉시 Undo로 비교합니다.",
            "red",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("04", "Transport와 재생 범위", "편집할 때는 짧게 반복하고, 전달 전에는 Song 전체를 들어보는 방식이 가장 빠릅니다."))
    story.append(
        data_table(
            ["버튼", "듣는 범위", "추천 용도"],
            [
                ("Song", "전체 Arrangement", "전체 흐름, Master, export 전 최종 점검"),
                ("Block", "선택한 편곡 블록", "Intro/Verse/Hook 개별 수정"),
                ("Turn", "현재 블록과 다음 블록의 전환", "Verse→Hook 같은 연결부 확인"),
                ("Pattern", "선택한 Pattern 1마디", "드럼, Bass, Synth, Chord 이벤트 수정"),
            ],
            [27 * mm, 54 * mm, CONTENT_W - 81 * mm],
        )
    )
    story.append(subhead("재생 순서"))
    story.extend(
        [
            numbered(1, "Loop 선택", "작업 범위에 맞춰 Song, Block, Turn, Pattern 중 하나를 선택합니다."),
            numbered(2, "Metronome 결정", "리듬 입력 시 켜고, 믹스 판단 시 필요에 따라 끕니다."),
            numbered(3, "Play 또는 Space", "재생 중 현재 project를 읽으므로 안전한 실시간 편집이 반영됩니다."),
            numbered(4, "짧은 구간부터 전체로", "Pattern → Block → Turn → Song 순서로 확인하면 문제 위치를 찾기 쉽습니다."),
        ]
    )
    story.append(subhead("Tempo 도구"))
    story.extend(
        [
            bullet("-1 BPM / +1 BPM: 미세 조정"),
            bullet("Half / Double: 현재 템포 감각을 반감 또는 두 배로 비교"),
            bullet("Session Context의 Tap Tempo: 직접 박자를 두드려 근사 BPM 확인"),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("05", "Pattern A/B/C와 드럼 입력", "Pattern은 1마디 16-step 단위이며, Arrangement의 여러 블록이 같은 Pattern을 참조할 수 있습니다."))
    story.extend(
        screenshot(
            "02-guided-starter-drums.png",
            "그림 4. Guided 시작 뒤 Drums, Bass/Melody, Instruments가 동시에 보이는 작곡 화면.",
        )
    )
    story.append(subhead("Pattern 사용 원칙"))
    story.extend(
        [
            bullet("Pattern A/B/C 탭 또는 숫자 1/2/3으로 편집 대상을 바꿉니다."),
            bullet("A는 기본 groove, B는 Hook 변형, C는 Fill이나 대비용으로 쓰기 좋습니다."),
            bullet("Pattern A를 수정하면 Arrangement에서 A를 참조하는 모든 마디가 함께 바뀝니다."),
            bullet("Pattern Lab의 Clone, Vary, Fill, Groove를 사용한 뒤 반드시 Pattern loop로 듣고 Undo 비교를 합니다."),
        ]
    )
    story.append(subhead("드럼 그리드"))
    story.extend(
        [
            bullet("행: Kick, Clap, Hat, Perc"),
            bullet("열: 1-16 step, 4/4 한 마디의 16분음표 위치"),
            bullet("키보드: 화살표 이동, Enter 또는 Space로 토글"),
            bullet("활성 hit를 한 번 클릭하면 선택되고, 선택된 활성 hit를 다시 클릭해야 삭제됩니다."),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("06", "드럼의 Velocity, Chance, Timing", "스텝을 많이 추가하는 것보다 강약, 확률, 미세 타이밍으로 반복의 표정을 만드는 편이 자연스럽습니다."))
    story.extend(
        screenshot(
            "03-drum-dynamics.png",
            "그림 5. Kick 1을 선택한 Dynamics 패널. Velocity, Chance, Early/On/Late와 ms 보정을 조절할 수 있습니다.",
        )
    )
    story.append(
        data_table(
            ["파라미터", "의미", "실전 팁"],
            [
                ("Velocity", "hit 강도", "Kick/Clap 핵심 박은 높게, 반복 Hat은 단계적으로 변화를 줍니다."),
                ("Chance", "재생 확률", "메인 backbeat는 100%, 장식 Perc/Hat은 낮춰 반복을 분산합니다."),
                ("Timing", "최대 ±35ms 미세 이동", "Early는 추진감, Late는 뒤로 눕는 pocket을 만듭니다."),
                ("Hat repeat", "1x-4x 반복", "Fill 구간과 Pattern B/C에 제한적으로 씁니다."),
                ("Groove preset", "Tight/Pocket/Push/Reset", "적용 후 값이 편집 가능하므로 Undo A/B로 비교합니다."),
            ],
            [29 * mm, 43 * mm, CONTENT_W - 72 * mm],
        )
    )
    story.append(PageBreak())

    story.extend(section_title("07", "Bass, Synth, Chord 편집", "음정 기반 이벤트도 같은 16-step 시간축을 사용하므로 드럼과 정확히 맞물립니다."))
    story.append(subhead("Bass / Melody 그리드"))
    story.extend(
        [
            bullet("세로축은 현재 Key/Scale에 맞는 pitch, 가로축은 1-16 step입니다."),
            bullet("Bass와 Synth를 각각 직접 토글하며, event 수가 패널 상단에 표시됩니다."),
            bullet("Studio 모드에서는 선택 Note의 Length, Velocity, Chance, Bass glide, 복사/붙여넣기 등 고급 Inspector를 볼 수 있습니다."),
            bullet("Desktop Keyboard 또는 사용자가 명시적으로 연결한 Web MIDI로 Next Empty, Replace Selected, Pattern Live Overdub 캡처를 사용할 수 있습니다."),
        ]
    )
    story.append(subhead("Chord 이벤트"))
    story.extend(
        [
            bullet("`Add chord`로 이벤트를 추가하고 Step, Root, Quality를 지정합니다."),
            bullet("Root / 1st / 2nd voicing, Length, Velocity, Chance를 조절합니다."),
            bullet("Step left/right, Duplicate, Prev/Next beat, Voice up/down으로 빠르게 변형합니다."),
            bullet("Chord가 모든 16 step을 채우면 추가가 제한되므로 기존 이벤트의 위치나 길이를 먼저 정리합니다."),
        ]
    )
    story.append(
        callout(
            "글라이드와 실시간 캡처",
            "Bass glide는 앞선 음에서 다음 음으로 이어질 때 의미가 있습니다. Live Overdub은 선택 Pattern이 재생 중일 때 현재 16분음표 playhead에 기록되며, 기록 결과는 Undo, Save, WAV, Stems, MIDI 경로를 그대로 사용합니다.",
            "blue",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("08", "8마디 Arrangement 만들기", "한 Pattern이 1마디라면 Arrangement는 그 Pattern을 어느 섹션에서 몇 마디 재생할지 정하는 곡 구조입니다."))
    pair_text = [
        para("기본 8마디", "H2"),
        bullet("Intro 1 bar / Pattern A"),
        bullet("Verse 2 bars / Pattern A"),
        bullet("Hook 4 bars / Pattern B"),
        bullet("Outro 1 bar / Pattern A"),
        para("Block을 선택한 뒤 Section, Pattern A/B/C, track mute, Bars, Energy를 편집합니다. Move, Duplicate, Split, Merge, Delete로 구조를 바꿀 수 있습니다.", "BodyTight"),
        callout("최대 길이", "현재 안전 경계는 전체 64 bars입니다.", "gold"),
    ]
    story.append(
        image_text_pair(
            "04-arrangement.png",
            pair_text,
            image_width=74 * mm,
            crop=(485, 180, 930, 720),
        )
    )
    story.append(Spacer(1, 4 * mm))
    story.append(subhead("편곡 검수 순서"))
    story.extend(
        [
            numbered(1, "Block", "각 섹션 자체의 groove와 Energy를 듣습니다."),
            numbered(2, "Turn", "Intro→Verse, Verse→Hook처럼 섹션 전환을 듣습니다."),
            numbered(3, "Song", "8마디 전체의 밀도, 반복, Hook 대비를 확인합니다."),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("09", "Mixer와 Master", "먼저 채널 균형을 잡고, 그 다음 공간과 질감을 조정한 뒤 Master에서 출력 여유를 확인합니다."))
    story.extend(
        screenshot(
            "05-mixer.png",
            "그림 6. Drums, Bass, Synth, Chord, Master strip과 Master preset/ceiling이 함께 보이는 Mix 화면.",
        )
    )
    story.append(
        data_table(
            ["영역", "범위/기능", "추천 판단"],
            [
                ("Volume", "-36 dB ~ +3 dB", "Master를 올리기 전에 채널 간 상대 균형을 맞춥니다."),
                ("Pan", "L100 ~ R100", "Bass와 Kick은 중심, 화성/멜로디는 필요할 때 분산합니다."),
                ("Mute / Solo", "채널 격리", "Solo로 문제를 찾고 Full Mix로 최종 판단합니다."),
                ("Tone & Space", "Low Cut, Air, Drive, Glue, Space", "작은 변화로 A/B하고 과한 누적을 피합니다."),
                ("Master ceiling", "-6 dB ~ 0 dB", "낮을수록 export 여유가 커집니다."),
                ("Output preset", "Clean Demo / Streaming Safe / Headroom for Vocal", "목적에 맞는 시작점이며 최종 판단을 대신하지 않습니다."),
            ],
            [30 * mm, 56 * mm, CONTENT_W - 86 * mm],
            small=True,
        )
    )
    story.append(PageBreak())

    story.extend(section_title("10", "Review & Export Meter", "Peak/RMS 수치만 보지 말고 dynamics, limiter, 구간 전환, 실제 offline preview를 함께 확인합니다."))
    review_text = [
        para("Export Meter", "H2"),
        bullet("Peak: 가장 큰 순간의 레벨"),
        bullet("RMS: 평균적인 에너지"),
        bullet("Headroom: ceiling까지 남은 여유"),
        bullet("Dynamics: 순간과 평균의 차이"),
        bullet("Limiter: 제한 동작 정도"),
        bullet("Duration: arrangement + export tail"),
        para("Review Queue와 Mix Coach는 우선순위가 높은 문제로 이동하는 안내 도구입니다. 자동 수치가 사람의 최종 청취를 대신하지는 않습니다.", "BodyTight"),
    ]
    story.append(
        image_text_pair(
            "07-master-review-export.png",
            review_text,
            image_width=60 * mm,
            crop=(930, 175, 1265, 670),
        )
    )
    story.append(Spacer(1, 5 * mm))
    story.append(
        callout(
            "권장 청취 루프",
            "저역과 Kick 관계 → vocal 공간 → Hook 대비 → limiter/headroom → `Preview WAV` → 헤드폰과 스피커의 사람 청취 순서로 검수하세요.",
            "mint",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("11", "Handoff Pack과 내보내기", "상단 Exports와 하단 Handoff Pack은 같은 결과물로 가는 두 경로입니다. 하단 패널은 전달 준비 상태를 함께 보여 줍니다."))
    story.extend(
        screenshot(
            "06-handoff-export.png",
            "그림 7. First Guided Beat의 Handoff Pack. Preview WAV와 Mix WAV, Stems, MIDI, Sheet, Bundle을 한곳에서 선택합니다.",
        )
    )
    export_rows = [
        ("Preview WAV", "정확한 offline-rendered full mix를 파일 저장 없이 미리 듣습니다."),
        ("Mix WAV", "44.1 kHz / 24-bit / stereo signed PCM 전체 믹스입니다."),
        ("Stem WAVs", "Drums, Bass, Synth, Chord 네 개의 분리 WAV입니다."),
        ("Arrangement MIDI", "Pattern A/B와 전체 arrangement 메타데이터를 전달합니다."),
        ("Handoff Sheet", "BPM, Key, arrangement, Session Brief, 파일 정보를 텍스트로 정리합니다."),
        ("Delivery Bundle", "project JSON, full mix, 4 stems, MIDI, sheet, upload sheet, manifest/checksum을 ZIP으로 묶습니다."),
    ]
    story.append(data_table(["결과물", "언제 쓰나"], export_rows, [39 * mm, CONTENT_W - 39 * mm], small=True))
    story.append(
        callout(
            "저장 위치를 구분하세요",
            "프로젝트 Save는 Electron 기본 위치인 `~/GrooveForge/Projects`에서 native dialog를 사용합니다. WAV와 다른 deliverable은 브라우저/Electron의 다운로드 동작을 사용하므로 프로젝트 파일과 같은 폴더라고 가정하면 안 됩니다.",
            "gold",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("12", "프로젝트 Save, Open, Recovery", "음악 파일과 전달 파일은 별개입니다. 작업을 이어갈 수 있게 하는 원본은 `.grooveforge.json` 프로젝트입니다."))
    story.append(subhead("Save와 Open"))
    story.extend(
        [
            bullet("Save 또는 Cmd/Ctrl+S: `.grooveforge.json` 파일을 저장합니다."),
            bullet("Open 또는 Cmd/Ctrl+O: 현재 version-1 프로젝트를 엽니다."),
            bullet("Electron은 휴대 가능한 JSON 파일을 먼저 원자적으로 확정한 뒤 SQLite catalog에 같은 snapshot을 미러링합니다."),
            bullet("창을 닫거나 다른 프로젝트를 여는 동안 unsaved/recovery 상태가 있으면 확인 절차가 나타납니다."),
        ]
    )
    story.append(subhead("Recovery 배너"))
    story.append(
        data_table(
            ["버튼", "의미"],
            [
                ("Restore Draft", "복구 사본을 현재 프로젝트로 복원합니다."),
                ("Not now", "복구 사본을 삭제하지 않고 이번 세션에서 잠시 접습니다."),
                ("Clear Draft", "복구 사본을 지웁니다. 필요한 작업인지 먼저 확인하세요."),
            ],
            [38 * mm, CONTENT_W - 38 * mm],
        )
    )
    story.append(subhead("Snapshot"))
    story.extend(
        [
            bullet("한 프로젝트 안에 최대 여섯 개의 로컬 Snapshot을 저장할 수 있습니다."),
            bullet("큰 Style/Arrangement/Mix 변경 전 Snapshot을 만들면 A/B 복원이 쉽습니다."),
            bullet("Undo/Redo는 편집 이력, Snapshot은 명시적인 상태 보관, Save는 durable file이라는 차이가 있습니다."),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("13", "Guided, Studio, Actions", "기능은 같지만 정보 밀도와 이동 방식이 다릅니다."))
    story.append(
        data_table(
            ["모드", "추천 사용자", "특징"],
            [
                ("Guided", "첫 비트를 만드는 사용자", "Setup→Compose→Arrange→Mix→Deliver 순서, 필요한 도구를 단계적으로 노출"),
                ("Studio", "숙련 프로듀서", "Review Queue, Production Snapshot, Mix Coach, 고급 Note Inspector, Handoff check로 빠르게 이동"),
            ],
            [26 * mm, 48 * mm, CONTENT_W - 74 * mm],
        )
    )
    story.append(subhead("Quick Actions"))
    story.extend(
        [
            bullet("Actions 또는 Cmd/Ctrl+K로 엽니다."),
            bullet("검색, 최근 실행, pin을 사용해 Style, Pattern, Mix, Export 작업으로 이동합니다."),
            bullet("Help, `?`, Cmd/Ctrl+/는 Command Reference를 엽니다."),
            bullet("명령 실행 결과 strip의 before/after metric, audition cue, next check를 확인합니다."),
        ]
    )
    story.append(
        callout(
            "어떤 모드가 맞나?",
            "처음에는 Guided로 8마디를 완성하고, 같은 프로젝트에서 Studio로 전환해 세부 Note와 전달 검수를 해보는 방식이 가장 이해하기 쉽습니다.",
            "blue",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("14", "주요 단축키", "텍스트 입력 중에는 일반 글자 키가 프로젝트 명령으로 잘못 처리되지 않도록 editable target guard가 동작합니다."))
    shortcuts = [
        ("Space", "Play / Stop"),
        ("1 / 2 / 3", "Pattern A / B / C 선택"),
        ("화살표", "Drum 또는 Note grid에서 이동"),
        ("Enter / Space", "선택한 grid step 토글"),
        ("Cmd/Ctrl+Z", "Undo"),
        ("Cmd/Ctrl+Shift+Z 또는 Cmd/Ctrl+Y", "Redo"),
        ("Cmd/Ctrl+S", "Save project"),
        ("Cmd/Ctrl+O", "Open project"),
        ("Cmd/Ctrl+K", "Quick Actions"),
        ("? 또는 Cmd/Ctrl+/", "Command Reference"),
    ]
    story.append(data_table(["키", "동작"], shortcuts, [54 * mm, CONTENT_W - 54 * mm]))
    story.append(Spacer(1, 5 * mm))
    story.append(
        callout(
            "접근성",
            "그리드는 키보드 이동과 토글을 지원하고, modal은 Tab/Shift+Tab focus wrap과 Escape close를 제공합니다. 버튼의 title/accessible name은 현재 Pattern, step, velocity 같은 문맥을 포함합니다.",
            "mint",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("15", "완성형 8마디 작업 순서", "아래 체크리스트는 실제 첫 비트를 끝까지 통과시키는 가장 짧은 경로입니다."))
    final_steps = [
        ("Setup", "Title, 86 BPM, A minor, Lo-fi, 4/4를 확인하고 필요하면 수정"),
        ("Pattern A", "Kick/Clap/Hat/Perc와 Bass/Synth/Chord의 기본 groove 정리"),
        ("Pattern B", "Hook용 강도, fill, melody 또는 chord 대비 생성"),
        ("Pattern C", "필요한 경우 전환 또는 fill 전용 변형 생성"),
        ("Arrange", "Intro 1 + Verse 2 + Hook 4 + Outro 1의 Pattern과 Energy 확인"),
        ("Transport", "Pattern, Block, Turn, Song 순서로 반복 청취"),
        ("Mix", "Volume/Pan → Solo 점검 → Tone & Space → Full Mix 복귀"),
        ("Master", "ceiling, preset, Export Meter, Finish Checklist 검수"),
        ("Preview", "Preview WAV로 정확한 offline render를 끝까지 청취"),
        ("Save", "`.grooveforge.json` 원본을 저장"),
        ("Deliver", "Mix WAV, 4 Stems, MIDI, Sheet, Bundle 생성"),
        ("Human QA", "헤드폰/스피커 청취, 권리/credits/metadata 확인 후 외부 공개 결정"),
    ]
    story.extend(numbered(index + 1, title, body) for index, (title, body) in enumerate(final_steps))
    story.append(PageBreak())

    story.extend(section_title("16", "문제 해결", "대부분의 문제는 재생 범위, mute/solo, 복구 상태, 전달 준비 조건을 차례로 확인하면 해결됩니다."))
    troubleshoot_rows = [
        ("소리가 안 남", "Play를 한 번 눌러 audio context를 시작하고, Song/Pattern scope, Mute/Solo, channel/master Volume을 확인합니다."),
        ("Pattern을 바꿨는데 여러 마디가 변함", "정상입니다. 같은 Pattern을 참조하는 모든 Arrangement block에 반영됩니다."),
        ("active drum hit가 안 지워짐", "첫 클릭은 선택입니다. 선택된 활성 hit를 다시 클릭하거나 삭제 도구를 사용합니다."),
        ("Bundle이 blocked", "Session Brief, Handoff readiness, Finish Checklist, Format & Package Proof를 확인합니다."),
        ("새 starter 경고", "현재 unsaved 또는 recovery 사본이 보호되고 있습니다. Save/Restore/Clear 결정을 먼저 합니다."),
        ("WAV와 프로젝트 위치가 다름", "프로젝트는 native Save 위치, WAV/ZIP은 download 위치를 사용합니다."),
        ("앱이 느림", "열린 details 패널을 줄이고 짧은 Pattern/Block loop로 편집한 뒤 전체 Song을 검수합니다."),
    ]
    story.append(data_table(["증상", "확인할 것"], troubleshoot_rows, [42 * mm, CONTENT_W - 42 * mm], small=True))
    story.append(subhead("현재 버전에서 정직하게 알아둘 한계"))
    story.extend(
        [
            bullet("Time signature는 4/4 고정입니다."),
            bullet("Pattern은 1마디 16-step이며 multi-bar/track cycle은 향후 roadmap입니다."),
            bullet("Generic Track/Clip/Device schema, plugin hosting, audio recording은 현재 완료 기능이 아닙니다."),
            bullet("Sampling은 선택형 미래 확장이며 MVP의 첫 진입점이 아닙니다."),
            bullet("Developer ID, Apple notarization, 실제 update feed와 외부 배포 채널 승인은 별도 운영 단계입니다."),
            bullet("자동 PCM 수치 검사는 사람의 음악적 청취와 최종 mastering을 대신하지 않습니다."),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("부록", "기능 근거와 확인 명령", "이 설명서는 2026-08-05의 저장소 상태와 실제 실행 화면을 기준으로 작성했습니다."))
    story.append(
        data_table(
            ["주제", "근거"],
            [
                ("제품/사용 흐름", "README.md · docs/product/product.md"),
                ("아키텍처", "docs/architecture/product-architecture.md"),
                ("UI", "src/ui/App.tsx · src/ui/workstation*.tsx"),
                ("도메인", "src/domain/workstation.ts"),
                ("재생/렌더", "src/audio/scheduler.ts · src/audio/render.ts · src/audio/midi.ts"),
                ("프로젝트 안전", "electron/main.ts · electron/projectLibrary.ts · electron/projectWorkspace.ts"),
                ("품질/프라이버시", "docs/quality/rules.md · docs/privacy/principles.md"),
            ],
            [38 * mm, CONTENT_W - 38 * mm],
        )
    )
    story.append(subhead("빠른 검증 명령"))
    story.append(
        code_block(
            [
                "npm run qa",
                "npm run typecheck",
                "npm run renderer:smoke",
                "npm run workflow:smoke",
                "npm run sample-audio:qa",
            ]
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.append(para("GrooveForge의 중심은 샘플 찾기가 아니라, 편집 가능한 이벤트로 직접 비트를 쓰고 전달 가능한 결과까지 완성하는 일입니다.", "Quote"))
    return story


def build_portfolio_story() -> list[Flowable]:
    story: list[Flowable] = []
    story.extend(
        cover_story(
            "PROJECT PORTFOLIO · 2026",
            "GrooveForge",
            "샘플 없이 시작해 전달 가능한 비트까지 완성하는 local-first 올장르 미니 DAW",
            [
                "React 19 · TypeScript 5.9 · Vite 8 · Electron 43.5 · Web Audio · SQLite3",
                "제품 버전 0.1.0 · 기준일 2026-08-05 · commit 0ebd6ebe",
                "Team Forge product, architecture, audio, desktop, QA portfolio",
            ],
            "01-overview.png",
        )
    )

    story.extend(section_title("01", "Executive Snapshot", "GrooveForge는 샘플 탐색이 아니라 편집 가능한 음악 이벤트에서 시작해 설정, 작곡, 편곡, 믹스, 마스터, 전달까지 한 로컬 워크스테이션에서 완성합니다."))
    story.append(
        metric_grid(
            [
                ("16", "editable style profiles"),
                ("3", "Pattern A/B/C"),
                ("5", "canonical mixer strips"),
                ("1+4", "full mix + stems"),
                ("44.1/24", "kHz / bit PCM"),
                ("6", "local snapshots"),
                ("64", "maximum bars"),
                ("1,522", "plans + mirrored reviews"),
            ],
            columns=4,
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.append(
        callout(
            "North Star",
            "가져온 오디오 없이 드럼, Bass, Synth, Chord로 8마디 비트를 만들고, mixer/master를 거쳐 24-bit WAV로 export할 수 있어야 한다.",
            "mint",
        )
    )
    story.append(subhead("한 줄 소개"))
    story.append(
        para(
            "GrooveForge는 초보자에게는 Setup→Compose→Arrange→Mix→Deliver의 명확한 Guided 경로를, 숙련 프로듀서에게는 이벤트와 전달 상태로 즉시 이동하는 Studio 경로를 제공하는 데스크톱용 이벤트 기반 beat workstation입니다.",
            "Deck",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("02", "문제 정의와 사용자", "같은 기능 목록보다 더 중요한 것은 어떤 창작 흐름을 제품의 중심에 두는가입니다."))
    story.append(subhead("해결하려는 세 가지 문제"))
    story.extend(
        [
            numbered(1, "샘플 탐색 편향", "샘플 찾기와 자르기가 첫 화면의 중심이 되면 직접 리듬, Bass, Melody를 쓰는 경험이 흐려집니다."),
            numbered(2, "서로 다른 숙련도", "초보자는 단계별 안내가 필요하지만, 프로듀서는 tutorial을 건너뛰고 빠르게 세부 상태로 이동해야 합니다."),
            numbered(3, "창작물의 일관성과 안전", "실시간 재생과 offline export가 같은 결과를 내고, Save/Open/Recovery 중 작업을 잃지 않아야 합니다."),
        ]
    )
    story.append(subhead("두 사용자 경로"))
    story.append(
        data_table(
            ["사용자", "약속", "핵심 표면"],
            [
                ("First-time composer", "첫 8마디를 길을 잃지 않고 완성", "Guided, First Beat Path, Workflow navigator, Handoff readiness"),
                ("Professional producer", "세부 편집과 전달 검수를 빠르게 통과", "Studio, Note Inspector, Review Queue, Mix Coach, Export Preflight"),
            ],
            [38 * mm, 58 * mm, CONTENT_W - 96 * mm],
        )
    )
    story.append(
        callout(
            "제품 정체성",
            "장르는 data이고 sampling은 optional extension입니다. Trap은 16개 style 중 하나일 뿐 제품 전체의 정체성이 아닙니다.",
            "gold",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("03", "제품 경험 설계", "첫 화면부터 export까지 direct composition이 끊기지 않도록 하나의 흐름으로 연결했습니다."))
    story.append(
        workflow_strip(
            [
                ("SETUP", "BPM / Key / Style"),
                ("COMPOSE", "Drums / Bass / Notes"),
                ("ARRANGE", "Blocks / Energy"),
                ("MIX", "Balance / Space"),
                ("DELIVER", "WAV / Bundle"),
            ]
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.extend(
        screenshot(
            "02-guided-header.png",
            "그림 1. Guided starter 실행 뒤 First Guided Beat, 86 BPM, A minor, Lo-fi, 8 bars 상태가 한눈에 보입니다.",
        )
    )
    story.append(subhead("주요 UX 판단"))
    story.extend(
        [
            bullet("Start an 8-bar beat와 Start a studio pass를 첫 진입점으로 분리"),
            bullet("Workflow navigator를 sticky하게 유지해 긴 workstation에서도 현재 단계와 다음 검수를 놓치지 않음"),
            bullet("Style 변경은 preview/Apply/Cancel/Undo 경계를 둬 authored data 교체를 명시"),
            bullet("Quick Actions와 Command Reference가 동일한 route와 focus lifecycle을 공유"),
            bullet("Preview WAV로 실제 offline render를 파일 저장 전에 청취"),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("04", "Capability Map", "MVP는 imported audio 없이도 완결되는 이벤트, 악기, arrangement, mixer/master, delivery 경로입니다."))
    capability_rows = [
        ("Composition", "16-step Drums, Bass/Synth pitch grid, Chord events, A/B/C variation, Live Overdub"),
        ("Expression", "Velocity, Chance, microtiming, Hat repeat, note length, Bass glide, Swing"),
        ("Sound", "Drum Rack, six Bass Voices, Synth, Chord, Drive, Glue, EQ, Space send"),
        ("Arrangement", "Intro/Verse/Hook/Bridge/Outro, move/duplicate/split/merge, track mutes, Energy"),
        ("Mix/Master", "Volume, Pan, Mute/Solo, snapshots, automation, -6~0 dB ceiling, Export Meter"),
        ("Delivery", "24-bit WAV, 4 stems, MIDI, Handoff Sheet, Upload Sheet, Delivery Bundle ZIP"),
        ("Project Safety", ".grooveforge.json, Undo/Redo, 6 snapshots, local draft, SQLite recovery/catalog"),
    ]
    story.append(data_table(["영역", "구현 범위"], capability_rows, [38 * mm, CONTENT_W - 38 * mm], small=True))
    story.append(Spacer(1, 5 * mm))
    story.append(
        callout(
            "현재 v1 data model",
            "Pattern A/B/C의 Drums, Bass, Synth, Chord events와 고정 Mixer roles, Arrangement, Master, Render state를 저장합니다. Generic Track/Clip/Device는 완료 claim이 아니라 versioned migration 목표입니다.",
            "neutral",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("05", "기술 아키텍처", "ProjectState를 단일 창작 진실로 두고 realtime과 offline 경로가 같은 음악 timeline과 normalization을 공유합니다."))
    story.append(
        architecture_stack(
            [
                ("PRESENTATION", "React UI", "Guided/Studio, pattern editors, arrangement, mixer/master, handoff"),
                ("PROJECT TRUTH", "ProjectState", "BPM, key, events, patterns, arrangement, mixer, master, render, recovery"),
                ("COMPOSITION", "Generation & Editing", "Style Profiles, Beat Blueprints, pattern/chord/bassline rules, humanization"),
                ("AUDIO", "Shared Musical Timeline", "tick scheduler, Drum Rack, synth voices, FX, mixer, master bus"),
                ("DELIVERY", "Deterministic Offline Render", "WAV, stems, MIDI, Handoff, manifest, Delivery Bundle"),
            ]
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.append(
        data_table(
            ["경계", "책임"],
            [
                ("Electron main", "window/menu, native dialog, atomic project IO, SQLite workspace, close guard"),
                ("Context-isolated preload", "좁고 검증된 IPC만 renderer에 노출"),
                ("Renderer", "프로젝트 편집, realtime controller, local draft, export actions"),
                ("Audio modules", "schedule/render/midi/delivery bundle의 deterministic output"),
            ],
            [45 * mm, CONTENT_W - 45 * mm],
        )
    )
    story.append(PageBreak())

    story.extend(section_title("06", "Audio와 Delivery의 신뢰성", "음악 앱의 핵심 품질은 UI가 아니라 재생, 저장, MIDI, WAV가 서로 모순되지 않는 것입니다."))
    story.append(subhead("Realtime / Offline parity"))
    story.extend(
        [
            bullet("stable musical tick과 look-ahead scheduler로 UI timing과 audio timing을 분리"),
            bullet("Swing, microtiming, chance, Bass Voice/glide, mixer/master, Space send를 realtime/offline에서 공유"),
            bullet("offline render는 저장된 project data로 재현 가능하며 immediate rerender가 byte-identical"),
            bullet("Preview WAV가 export와 같은 full-mix Blob을 사용"),
        ]
    )
    story.append(subhead("Delivery contract"))
    story.append(
        data_table(
            ["Artifact", "Contract"],
            [
                ("WAV", "RIFF/WAVE, stereo, 44.1 kHz, signed PCM 24-bit, ceiling-safe"),
                ("Stems", "Drums/Bass/Synth/Chord isolation and solo parity"),
                ("MIDI", "Arrangement timing, BPM/key metadata, Unicode-safe project stem"),
                ("Handoff", "Session Brief, arrangement, mix/master posture, planned filenames"),
                ("Bundle", "project + audio + MIDI + sheets + manifest + checksums"),
            ],
            [35 * mm, CONTENT_W - 35 * mm],
        )
    )
    story.append(
        callout(
            "정직한 품질 경계",
            "Peak/RMS, tail, digital zero, determinism, CRC와 checksum은 자동화할 수 있지만 사람의 음악적 청취, LUFS/true-peak mastering, rights/credits/publication 결정은 사용자 단계로 남깁니다.",
            "gold",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("07", "Local-first 프로젝트 안전성", "미공개 beat를 원격 계정 없이 보관하고, 파일과 recovery의 역할을 분리했습니다."))
    safety_rows = [
        ("Portable project", "`.grooveforge.json`을 먼저 atomic write"),
        ("Catalog", "`GrooveForge/Data/grooveforge.db` SQLite3 mirror"),
        ("Recovery", "latest project mirror + renderer localStorage fallback"),
        ("Permissions", "managed directory 0700, project/database file 0600 on POSIX"),
        ("Path privacy", "SQLite catalog는 native location의 SHA-256 key를 저장"),
        ("Lifecycle guards", "async Save identity, Open/replace guard, unsaved close Save-and-close"),
    ]
    story.append(data_table(["안전 장치", "설계"], safety_rows, [42 * mm, CONTENT_W - 42 * mm]))
    story.append(subhead("프라이버시 원칙"))
    story.extend(
        [
            bullet("계정, cloud sync, analytics, ads, payment, remote AI를 기본 경로로 두지 않음"),
            bullet("테스트와 스크린샷은 내장 events와 synthetic project만 사용"),
            bullet("MIDI/파일/마이크 권한은 실제 기능을 시작한 순간에만 요청"),
            bullet("실제 사용자 audio, unreleased beat, copyrighted sample pack, credential을 저장소에 기록하지 않음"),
            bullet("SQLite는 local plaintext라는 잔여 위험을 문서에 명시"),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("08", "Quality Engineering", "QA와 review를 분리하고, 화면 계약부터 실제 PCM과 desktop lifecycle까지 계층별 evidence를 남깁니다."))
    qa_rows = [
        ("Static / docs", "`npm run qa`", "repo map, root docs, plan/review, product guardrails"),
        ("Types / build", "`npm run typecheck`, `npm run build`", "web + Electron TypeScript, production assets"),
        ("Renderer", "`renderer:smoke`, `workflow:smoke`, `persona:smoke`", "first-run UI, beginner/producer path, accessibility"),
        ("Runtime", "`harness:smoke`", "project roundtrip, MIDI, Handoff, bundle contract"),
        ("Audio", "`sample-audio:qa`", "real 24-bit PCM, audibility, ceiling, tail, determinism, isolation"),
        ("Desktop", "launch/project-IO/close/package/install smokes", "production Electron UI, native IO, package lifecycle"),
        ("Release", "`npm run verify`, `npm run release:check`", "value-free local readiness and external blockers"),
    ]
    story.append(data_table(["계층", "대표 명령", "증명"], qa_rows, [28 * mm, 47 * mm, CONTENT_W - 75 * mm], small=True))
    story.append(Spacer(1, 5 * mm))
    story.append(
        metric_grid(
            [
                ("16/16", "style render coverage"),
                ("4/4", "stem families"),
                ("0", "console error/warn in guide run"),
                ("1,522", "completed plan/review mirrors"),
            ],
            columns=4,
        )
    )
    story.append(para("1,522는 저장소의 2026-08-05 history count이며 사용자 KPI가 아니라 작업 계획과 독립 review가 함께 누적된 engineering evidence입니다.", "Caption"))
    story.append(PageBreak())

    story.extend(section_title("09", "대표 제품·기술 판단", "기능 수를 늘리는 대신, 기존 창작 경로를 끝까지 연결하는 선택을 우선했습니다."))
    decisions = [
        (
            "Pattern Live Overdub",
            "Hardware workflow 비교에서 가장 큰 공백이었던 transport-synchronized capture를 우선했습니다. 선택 Pattern 재생 중 현재 16분음표 playhead에 기록하고 기존 Undo/Save/WAV/MIDI 경로를 재사용합니다.",
        ),
        (
            "All-genre Bass + 24-bit",
            "데이터상 style만 다른 808 중심 구현을 808, Sub, Walking, Pluck, Reese, Minimal Bass Voice와 실제 glide로 확장했습니다. WAV는 44.1 kHz/24-bit PCM으로 통일했습니다.",
        ),
        (
            "SQLite project library",
            "portable project file을 먼저 durable하게 저장한 뒤 catalog를 mirror합니다. renderer에는 SQL과 DB 경로를 노출하지 않고 recovery/catalog lifecycle을 desktop smoke로 검증합니다.",
        ),
        (
            "Sampling later",
            "AudioClip/audio/sampler를 core union에 섞지 않고 optional extension으로 남겼습니다. 샘플 관련 개념을 모두 삭제해도 MVP architecture가 성립하는지 검증합니다.",
        ),
    ]
    for title, body in decisions:
        story.append(callout(title, body, "neutral"))
        story.append(Spacer(1, 3 * mm))
    story.append(PageBreak())

    story.extend(section_title("10", "Product Gallery", "실제 실행 화면은 direct composition, arrangement, mix, delivery가 한 workspace에서 이어지는 것을 보여 줍니다."))
    gallery = Table(
        [
            [
                [framed_image("02-guided-starter-drums.png", width=82 * mm, max_height=52 * mm), para("Composition: Pattern A/B/C, Drums, Bass/Synth, Chords", "Caption")],
                [framed_image("05-mixer.png", width=82 * mm, max_height=52 * mm), para("Mix/Master: five strips, meter, ceiling, output preset", "Caption")],
            ],
            [
                [framed_image("04-arrangement.png", width=82 * mm, max_height=52 * mm), para("Arrangement: blocks, Pattern references, Energy", "Caption")],
                [framed_image("06-handoff-export.png", width=82 * mm, max_height=52 * mm), para("Delivery: Preview WAV, mix, stems, MIDI, sheet, bundle", "Caption")],
            ],
        ],
        colWidths=[CONTENT_W / 2, CONTENT_W / 2],
        hAlign="LEFT",
    )
    gallery.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 3),
                ("RIGHTPADDING", (0, 0), (-1, -1), 3),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(gallery)
    story.append(PageBreak())

    story.extend(section_title("11", "현재 상태와 정직한 한계", "로컬 desktop MVP의 핵심 loop는 구현·검증되어 있지만 공식 외부 배포는 별도의 운영 단계가 남아 있습니다."))
    story.append(subhead("현재 구현 상태"))
    story.extend(
        [
            bullet("sample-free 8-bar composition → arrangement → mix/master → delivery loop"),
            bullet("16 style profiles, Pattern A/B/C, Live Overdub, realtime/offline render"),
            bullet("24-bit full mix + 4 stems + MIDI + Handoff + Delivery Bundle"),
            bullet("native project Save/Open, SQLite catalog/recovery, local packaging QA"),
        ]
    )
    story.append(subhead("아직 완료로 주장하지 않는 것"))
    story.extend(
        [
            bullet("Developer ID signing, Apple notarization, Gatekeeper acceptance"),
            bullet("real update feed publishing and distribution-channel approval"),
            bullet("generic Track/Clip/Device migration and larger Drum Rack"),
            bullet("multi-bar Pattern/cycle, count-in/realtime erase/quantize configuration"),
            bullet("parameter lock/track automation, Scene/Pattern Queue, MIDI clock mapping"),
            bullet("audio recording, plugin hosting, sampling workflow, cloud/remote AI"),
        ]
    )
    story.append(
        callout(
            "정확한 현재 표현",
            "로컬 MVP가 완성도 높은 검증 단계에 도달했지만, 공식 외부 배포와 전문 mastering/사람 청취 승인은 별도 자격 증명과 운영 단계가 남아 있다.",
            "gold",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("12", "Roadmap", "직접 작곡 core를 더 깊게 만든 다음 optional extension을 추가하는 순서입니다."))
    roadmap_rows = [
        ("P1", "Generic Track/Device + larger Drum Rack", "v1 roundtrip을 보존하는 versioned migration"),
        ("P2", "Multi-bar Pattern + per-track cycle", "polymetric/longer phrase without arrangement duplication"),
        ("P3", "Live Capture 2", "count-in, realtime erase, configurable quantize"),
        ("P4", "Parameter locks + automation", "note/step locks, track automation lanes"),
        ("P5", "Pattern Queue / Scene", "conditional trigger, Euclidean tools, live launch"),
        ("P6", "MIDI sync / mapping", "clock, controller mapping, physical device validation"),
        ("P7", "FX routing / macros", "deeper insert/send, performance macro/LFO"),
        ("Later", "Sampling / audio / plugins / AI", "direct-composition core 뒤의 명시적 optional phase"),
    ]
    story.append(data_table(["순서", "확장", "성공 조건"], roadmap_rows, [20 * mm, 63 * mm, CONTENT_W - 83 * mm], small=True))
    story.append(subhead("roadmap 원칙"))
    story.extend(
        [
            bullet("새 schema는 기존 project import/roundtrip과 deterministic render를 보존"),
            bullet("물리 MIDI/hardware 검증이 필요한 기능은 synthetic smoke만으로 완료 주장하지 않음"),
            bullet("remote AI, cloud, payment, analytics는 제품 근거와 privacy review 뒤에만 도입"),
            bullet("sampling을 추가해도 imported audio 없이 complete beat가 가능한 core를 유지"),
        ]
    )
    story.append(PageBreak())

    story.extend(section_title("13", "프로젝트 수행 체계", "Team Forge는 plan, implementation, QA, review, privacy, documentation을 역할로 분리해 evidence가 chat에만 남지 않게 합니다."))
    story.append(
        data_table(
            ["역할", "책임"],
            [
                ("Project Lead / Plan Keeper", "scope, decision log, active/completed plan lifecycle"),
                ("Repo Cartographer", "repository map, architecture/docs discoverability"),
                ("Harness Builder / Quality Runner", "scripts, static/runtime/audio/desktop evidence, rerun loop"),
                ("Review Judge", "QA 이후 독립 findings, residual risk, follow-up"),
                ("Privacy Guard", "local-first, sensitive data, permission, external-action boundaries"),
                ("Doc Gardener", "review mirror, stale docs, root documentation hygiene"),
            ],
            [52 * mm, CONTENT_W - 52 * mm],
        )
    )
    story.append(Spacer(1, 6 * mm))
    story.append(
        callout(
            "No Exec Plan, No Work",
            "모든 implementation은 active plan, dedicated branch/worktree, QA, independent review, completed plan, review mirror 순서를 지킵니다. 이 포트폴리오 역시 plan-1523에서 같은 흐름으로 생성되었습니다.",
            "mint",
        )
    )
    story.append(PageBreak())

    story.extend(section_title("Appendix", "Evidence Map", "portfolio claim을 실제 repository artifact와 연결합니다."))
    story.append(
        data_table(
            ["영역", "대표 근거"],
            [
                ("Product", "README.md · docs/product/product.md"),
                ("Architecture", "docs/architecture/product-architecture.md · docs/architecture/harness.md"),
                ("Privacy", "docs/privacy/principles.md"),
                ("Quality", "docs/quality/rules.md · harness/scripts/"),
                ("Domain", "src/domain/workstation.ts"),
                ("UI", "src/ui/App.tsx · src/ui/workstation*.tsx"),
                ("Audio", "src/audio/scheduler.ts · render.ts · midi.ts · deliveryBundle.ts"),
                ("Desktop", "electron/main.ts · preload.cts · projectLibrary.ts · projectWorkspace.ts"),
                ("Release", "docs/release/readiness.md"),
                ("Work history", "docs/exec_plans/completed/ · docs/reviews/ · docs/meetings/"),
            ],
            [38 * mm, CONTENT_W - 38 * mm],
        )
    )
    story.append(Spacer(1, 8 * mm))
    story.append(para("GrooveForge demonstrates that a small DAW can be composition-first, local-first, and evidence-driven without making sampling, accounts, or cloud services prerequisites for a finished beat.", "Quote"))
    return story


def build_pdf(path: Path, title: str, label: str, story: list[Flowable]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    document = BookmarkDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title=title,
        author="Team Forge",
        subject=label,
    )
    callback = page_callback(title, label)
    document.build(story, onFirstPage=callback, onLaterPages=callback)


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    build_pdf(
        USER_GUIDE_PDF,
        "GrooveForge 실제 사용 설명서",
        "Korean User Guide",
        build_user_guide_story(),
    )
    build_pdf(
        PORTFOLIO_PDF,
        "GrooveForge 프로젝트 포트폴리오",
        "Korean Project Portfolio",
        build_portfolio_story(),
    )
    print(USER_GUIDE_PDF)
    print(PORTFOLIO_PDF)


if __name__ == "__main__":
    main()
