from __future__ import annotations

from pathlib import Path
import math

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "investor-materials"
UI = OUT / "final-ui"
OUT.mkdir(exist_ok=True)

W, H = 13.333, 7.5
GREEN = RGBColor(0, 157, 105)
GREEN_2 = RGBColor(18, 190, 143)
INK = RGBColor(9, 16, 31)
MUTED = RGBColor(100, 112, 128)
SOFT = RGBColor(246, 248, 247)
LINE = RGBColor(225, 231, 228)
WHITE = RGBColor(255, 255, 255)
BLACK = RGBColor(0, 0, 0)
RED = RGBColor(244, 92, 75)
AMBER = RGBColor(245, 174, 68)
BLUE = RGBColor(66, 116, 255)

FONT = "Microsoft YaHei UI"
FONT_EN = "Aptos Display"

IMG = {
    "confirm": UI / "01-发布确认.png",
    "detail": UI / "02-需求详情.png",
    "chat": UI / "03-订单聊天.png",
    "pay": UI / "04-确认支付.png",
    "refund": UI / "05-退款售后.png",
    "report": UI / "06-举报投诉.png",
    "empty": UI / "07-空状态异常状态.png",
    "overview": UI / "帮帮最终UI总览.png",
}


def rgb(hex_: str) -> RGBColor:
    hex_ = hex_.strip("#")
    return RGBColor(int(hex_[0:2], 16), int(hex_[2:4], 16), int(hex_[4:6], 16))


def add_bg(slide, color=WHITE):
    rect = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.RECTANGLE, 0, 0, Inches(W), Inches(H))
    rect.fill.solid()
    rect.fill.fore_color.rgb = color
    rect.line.fill.background()
    return rect


def text(slide, value, x, y, w, h, size=24, bold=False, color=INK, align=PP_ALIGN.LEFT, font=FONT, leading=None):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    tf.vertical_anchor = MSO_ANCHOR.TOP
    tf.margin_left = Inches(0)
    tf.margin_right = Inches(0)
    tf.margin_top = Inches(0)
    tf.margin_bottom = Inches(0)
    p = tf.paragraphs[0]
    p.alignment = align
    if leading:
        p.line_spacing = leading
    r = p.add_run()
    r.text = value
    r.font.name = font
    r.font.size = Pt(size)
    r.font.bold = bold
    r.font.color.rgb = color
    return box


def pill(slide, value, x, y, w, fill=GREEN, color=WHITE):
    s = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(w), Inches(0.36))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    s.line.fill.background()
    text(slide, value, x, y + 0.09, w, 0.12, 8.5, True, color, PP_ALIGN.CENTER)
    return s


def card(slide, x, y, w, h, fill=WHITE, line=LINE, radius=True):
    s = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE if radius else MSO_AUTO_SHAPE_TYPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    s.line.color.rgb = line
    s.line.width = Pt(0.8)
    return s


def circle(slide, x, y, d, fill=GREEN, line=None):
    s = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.OVAL, Inches(x), Inches(y), Inches(d), Inches(d))
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    if line:
        s.line.color.rgb = line
    else:
        s.line.fill.background()
    return s


def logo(slide, x=0.7, y=0.5, dark=False):
    fill = GREEN if not dark else WHITE
    fg = WHITE if not dark else GREEN
    mark = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x), Inches(y), Inches(0.58), Inches(0.58))
    mark.fill.solid()
    mark.fill.fore_color.rgb = fill
    mark.line.fill.background()
    text(slide, "帮", x + 0.115, y + 0.13, 0.35, 0.15, 14, True, fg, PP_ALIGN.CENTER)
    text(slide, "帮帮", x + 0.72, y + 0.1, 1.0, 0.2, 13, True, WHITE if dark else INK)
    text(slide, "有事找帮帮", x + 0.72, y + 0.34, 1.3, 0.15, 7.5, False, WHITE if dark else GREEN)


def footer(slide, n, dark=False):
    c = RGBColor(170, 178, 188) if not dark else RGBColor(210, 240, 232)
    text(slide, f"{n:02d}", 12.25, 6.85, 0.35, 0.12, 7.5, True, c, PP_ALIGN.RIGHT, FONT_EN)
    text(slide, "BangBang · Pre-Seed", 0.7, 6.86, 1.8, 0.12, 7.2, False, c, PP_ALIGN.LEFT, FONT_EN)


def phone(slide, image, x, y, h=5.9, shadow=True):
    if shadow:
        sh = slide.shapes.add_shape(MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE, Inches(x + 0.11), Inches(y + 0.13), Inches(h * 0.46), Inches(h))
        sh.fill.solid()
        sh.fill.fore_color.rgb = RGBColor(213, 222, 218)
        sh.line.fill.background()
    if Path(image).exists():
        pic = slide.shapes.add_picture(str(image), Inches(x), Inches(y), height=Inches(h))
        return pic
    card(slide, x, y, h * 0.46, h, SOFT)


def big_title(slide, eyebrow, title, body=None, dark=False):
    if eyebrow:
        pill(slide, eyebrow, 0.72, 1.2, max(1.1, len(eyebrow) * 0.12), GREEN if not dark else WHITE, WHITE if not dark else GREEN)
    text(slide, title, 0.7, 1.82, 7.4, 1.2, 36, True, WHITE if dark else INK, leading=0.88)
    if body:
        text(slide, body, 0.74, 3.25, 5.9, 0.65, 15, False, RGBColor(213, 240, 231) if dark else MUTED)


def add_arrow(slide, x1, y1, x2, y2, color=GREEN):
    line = slide.shapes.add_connector(1, Inches(x1), Inches(y1), Inches(x2), Inches(y2))
    line.line.color.rgb = color
    line.line.width = Pt(1.4)
    try:
        line.line.end_arrowhead = True
    except Exception:
        pass
    return line


def add_person_node(slide, label, x, y, color=GREEN):
    circle(slide, x, y, 0.52, rgb("E8F8F1"), GREEN)
    text(slide, label[:1], x + 0.17, y + 0.16, 0.18, 0.12, 12, True, GREEN, PP_ALIGN.CENTER)
    text(slide, label, x - 0.2, y + 0.66, 0.9, 0.15, 8, True, INK, PP_ALIGN.CENTER)


def slide_cover(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("F7FAF8"))
    logo(s, 0.72, 0.58)
    text(s, "帮帮", 0.72, 1.75, 2.8, 0.5, 43, True, INK)
    text(s, "AI时代全民技能共享\n与灵活就业平台", 0.76, 2.55, 5.4, 1.0, 27, True, INK, leading=0.88)
    text(s, "让每个人都拥有创造收入的机会。", 0.78, 4.05, 4.6, 0.25, 15, False, MUTED)
    pill(s, "有事找帮帮", 0.78, 4.65, 1.18, GREEN)
    phone(s, IMG["confirm"], 7.45, 0.85, 5.9)
    phone(s, IMG["detail"], 9.25, 1.2, 5.3)
    footer(s, n)


def slide_why_now(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "WHY NOW", "AI正在重塑就业。", "标准化岗位被自动化，线下真实服务仍然需要人。")
    xs = [1.0, 3.7, 6.4, 9.1]
    labels = ["2023\nAI普及", "2024\n岗位重构", "2026\n灵活就业", "Next\n人 + AI"]
    for i, (x, lab) in enumerate(zip(xs, labels)):
        circle(s, x, 4.75, 0.25, GREEN if i == 3 else rgb("DDF6EC"))
        text(s, lab, x - 0.55, 5.2, 1.35, 0.45, 12, True, INK, PP_ALIGN.CENTER)
        if i < len(xs) - 1:
            add_arrow(s, x + 0.32, 4.87, xs[i + 1] - 0.08, 4.87, rgb("B5EBD8"))
    text(s, "机会不在替代人，\n而在重组人的技能。", 8.2, 2.05, 3.8, 0.8, 25, True, GREEN, leading=0.88)
    footer(s, n)


def slide_market(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("FAFBFA"))
    logo(s)
    big_title(s, "MARKET", "三个市场，正在汇合。", "技能经济、灵活就业、本地生活，形成新的 AI 时代服务入口。")
    circles = [
        (2.15, 3.0, 2.75, "TAM", "本地生活\n万亿级"),
        (4.85, 3.0, 2.75, "SAM", "灵活就业\n2亿人级"),
        (7.55, 3.0, 2.75, "SOM", "东莞 → 广东\n城市复制"),
    ]
    for x, y, d, top, bottom in circles:
        c = circle(s, x, y, d, rgb("EAF8F2"), GREEN)
        c.fill.transparency = 15
        text(s, top, x + 0.88, y + 0.8, 0.95, 0.2, 13, True, GREEN, PP_ALIGN.CENTER, FONT_EN)
        text(s, bottom, x + 0.45, y + 1.2, 1.85, 0.5, 17, True, INK, PP_ALIGN.CENTER)
    footer(s, n)


def slide_mission(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, INK)
    logo(s, dark=True)
    text(s, "每个人都有技能。", 0.85, 1.8, 6.0, 0.55, 38, True, WHITE)
    text(s, "每个人都应该拥有第二收入。", 0.87, 2.58, 7.0, 0.45, 28, True, GREEN_2)
    text(s, "帮帮连接人的能力，而不是商家。", 0.9, 3.55, 4.8, 0.35, 15, False, RGBColor(205, 220, 218))
    for i, label in enumerate(["学生", "宝妈", "程序员", "退休人员", "摄影师", "教师"]):
        angle = i / 6 * math.pi * 2
        x = 9.6 + math.cos(angle) * 1.75
        y = 3.25 + math.sin(angle) * 1.25
        add_person_node(s, label, x, y, WHITE)
        add_arrow(s, x + 0.26, y + 0.26, 10.22, 3.5, RGBColor(98, 223, 182))
    circle(s, 9.68, 2.95, 1.25, GREEN_2)
    text(s, "帮帮", 10.02, 3.34, 0.55, 0.15, 15, True, WHITE, PP_ALIGN.CENTER)
    footer(s, n, True)


def slide_network(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "NETWORK", "人人发布。人人服务。人人收入。", "同一个人，今天是消费者，明天也可以是服务提供者。")
    center_x, center_y = 6.45, 4.1
    circle(s, center_x - 0.62, center_y - 0.62, 1.24, GREEN)
    text(s, "帮帮", center_x - 0.35, center_y - 0.05, 0.7, 0.14, 16, True, WHITE, PP_ALIGN.CENTER)
    nodes = [("发布需求", 2.1, 2.6), ("接单赚钱", 9.7, 2.6), ("信用沉淀", 2.1, 5.35), ("社区互助", 9.7, 5.35)]
    for label, x, y in nodes:
        card(s, x, y, 1.65, 0.75, rgb("F8FBF9"), LINE)
        text(s, label, x + 0.18, y + 0.26, 1.28, 0.16, 13, True, INK, PP_ALIGN.CENTER)
        add_arrow(s, x + 0.82, y + 0.38, center_x, center_y, rgb("B5EBD8"))
    footer(s, n)


def slide_pain(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("FAFAFA"))
    logo(s)
    big_title(s, "PAIN", "交易难，不是因为没有需求。", "而是陌生人服务缺少信任与分发。")
    columns = [("消费者", ["找不到靠谱的人", "价格不透明", "售后难追溯"], 1.15), ("服务者", ["获客成本高", "技能难变现", "信用不沉淀"], 7.0)]
    for head, items, x in columns:
        card(s, x, 3.0, 4.6, 2.65, WHITE, LINE)
        text(s, head, x + 0.35, 3.33, 2.0, 0.25, 18, True, INK)
        for i, item in enumerate(items):
            circle(s, x + 0.38, 3.95 + i * 0.52, 0.15, RED if x < 5 else AMBER)
            text(s, item, x + 0.72, 3.89 + i * 0.52, 2.8, 0.18, 13, True, MUTED)
    footer(s, n)


def slide_solution(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "SOLUTION", "用 AI，把需求交给最合适的人。", "从发布到评价，一条可信交易链路。")
    steps = ["发布需求", "AI匹配", "服务", "支付", "评价"]
    for i, step in enumerate(steps):
        x = 1.0 + i * 2.35
        card(s, x, 4.05, 1.4, 0.8, GREEN if i == 1 else WHITE, GREEN if i == 1 else LINE)
        text(s, step, x + 0.12, 4.33, 1.15, 0.15, 12.5, True, WHITE if i == 1 else INK, PP_ALIGN.CENTER)
        if i < len(steps) - 1:
            add_arrow(s, x + 1.48, 4.45, x + 2.20, 4.45, GREEN)
    footer(s, n)


def slide_product(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("F7FAF8"))
    logo(s)
    big_title(s, "PRODUCT", "产品不是展示页，是交易系统。", "发布、详情、聊天、支付、售后、举报，MVP 闭环已经清晰。")
    phone(s, IMG["confirm"], 1.05, 2.05, 4.7)
    phone(s, IMG["detail"], 3.55, 1.75, 5.0)
    phone(s, IMG["chat"], 6.18, 1.45, 5.3)
    phone(s, IMG["pay"], 8.95, 1.75, 5.0)
    footer(s, n)


def slide_safety(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "TRUST", "安全就是交易。", "帮帮要先成为一个可信系统，然后才是服务平台。")
    items = ["实名", "定位", "录音", "评价", "信用", "举报", "后台审核"]
    for i, item in enumerate(items):
        x = 1.0 + (i % 4) * 2.65
        y = 3.2 + (i // 4) * 1.15
        card(s, x, y, 2.0, 0.75, rgb("F8FBF9"), LINE)
        circle(s, x + 0.22, y + 0.24, 0.25, GREEN)
        text(s, item, x + 0.62, y + 0.28, 1.1, 0.15, 12.5, True, INK)
    phone(s, IMG["report"], 10.1, 1.3, 5.65)
    footer(s, n)


def slide_business(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, INK)
    logo(s, dark=True)
    text(s, "100元订单", 0.9, 1.4, 3.2, 0.45, 30, True, WHITE)
    text(s, "平台只拿 10%。\n推广奖励由平台承担。", 0.94, 2.1, 4.0, 0.65, 18, True, GREEN_2)
    vals = [("服务人员", "90元", 0.90, GREEN_2), ("平台", "10元", 0.10, WHITE)]
    x0, y0 = 5.25, 2.0
    for i, (label, val, pct, col) in enumerate(vals):
        y = y0 + i * 1.2
        text(s, label, x0, y, 1.5, 0.2, 12, True, RGBColor(210, 225, 225))
        card(s, x0 + 1.5, y + 0.02, 4.8, 0.25, rgb("20302F"), rgb("20302F"))
        card(s, x0 + 1.5, y + 0.02, 4.8 * pct, 0.25, col, col)
        text(s, val, x0 + 6.55, y - 0.03, 0.85, 0.22, 18, True, col, PP_ALIGN.RIGHT)
    card(s, 6.75, 4.95, 1.8, 0.7, GREEN_2, GREEN_2)
    text(s, "8元\n平台收入", 7.1, 5.08, 1.1, 0.3, 13, True, WHITE, PP_ALIGN.CENTER)
    card(s, 8.85, 4.95, 1.8, 0.7, AMBER, AMBER)
    text(s, "2元\n推广奖励", 9.2, 5.08, 1.1, 0.3, 13, True, WHITE, PP_ALIGN.CENTER)
    footer(s, n, True)


def slide_growth(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "GROWTH", "每个用户，都是增长引擎。", "交易完成后，奖励推动下一次分享。")
    steps = ["分享", "注册", "交易", "奖励", "继续分享"]
    cx, cy, r = 7.3, 4.0, 1.75
    for i, step in enumerate(steps):
        ang = i / len(steps) * math.pi * 2 - math.pi / 2
        x = cx + math.cos(ang) * r
        y = cy + math.sin(ang) * r
        circle(s, x - 0.36, y - 0.36, 0.72, rgb("EAF8F2"), GREEN)
        text(s, step, x - 0.45, y - 0.02, 0.9, 0.14, 10, True, INK, PP_ALIGN.CENTER)
    circle(s, cx - 0.7, cy - 0.7, 1.4, GREEN)
    text(s, "飞轮", cx - 0.32, cy - 0.05, 0.64, 0.15, 15, True, WHITE, PP_ALIGN.CENTER)
    footer(s, n)


def slide_competition(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("FAFAFA"))
    logo(s)
    big_title(s, "POSITIONING", "别人连接商家，帮帮连接人。", "竞争关键不是类目，而是供给网络。")
    # Matrix
    x0, y0, w, h = 4.0, 2.0, 6.2, 4.2
    add_arrow(s, x0, y0 + h, x0 + w, y0 + h, INK)
    add_arrow(s, x0, y0 + h, x0, y0, INK)
    text(s, "人人接单", x0 + w - 1.0, y0 + h + 0.25, 1.1, 0.15, 9, True, MUTED)
    text(s, "信任体系", x0 - 0.75, y0 - 0.2, 0.8, 0.15, 9, True, MUTED, PP_ALIGN.RIGHT)
    points = [("美团", 5.2, 4.75, MUTED), ("58", 4.9, 5.3, MUTED), ("闲鱼", 6.4, 4.95, MUTED), ("帮帮", 8.7, 2.55, GREEN)]
    for label, x, y, col in points:
        circle(s, x, y, 0.32, col)
        text(s, label, x - 0.35, y + 0.45, 1.0, 0.15, 10.5, True, col, PP_ALIGN.CENTER)
    footer(s, n)


def slide_ai(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, INK)
    logo(s, dark=True)
    text(s, "AI 是帮帮的操作系统。", 0.8, 1.45, 5.8, 0.55, 33, True, WHITE)
    text(s, "客服、审核、推荐、风控、派单，最终走向本地服务 Agent。", 0.84, 2.25, 6.3, 0.28, 14, False, RGBColor(210, 225, 225))
    items = ["AI客服", "AI审核", "AI推荐", "AI风控", "AI Agent"]
    for i, item in enumerate(items):
        x = 1.1 + i * 2.25
        card(s, x, 4.55, 1.55, 0.8, rgb("142321"), rgb("24423F"))
        text(s, item, x + 0.1, 4.85, 1.35, 0.16, 12, True, GREEN_2, PP_ALIGN.CENTER)
    footer(s, n, True)


def slide_ops(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "GO-TO-MARKET", "先做城市密度，再做全国复制。", "东莞是样板，不是终点。")
    steps = [("东莞", "单城验证"), ("广东", "多城扩张"), ("全国", "平台复制"), ("国际", "HelpMe")]
    for i, (city, note) in enumerate(steps):
        x = 1.25 + i * 2.85
        circle(s, x, 4.0, 0.72, GREEN if i == 0 else rgb("E8F8F1"), GREEN)
        text(s, city, x - 0.25, 4.23, 1.2, 0.15, 13, True, WHITE if i == 0 else GREEN, PP_ALIGN.CENTER)
        text(s, note, x - 0.25, 4.98, 1.25, 0.15, 9.5, True, MUTED, PP_ALIGN.CENTER)
        if i < 3:
            add_arrow(s, x + 0.8, 4.35, x + 2.4, 4.35, GREEN)
    footer(s, n)


def slide_roadmap(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("FAFBFA"))
    logo(s)
    big_title(s, "ROADMAP", "从 MVP，到城市网络。", "每一步都围绕交易密度和信任机制。")
    items = [("MVP", "产品闭环"), ("城市验证", "东莞模型"), ("全国扩张", "供给网络"), ("HelpMe", "国际版")]
    for i, (title, note) in enumerate(items):
        x = 1.0 + i * 2.75
        card(s, x, 3.65, 2.05, 1.25, WHITE, LINE)
        text(s, title, x + 0.25, 4.0, 1.4, 0.18, 17, True, INK, PP_ALIGN.CENTER)
        text(s, note, x + 0.25, 4.42, 1.4, 0.14, 9.5, True, GREEN, PP_ALIGN.CENTER)
    footer(s, n)


def slide_team(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "TEAM", "AI创业，不需要臃肿团队。", "6人团队，做出30人效率。")
    roles = ["CEO", "AI工程师", "产品", "运营", "增长", "客服"]
    for i, role in enumerate(roles):
        x = 1.2 + (i % 3) * 3.3
        y = 3.15 + (i // 3) * 1.0
        card(s, x, y, 2.45, 0.68, rgb("F8FBF9"), LINE)
        text(s, role, x + 0.25, y + 0.25, 1.9, 0.14, 12.5, True, INK, PP_ALIGN.CENTER)
    text(s, "Legal / Finance / Compliance\n外包协作", 9.35, 3.75, 2.3, 0.5, 15, True, GREEN, PP_ALIGN.CENTER)
    footer(s, n)


def slide_fundraising(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, INK)
    logo(s, dark=True)
    text(s, "Pre-Seed", 0.9, 1.4, 2.0, 0.25, 15, True, GREEN_2, font=FONT_EN)
    text(s, "融资 200万元", 0.9, 1.9, 4.3, 0.5, 35, True, WHITE)
    text(s, "出让 20%", 0.95, 2.75, 2.8, 0.35, 24, True, GREEN_2)
    metrics = [("投前估值", "300万"), ("投后估值", "500万"), ("阶段", "Pre-Seed")]
    for i, (k, v) in enumerate(metrics):
        card(s, 6.15, 1.55 + i * 1.15, 3.2, 0.76, rgb("142321"), rgb("24423F"))
        text(s, k, 6.4, 1.75 + i * 1.15, 1.0, 0.14, 9, True, RGBColor(190, 210, 208))
        text(s, v, 7.6, 1.68 + i * 1.15, 1.35, 0.22, 18, True, WHITE, PP_ALIGN.RIGHT)
    footer(s, n, True)


def slide_use(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s)
    logo(s)
    big_title(s, "USE OF FUNDS", "资金只投向验证增长。", "产品、市场、团队，是 Pre-Seed 最重要的三件事。")
    items = [("研发", 35, GREEN), ("推广", 22.5, BLUE), ("人员", 22.5, AMBER), ("云服务", 7.5, MUTED), ("法务", 5, RED), ("运营", 7.5, rgb("66C2FF"))]
    x, y = 6.4, 2.2
    for i, (label, pct, col) in enumerate(items):
        yy = y + i * 0.52
        text(s, label, 1.1, yy, 1.1, 0.15, 11, True, INK)
        card(s, 2.25, yy + 0.03, 3.0, 0.15, rgb("EEF3F1"), rgb("EEF3F1"))
        card(s, 2.25, yy + 0.03, 3.0 * pct / 35, 0.15, col, col)
        text(s, f"{pct:g}%", 5.42, yy - 0.02, 0.7, 0.15, 10, True, col, PP_ALIGN.RIGHT)
    # Donut-like simple arcs as circles
    circle(s, x, y + 0.35, 2.6, GREEN)
    circle(s, x + 0.38, y + 0.73, 1.84, WHITE)
    text(s, "200万", x + 0.74, y + 1.26, 1.12, 0.2, 20, True, INK, PP_ALIGN.CENTER)
    footer(s, n)


def slide_why_invest(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, INK)
    logo(s, dark=True)
    text(s, "AI时代最大的机会，\n不是 AI。", 0.85, 1.45, 6.2, 1.0, 34, True, WHITE, leading=0.88)
    text(s, "而是技能经济。", 0.88, 2.92, 4.3, 0.42, 30, True, GREEN_2)
    text(s, "帮帮正在建设 AI 时代全民技能共享基础设施。", 0.9, 4.05, 5.4, 0.28, 14, False, RGBColor(210, 225, 225))
    phone(s, IMG["overview"], 7.1, 1.3, 4.75, shadow=False)
    footer(s, n, True)


def slide_end(prs, n):
    s = prs.slides.add_slide(prs.slide_layouts[6])
    add_bg(s, rgb("F7FAF8"))
    circle(s, 5.95, 1.65, 1.35, GREEN)
    text(s, "帮", 6.33, 2.06, 0.55, 0.15, 24, True, WHITE, PP_ALIGN.CENTER)
    text(s, "有事找帮帮。", 3.65, 3.45, 6.1, 0.5, 38, True, INK, PP_ALIGN.CENTER)
    text(s, "让每个人都拥有创造收入的机会。", 3.95, 4.25, 5.5, 0.25, 16, False, GREEN, PP_ALIGN.CENTER)
    footer(s, n)


SLIDES = [
    slide_cover,
    slide_why_now,
    slide_market,
    slide_mission,
    slide_network,
    slide_pain,
    slide_solution,
    slide_product,
    slide_safety,
    slide_business,
    slide_growth,
    slide_competition,
    slide_ai,
    slide_ops,
    slide_roadmap,
    slide_team,
    slide_fundraising,
    slide_use,
    slide_why_invest,
    slide_end,
]


def build():
    prs = Presentation()
    prs.slide_width = Inches(W)
    prs.slide_height = Inches(H)
    for i, fn in enumerate(SLIDES, start=1):
        fn(prs, i)
    out = OUT / "帮帮_VC融资PitchDeck_Apple_Stripe风格_20页.pptx"
    prs.save(out)
    print(out)


if __name__ == "__main__":
    build()
