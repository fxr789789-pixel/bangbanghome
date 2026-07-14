from __future__ import annotations

from pathlib import Path
from typing import Iterable

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.shared import Inches as DocxInches, Pt
from PIL import Image
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.util import Inches, Pt as PptPt


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "investor-materials"
UI = ROOT / "ui-previews"
OUT.mkdir(exist_ok=True)
FINAL_UI_SOURCE = Path(
    r"D:\Backup\Documents\Tencent Files\904731991\nt_qq\nt_data\Pic\2026-07\Ori\1893349f991ee711893110e8979bfa96.png"
)
FINAL_UI_DIR = OUT / "final-ui"
FINAL_UI_COMPOSITE = FINAL_UI_DIR / "帮帮最终UI总览.png"

GREEN = RGBColor(18, 190, 143)
DARK = RGBColor(18, 28, 48)
MUTED = RGBColor(91, 105, 125)
PAPER = RGBColor(246, 249, 247)
LINE = RGBColor(224, 232, 228)
AMBER = RGBColor(255, 180, 80)
CORAL = RGBColor(244, 104, 94)
WHITE = RGBColor(255, 255, 255)

CN_FONT = "Microsoft YaHei"
EN_FONT = "Aptos"

UI_IMAGES = {
    "splash": FINAL_UI_DIR / "01-发布确认.png",
    "home": FINAL_UI_DIR / "01-发布确认.png",
    "demand": FINAL_UI_DIR / "02-需求详情.png",
    "masters": FINAL_UI_DIR / "03-订单聊天.png",
    "order": FINAL_UI_DIR / "04-确认支付.png",
    "profile": FINAL_UI_DIR / "05-退款售后.png",
    "report": FINAL_UI_DIR / "06-举报投诉.png",
    "empty": FINAL_UI_DIR / "07-空状态异常状态.png",
}

SOURCES_CN = [
    "国家统计局：2024 年全国网上零售额 155225 亿元，同比增长 7.2%；全年服务零售额同比增长 6.2%。https://www.stats.gov.cn/sj/zxfb/202501/t20250117_1958327.html",
    "国务院发展研究中心：截至 2023 年，灵活就业人员已超过 2 亿人，占就业人员的 1/4 以上。https://www.drc.gov.cn/DocView.aspx?chnid=379&docid=2908439&leafid=1338",
    "福建省人民政府转载报道：截至 2024 年底，国内灵活就业人员已突破 2 亿人，占劳动人口比例接近三分之一。https://www.fujian.gov.cn/zwgk/ztzl/lwlb/lsqk/202502/t20250220_6766138.htm",
    "国家发展改革委相关材料：家政行业市场规模从 2015 年 2776 亿元增长至 2021 年 10149 亿元。https://www.ndrc.gov.cn/wsdwhfz/202303/t20230315_1350958.html",
]

SOURCES_EN = [
    "National Bureau of Statistics of China: online retail sales reached RMB 15.5225 trillion in 2024, up 7.2%; service retail sales grew 6.2%. https://www.stats.gov.cn/sj/zxfb/202501/t20250117_1958327.html",
    "Development Research Center of the State Council: flexible workers exceeded 200 million by 2023, more than one quarter of China's employed population. https://www.drc.gov.cn/DocView.aspx?chnid=379&docid=2908439&leafid=1338",
    "Fujian Provincial Government article citing NBS: flexible workers exceeded 200 million by end-2024, close to one third of the labor force. https://www.fujian.gov.cn/zwgk/ztzl/lwlb/lsqk/202502/t20250220_6766138.htm",
    "NDRC-related material: China's home service market grew from RMB 277.6B in 2015 to RMB 1.0149T in 2021. https://www.ndrc.gov.cn/wsdwhfz/202303/t20230315_1350958.html",
]


def prepare_final_ui_assets():
    FINAL_UI_DIR.mkdir(exist_ok=True)
    if not FINAL_UI_SOURCE.exists():
        return
    image = Image.open(FINAL_UI_SOURCE).convert("RGB")
    image.save(FINAL_UI_COMPOSITE)
    width, height = image.size
    # The supplied design is a 1536x1024 overview with six phone screens on the top row.
    top_y1 = int(height * 0.0)
    top_y2 = int(height * 0.70)
    columns = [
        ("01-发布确认.png", 0.000, 0.170),
        ("02-需求详情.png", 0.170, 0.337),
        ("03-订单聊天.png", 0.338, 0.510),
        ("04-确认支付.png", 0.512, 0.680),
        ("05-退款售后.png", 0.684, 0.853),
        ("06-举报投诉.png", 0.856, 1.000),
    ]
    for name, left, right in columns:
        crop = image.crop((int(width * left), top_y1, int(width * right), top_y2))
        crop.save(FINAL_UI_DIR / name)
    image.crop((0, int(height * 0.70), width, height)).save(FINAL_UI_DIR / "07-空状态异常状态.png")


def set_run(run, size=18, bold=False, color=DARK, font=CN_FONT):
    run.font.name = font
    run.font.size = PptPt(size)
    run.font.bold = bold
    run.font.color.rgb = color


def add_textbox(slide, x, y, w, h, text="", size=20, bold=False, color=DARK, align=PP_ALIGN.LEFT, font=CN_FONT):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.margin_left = Inches(0.02)
    tf.margin_right = Inches(0.02)
    tf.vertical_anchor = MSO_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = align
    r = p.add_run()
    r.text = text
    set_run(r, size=size, bold=bold, color=color, font=font)
    return box


def add_round_rect(slide, x, y, w, h, fill=WHITE, line=LINE, radius=True):
    shape = slide.shapes.add_shape(
        MSO_AUTO_SHAPE_TYPE.ROUNDED_RECTANGLE if radius else MSO_AUTO_SHAPE_TYPE.RECTANGLE,
        Inches(x), Inches(y), Inches(w), Inches(h)
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = fill
    shape.line.color.rgb = line
    shape.line.width = PptPt(1)
    return shape


def add_header(slide, title, subtitle=None, page=None, font=CN_FONT):
    add_textbox(slide, 0.65, 0.35, 8.1, 0.45, title, 23, True, DARK, font=font)
    if subtitle:
        add_textbox(slide, 0.68, 0.82, 8.8, 0.28, subtitle, 9.5, False, MUTED, font=font)
    if page:
        add_textbox(slide, 12.0, 0.38, 0.65, 0.25, f"{page:02d}", 9, True, GREEN, PP_ALIGN.RIGHT, font=font)


def add_bullets(slide, items: Iterable[str], x, y, w, h, size=15, font=CN_FONT, color=DARK):
    box = slide.shapes.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
    tf = box.text_frame
    tf.clear()
    tf.word_wrap = True
    for i, item in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.text = item
        p.level = 0
        p.space_after = PptPt(8)
        p.font.name = font
        p.font.size = PptPt(size)
        p.font.bold = i == 0 and len(items) <= 4
        p.font.color.rgb = color
    return box


def add_phone(slide, image_path: Path, x, y, h=5.9):
    if not image_path.exists():
        add_round_rect(slide, x, y, 2.55, h, PAPER, LINE)
        add_textbox(slide, x + 0.28, y + 2.45, 2.0, 0.5, "UI Preview", 14, True, MUTED, PP_ALIGN.CENTER, EN_FONT)
        return
    pic = slide.shapes.add_picture(str(image_path), Inches(x), Inches(y), height=Inches(h))
    pic.line.color.rgb = LINE
    pic.line.width = PptPt(1)


def add_metric(slide, x, y, w, label, value, note="", fill=PAPER, font=CN_FONT):
    add_round_rect(slide, x, y, w, 1.05, fill, LINE)
    add_textbox(slide, x + 0.18, y + 0.15, w - 0.36, 0.25, label, 8.5, True, MUTED, font=font)
    add_textbox(slide, x + 0.18, y + 0.42, w - 0.36, 0.32, value, 19, True, GREEN, font=font)
    if note:
        add_textbox(slide, x + 0.18, y + 0.78, w - 0.36, 0.18, note, 7.5, False, MUTED, font=font)


def add_flow(slide, steps, x, y, w, font=CN_FONT):
    gap = 0.1
    cell = (w - gap * (len(steps) - 1)) / len(steps)
    for idx, step in enumerate(steps):
        sx = x + idx * (cell + gap)
        fill = GREEN if idx == 0 else WHITE
        color = WHITE if idx == 0 else DARK
        add_round_rect(slide, sx, y, cell, 0.72, fill, GREEN if idx == 0 else LINE)
        add_textbox(slide, sx + 0.05, y + 0.22, cell - 0.1, 0.22, step, 10, True, color, PP_ALIGN.CENTER, font)
        if idx < len(steps) - 1:
            add_textbox(slide, sx + cell - 0.02, y + 0.25, 0.15, 0.15, "→", 12, True, GREEN, PP_ALIGN.CENTER, font)


def add_bar(slide, x, y, label, pct, color=GREEN, font=CN_FONT):
    add_textbox(slide, x, y, 2.1, 0.22, label, 9, True, DARK, font=font)
    bg = add_round_rect(slide, x + 2.15, y + 0.03, 3.2, 0.15, RGBColor(232, 242, 237), RGBColor(232, 242, 237))
    fg = add_round_rect(slide, x + 2.15, y + 0.03, 3.2 * pct, 0.15, color, color)
    return bg, fg


CN_SLIDES = [
    ("封面", "帮帮", "有事找帮帮\nAI时代全民技能共享与灵活就业平台\nBuilding China's Trusted AI-era Skill Sharing Marketplace", "cover"),
    ("一句话介绍", "帮帮，让每一个普通人，都拥有创造收入的机会。", "我们不是家政、维修或跑腿平台。\n我们正在打造 AI 时代全民技能共享与灵活就业基础设施。", None),
    ("为什么现在", "AI 正在改变世界，也正在改变就业。", "AI 正在让大量标准化岗位更少、更便宜、更自动化。\n但上门维修、家政、陪诊、陪护、宠物照顾、家庭安装仍然必须由人完成。\n未来最大的机会不是 AI 本身，而是“人 + AI”。", None),
    ("问题", "AI 提高效率，但没有解决普通人的收入问题。", "越来越多人需要第二职业、第二收入和灵活就业。\n目前没有一个平台真正做到：人人都能发布需求，也人人都能靠自己的技能接单赚钱。", None),
    ("使命", "人人都应该拥有创造收入的机会。", "每一个普通人都有技能、时间和价值。\n帮帮把这些零散能力变成可交易、可信任、可持续的收入。", None),
    ("为什么人人接单", "传统平台连接商家，帮帮连接每一个普通人。", "大学生可以兼职接单；宝妈可以陪诊和收纳；退休人员可以陪老人；摄影师可以拍照；程序员可以做电脑协助。\n人人都是服务提供者。", None),
    ("市场机会", "AI 时代，本地服务与灵活就业正在同时放大。", "中国灵活就业人员已超过 2 亿人级别。\n2024 年全国网上零售额 15.5 万亿元，服务零售增长 6.2%。\n家政到家等服务已进入万亿级供给升级阶段。", "market"),
    ("用户痛点", "供需两端都需要一个更可信、更灵活的平台。", "消费者：找不到靠谱的人，价格不透明，售后难追溯。\n服务人员：获客成本高，缺乏信用沉淀，非专业技能没有变现入口。\n平台：分类割裂，信用和风控体系不统一。", None),
    ("解决方案", "帮帮连接需要帮助的人，和帮助别人赚钱的人。", "用户发布需求，AI 分类和推荐。\n附近接单者看到合适需求。\n平台用实名、评价、信用、风控、售后构建交易信任。", None),
    ("产品流程", "发布需求 → 智能展示 → 接单 → 服务 → 支付 → 评价", "一个用户既可以是消费者，也可以是服务提供者。\n这是双身份网络，而不是单边商户平台。", "flow"),
    ("产品展示", "首页：从进入 App 开始就看到真实需求与行动入口。", "首页承载热门服务、AI 发布、附近需求和安全提示，避免营销页，直接进入交易体验。", "home"),
    ("服务人员体系", "首次接单需要完善技能资料，人人可接，专业技能需审核。", "普通服务低门槛进入；开锁、电工、医疗护理等高风险或专业服务强制资质审核。\n客户下单前可查看形象照、实名、资质和评价。", "masters"),
    ("安全体系", "信任就是交易。", "实名、人脸、资质、订单留痕、隐私地址、定位、投诉、售后、后台审核组成安全闭环。", "security"),
    ("平台后台", "平台后台负责审核、风控、投诉、财务与运营。", "后台不是附属功能，而是帮帮交易信任的底层基础设施。", "backend"),
    ("为什么用户相信帮帮", "信任来自一套可解释的机制。", "实名认证、技能认证、服务评价、信用分、订单留痕、售后仲裁、黑名单与风控策略共同降低陌生人交易风险。", None),
    ("商业模式", "平台按成交收取 10% 服务费。", "服务人员收入 90%。\n平台 10% 中，8% 为平台收入，2% 用于推广奖励。\n推广奖励由平台承担，不转嫁给服务人员。", "biz"),
    ("推广体系", "用户，就是平台的增长引擎。", "客户支付 100 元 → 服务人员 90 元 → 平台 10 元 → 平台收入 8 元 + 推广奖励 2 元。", "referral"),
    ("为什么获客成本低", "帮帮把一次交易，变成一次传播。", "传统平台依赖持续广告投放。\n帮帮让每个用户成为推广员：分享、注册、下单、成交、奖励、继续分享。", None),
    ("增长飞轮", "分享 → 注册 → 下单 → 成交 → 奖励 → 继续分享", "交易越多，服务人员越多；服务人员越多，响应越快；响应越快，用户体验越好；用户体验越好，分享越自然。", "flywheel"),
    ("AI 战略", "AI 是帮帮的调度、风控和服务操作系统。", "AI 客服、AI 发布、AI 分类、AI 推荐、AI 审核、AI 风控、AI 派单，未来升级为本地服务 Agent。", "ai"),
    ("技术架构", "轻量、可扩展、适合 MVP 到城市复制。", "Next.js 前端 + Supabase 数据库/Auth/Storage + AI 分类推荐 + 地图/定位 + 后台审核与风控。", "tech"),
    ("竞争分析", "帮帮不是另一个本地服务入口，而是双身份技能共享网络。", "美团强在商家和履约；58 强在信息发布；闲鱼强在闲置交易；到位强在垂直到家。\n帮帮的差异是：人人接单、统一信用、AI 分发、推广飞轮。", "compare"),
    ("为什么会赢", "别人连接商家，帮帮连接每一个普通人。", "供给侧不再局限于机构和商家，而是来自社区、学校、家庭和城市里的每一个可被信任的个体。", None),
    ("运营模式", "先城市密度，再区域复制。", "第一阶段：东莞单城验证。\n第二阶段：广东多城扩张。\n第三阶段：珠三角网络效应。\n第四阶段：全国复制。", "ops"),
    ("Roadmap", "从 MVP 到城市网络，再到全国平台。", "2026：MVP、认证、支付、地图、后台。\n2027：单城模型验证和广东扩张。\n2028：全国核心城市。\n长期：HelpMe 国际版。", "roadmap"),
    ("创业团队", "AI 创业时代需要 Lean Team。", "CEO / AI 工程师 / 产品 / 运营 / 增长 / 客服 / 法务财务外包。\n早期控制 6-7 人，优先验证商业闭环。", None),
    ("融资计划", "Pre-Seed 融资 200 万元。", "拟出让 20%。\n投前估值 800 万元，投后估值 1000 万元。\n资金用于产品、市场、团队、基础设施和合规。", "fund"),
    ("资金用途", "200 万元将用于把 MVP 推到可商业验证。", "产品研发 70 万；市场推广 45 万；人员薪资 45 万；云与基础设施 15 万；法务财务知识产权 10 万；运营预备金 15 万。", "use"),
    ("为什么投资帮帮", "帮帮不是上门平台，而是 AI 时代全民技能共享平台。", "它同时抓住三个机会：本地生活数字化、灵活就业增长、AI 对服务分发和风控的重构。", None),
    ("Ending", "有事找帮帮。", "让每个人，都拥有创造收入的机会。", "ending"),
    ("社会价值", "AI 时代，帮帮创造的不只是交易，而是就业。", "缓解 AI 带来的就业压力；促进灵活就业和社区互助；为大学生、宝妈、退休人员等群体提供额外收入来源。", None),
    ("长期愿景", "从帮帮（中国）到 HelpMe（国际版）。", "当前专注中国市场，先完成城市密度与信任体系验证；长期把可信技能共享模型复制到海外。", None),
]

EN_SLIDES = [
    ("Cover", "BangBang", "Help is one tap away\nAn AI-era Skill Sharing and Flexible Work Platform\nBuilding China's Trusted AI-era Skill Sharing Marketplace", "cover"),
    ("Elevator Pitch", "BangBang gives every ordinary person a chance to earn.", "We are not a home-cleaning app, a repair app, or a delivery app.\nWe are building flexible-work infrastructure for the AI era.", None),
    ("Why Now", "AI is changing work, but not all work becomes digital.", "AI will automate more clerical, support, translation, design, data-entry and content tasks.\nBut repair, home care, patient escort, pet care and home installation still need real people.\nThe opportunity is not AI alone. It is Human + AI.", None),
    ("Problem", "AI improves efficiency, but it does not solve income pressure.", "More people need second jobs, second income and flexible work.\nThere is still no trusted platform where everyone can both post needs and earn from their skills.", None),
    ("Mission", "Everyone should have the right to create income.", "Every person has skills, time and value.\nBangBang turns fragmented ability into trusted, transactable income.", None),
    ("Why Everyone Can Take Orders", "Traditional platforms connect merchants. BangBang connects people.", "Students can take part-time tasks. Parents can provide escort or organization services. Retirees can help seniors. Photographers can shoot. Developers can solve device issues.\nEveryone can become a service provider.", None),
    ("Market Opportunity", "Local services and flexible work are expanding at the same time.", "China has over 200 million flexible workers.\nChina's online retail reached RMB 15.5T in 2024, while service retail grew 6.2%.\nHome and local services are already a trillion-RMB supply upgrade opportunity.", "market"),
    ("User Pain Points", "Both sides need a more trusted and flexible marketplace.", "Consumers: hard to find trustworthy people, unclear pricing, weak after-sales.\nProviders: high acquisition cost, weak reputation assets, no path to monetize non-professional skills.\nPlatforms: fragmented categories, fragmented trust.", None),
    ("Solution", "BangBang connects people who need help with people who earn by helping.", "Users post a need. AI classifies and recommends it.\nNearby providers see suitable orders.\nIdentity, reviews, credit, risk control and after-sales build trust.", None),
    ("Product Flow", "Post → AI Match → Accept → Service → Pay → Review", "One user can be both a customer and a provider.\nThis is a dual-identity network, not a single-sided merchant marketplace.", "flow"),
    ("Product Demo", "Home: real needs and key actions from the first screen.", "The home screen combines popular services, AI posting, nearby needs and safety signals without a marketing-style landing page.", "home"),
    ("Provider System", "First-time providers complete skills onboarding. Professional tasks require proof.", "Low-risk services are open to ordinary users. Lock opening, electrical work and care services require qualification review.\nCustomers can review photos, identity, proof and reviews before ordering.", "masters"),
    ("Safety System", "Trust is the transaction.", "Real-name identity, face check, qualification review, order records, address privacy, location, complaints, after-sales and admin review create a trust loop.", "security"),
    ("Admin Platform", "The admin layer manages review, risk, disputes, finance and operations.", "The back office is not secondary. It is the infrastructure that makes stranger-to-stranger service transactions possible.", "backend"),
    ("Why Users Trust BangBang", "Trust comes from explainable mechanisms.", "Identity, skills, reviews, credit score, order records, after-sales arbitration, blacklists and risk rules reduce stranger transaction risk.", None),
    ("Business Model", "BangBang charges a 10% service fee per transaction.", "Providers receive 90%.\nOf the 10%, 8% is platform revenue and 2% funds referral rewards.\nThe reward is paid by the platform, not deducted from providers.", "biz"),
    ("Referral System", "Users are the growth engine.", "Customer pays RMB 100 → Provider receives RMB 90 → Platform receives RMB 10 → RMB 8 platform revenue + RMB 2 referral reward.", "referral"),
    ("Low CAC Logic", "BangBang turns every transaction into distribution.", "Traditional platforms buy traffic continuously.\nBangBang lets users share, register, order, transact, earn rewards and share again.", None),
    ("Growth Flywheel", "Share → Register → Order → Transact → Reward → Share Again", "More transactions create more providers. More providers improve response time. Better response creates better experience. Better experience drives sharing.", "flywheel"),
    ("AI Strategy", "AI is the operating system for dispatch, trust and risk control.", "AI support, AI posting, classification, recommendation, review, risk control and dispatch, eventually becoming a local-service agent.", "ai"),
    ("Tech Architecture", "Lightweight, scalable and suitable for city-by-city replication.", "Next.js frontend + Supabase Database/Auth/Storage + AI classification/recommendation + maps/location + admin review and risk control.", "tech"),
    ("Competition", "BangBang is not another local-service entry point. It is a dual-identity skill network.", "Meituan is strong in merchants and fulfillment. 58 is information listing. Xianyu is second-hand trading. Daojia is vertical home service.\nBangBang differentiates through everyone-can-earn supply, unified trust, AI distribution and referrals.", "compare"),
    ("Why We Win", "Others connect merchants. BangBang connects every ordinary person.", "Supply is no longer limited to institutions and merchants. It comes from communities, schools, families and every trusted individual in the city.", None),
    ("Go-to-Market", "Build city density first, then replicate regionally.", "Phase 1: Dongguan city validation.\nPhase 2: multi-city Guangdong expansion.\nPhase 3: Pearl River Delta network effect.\nPhase 4: national replication.", "ops"),
    ("Roadmap", "From MVP to city network to national platform.", "2026: MVP, identity, payment, maps, admin.\n2027: single-city model and Guangdong expansion.\n2028: core national cities.\nLong term: HelpMe international version.", "roadmap"),
    ("Team", "AI-era startups should run lean.", "CEO / AI engineer / product / operations / growth / support / outsourced legal and finance.\nEarly team size: 6-7 people focused on commercial validation.", None),
    ("Financing Plan", "Pre-Seed round: RMB 2 million.", "Proposed equity: 20%.\nPre-money valuation: RMB 8 million. Post-money: RMB 10 million.\nFunds will support product, market, team, infrastructure and compliance.", "fund"),
    ("Use of Funds", "RMB 2 million to move the MVP into commercial validation.", "Product R&D RMB 700K; marketing RMB 450K; payroll RMB 450K; cloud/infrastructure RMB 150K; legal/finance/IP RMB 100K; operations reserve RMB 150K.", "use"),
    ("Why Invest", "BangBang is not a home-service app. It is an AI-era skill sharing platform.", "It captures three shifts at once: local service digitization, flexible work growth and AI-driven service distribution and trust.", None),
    ("Ending", "Help is one tap away.", "Let everyone have the chance to create income.", "ending"),
    ("Social Value", "In the AI era, BangBang creates not only transactions, but jobs.", "It can relieve AI-driven income pressure, support flexible work and community mutual help, and create extra income for students, parents and retirees.", None),
    ("Long-term Vision", "From BangBang in China to HelpMe globally.", "Focus now is China: prove city density and the trust system first. Long term, replicate a trusted skill-sharing model overseas.", None),
]


def make_deck(slides, path: Path, lang="cn"):
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]
    font = CN_FONT if lang == "cn" else EN_FONT
    for idx, (section, title, body, kind) in enumerate(slides, start=1):
        slide = prs.slides.add_slide(blank)
        slide.background.fill.solid()
        slide.background.fill.fore_color.rgb = WHITE
        add_round_rect(slide, 0, 0, 13.333, 7.5, WHITE, WHITE, radius=False)
        if idx == 1:
            add_round_rect(slide, 0, 0, 13.333, 7.5, RGBColor(238, 249, 244), RGBColor(238, 249, 244), radius=False)
            add_round_rect(slide, 0.75, 0.65, 1.05, 1.05, GREEN, GREEN)
            add_textbox(slide, 0.93, 0.95, 0.68, 0.28, "帮帮" if lang == "cn" else "BB", 13, True, WHITE, PP_ALIGN.CENTER, font)
            add_textbox(slide, 0.75, 2.0, 5.3, 0.68, title, 42, True, DARK, font=font)
            lines = body.split("\n")
            add_textbox(slide, 0.8, 2.85, 5.8, 0.35, lines[0], 18, True, GREEN, font=font)
            add_textbox(slide, 0.8, 3.35, 5.8, 0.8, "\n".join(lines[1:]), 16, False, DARK, font=font)
            if FINAL_UI_COMPOSITE.exists():
                slide.shapes.add_picture(str(FINAL_UI_COMPOSITE), Inches(6.35), Inches(1.25), width=Inches(6.45))
            else:
                add_phone(slide, UI_IMAGES["home"], 8.65, 0.7, 6.25)
                add_phone(slide, UI_IMAGES["splash"], 6.85, 1.05, 5.55)
            add_textbox(slide, 0.82, 6.72, 5.3, 0.25, "Pre-Seed Pitch Deck · 2026", 10, True, MUTED, font=font)
            continue
        add_header(slide, section, "Pre-Seed Pitch Deck" if lang == "en" else "Pre-Seed 融资材料", idx, font)
        if kind in {"home", "masters"}:
            img = UI_IMAGES["home"] if kind == "home" else UI_IMAGES["masters"]
            add_textbox(slide, 0.7, 1.45, 5.3, 0.7, title, 25, True, DARK, font=font)
            add_bullets(slide, body.split("\n"), 0.75, 2.35, 5.25, 2.3, 15, font)
            if kind == "home" and FINAL_UI_COMPOSITE.exists():
                slide.shapes.add_picture(str(FINAL_UI_COMPOSITE), Inches(6.15), Inches(1.45), width=Inches(6.8))
            else:
                add_phone(slide, img, 8.55, 0.95, 6.0)
            if kind == "masters":
                add_phone(slide, UI_IMAGES["demand"], 6.75, 1.35, 5.35)
        elif kind == "market":
            add_textbox(slide, 0.75, 1.35, 5.7, 0.8, title, 24, True, DARK, font=font)
            add_metric(slide, 0.78, 2.35, 3.2, "Flexible workers" if lang == "en" else "灵活就业人群", "200M+", "China, official-level reporting" if lang == "en" else "中国，官方/准官方口径", font=font)
            add_metric(slide, 4.25, 2.35, 3.2, "Online retail 2024" if lang == "en" else "2024 网上零售", "RMB 15.5T", "+7.2% YoY", font=font)
            add_metric(slide, 7.72, 2.35, 3.2, "Service retail" if lang == "en" else "服务零售", "+6.2%", "2024 YoY", font=font)
            add_bullets(slide, body.split("\n"), 0.78, 4.0, 8.5, 1.7, 14, font)
            add_textbox(slide, 0.78, 6.85, 11.8, 0.2, "Sources: NBS, DRC, NDRC-related public materials" if lang == "en" else "来源：国家统计局、国务院发展研究中心、国家发改委相关公开材料", 7.5, False, MUTED, font=font)
        elif kind == "flow":
            add_textbox(slide, 0.75, 1.35, 8.5, 0.55, title, 24, True, DARK, font=font)
            steps = ["发布", "AI分类", "接单", "服务", "支付", "评价"] if lang == "cn" else ["Post", "AI Match", "Accept", "Serve", "Pay", "Review"]
            add_flow(slide, steps, 0.8, 2.55, 11.6, font)
            add_phone(slide, UI_IMAGES["home"], 1.05, 3.55, 3.45)
            add_phone(slide, UI_IMAGES["masters"], 5.05, 3.55, 3.45)
            add_phone(slide, UI_IMAGES["order"], 9.05, 3.55, 3.45)
        elif kind in {"security", "backend", "biz", "referral", "flywheel", "ai", "tech", "compare", "ops", "roadmap", "fund", "use"}:
            add_textbox(slide, 0.75, 1.25, 7.5, 0.65, title, 24, True, DARK, font=font)
            add_bullets(slide, body.split("\n"), 0.78, 2.05, 5.7, 3.5, 14.5, font)
            if kind == "biz":
                add_metric(slide, 7.0, 1.55, 2.5, "Provider" if lang == "en" else "服务人员", "90%", font=font)
                add_metric(slide, 9.85, 1.55, 2.5, "Platform fee" if lang == "en" else "平台服务费", "10%", font=font)
                add_bar(slide, 7.0, 3.1, "Platform revenue" if lang == "en" else "平台收入", 0.8, GREEN, font)
                add_bar(slide, 7.0, 3.65, "Referral reward" if lang == "en" else "推广奖励", 0.2, AMBER, font)
            elif kind == "use":
                labels = [("Product R&D" if lang == "en" else "产品研发", .35), ("Marketing" if lang == "en" else "市场推广", .225), ("Payroll" if lang == "en" else "人员薪资", .225), ("Infra" if lang == "en" else "基础设施", .075), ("Legal/IP" if lang == "en" else "法务知识产权", .05), ("Reserve" if lang == "en" else "运营预备", .075)]
                for i, (label, pct) in enumerate(labels):
                    add_bar(slide, 7.1, 1.65 + i * 0.65, f"{label} {int(pct*1000)/10:g}%", pct / .35, GREEN if i < 3 else AMBER, font)
            elif kind == "compare":
                headers = ["BangBang", "Meituan", "58", "Xianyu", "Daojia"] if lang == "en" else ["帮帮", "美团", "58", "闲鱼", "到位"]
                rows = ["Dual identity", "AI matching", "Unified trust", "Referral flywheel"] if lang == "en" else ["双身份", "AI 分发", "统一信用", "推广飞轮"]
                for c, head in enumerate(headers):
                    add_round_rect(slide, 6.7 + c * 1.1, 1.7, 1.0, 0.45, GREEN if c == 0 else PAPER, GREEN if c == 0 else LINE)
                    add_textbox(slide, 6.72 + c * 1.1, 1.84, .96, .16, head, 7.5, True, WHITE if c == 0 else DARK, PP_ALIGN.CENTER, font)
                for r, row in enumerate(rows):
                    add_textbox(slide, 6.7, 2.35 + r * 0.55, 1.4, .2, row, 8, True, DARK, font=font)
                    for c in range(5):
                        mark = "●" if c == 0 or (r == 2 and c in [1, 4]) else "○"
                        add_textbox(slide, 8.3 + c * .7, 2.33 + r * 0.55, .3, .2, mark, 12, True, GREEN if mark == "●" else MUTED, PP_ALIGN.CENTER, font)
            else:
                imgs = [UI_IMAGES["profile"], UI_IMAGES["order"], UI_IMAGES["report"]]
                add_phone(slide, imgs[idx % 3], 8.85, 1.25, 5.7)
        else:
            add_textbox(slide, 0.75, 1.55, 8.3, 0.9, title, 28, True, DARK, font=font)
            add_bullets(slide, body.split("\n"), 0.82, 2.75, 8.8, 2.8, 16, font)
            add_round_rect(slide, 10.0, 1.45, 2.55, 3.6, RGBColor(234, 249, 243), GREEN)
            add_textbox(slide, 10.25, 2.45, 2.05, 0.55, "帮帮" if lang == "cn" else "BangBang", 26, True, GREEN, PP_ALIGN.CENTER, font)
            add_textbox(slide, 10.25, 3.08, 2.05, 0.38, "有事找帮帮" if lang == "cn" else "Help is one tap away", 11, True, DARK, PP_ALIGN.CENTER, font)
        add_textbox(slide, 0.72, 7.08, 5.0, 0.18, "BangBang · Confidential" if lang == "en" else "帮帮 · 投资人材料", 7, False, MUTED, font=font)
    prs.save(path)


def set_doc_font(run, font_name, size=11, bold=False):
    run.font.name = font_name
    run.font.size = Pt(size)
    run.bold = bold


def add_doc_heading(doc, text, level, font):
    p = doc.add_heading(level=level)
    run = p.add_run(text)
    set_doc_font(run, font, 16 if level == 1 else 13, True)
    return p


def add_doc_para(doc, text, font, bold=False):
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_doc_font(run, font, 10.5, bold)
    p.paragraph_format.space_after = Pt(6)
    return p


def make_business_plan(path: Path, lang="cn"):
    font = CN_FONT if lang == "cn" else EN_FONT
    doc = Document()
    sec = doc.sections[0]
    sec.top_margin = DocxInches(0.65)
    sec.bottom_margin = DocxInches(0.65)
    sec.left_margin = DocxInches(0.72)
    sec.right_margin = DocxInches(0.72)
    title = "《帮帮》Pre-Seed 商业计划书" if lang == "cn" else "BangBang Pre-Seed Business Plan"
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run(title)
    set_doc_font(r, font, 22, True)
    p2 = doc.add_paragraph()
    p2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r2 = p2.add_run("AI时代全民技能共享与灵活就业平台" if lang == "cn" else "An AI-era Skill Sharing and Flexible Work Platform")
    set_doc_font(r2, font, 12, True)
    if FINAL_UI_COMPOSITE.exists():
        doc.add_picture(str(FINAL_UI_COMPOSITE), width=DocxInches(6.2))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER
    elif UI_IMAGES["home"].exists():
        doc.add_picture(str(UI_IMAGES["home"]), width=DocxInches(2.0))
        doc.paragraphs[-1].alignment = WD_ALIGN_PARAGRAPH.CENTER

    if lang == "cn":
        sections = [
            ("1. 执行摘要", "帮帮不是一个传统上门服务平台，而是 AI 时代全民技能共享与灵活就业平台。平台允许用户同时拥有消费者与服务提供者双重身份：有需求时发布需求，有时间和技能时接单赚钱。帮帮通过 AI 分类、智能推荐、实名认证、技能认证、信用评分、订单留痕、售后仲裁和推广奖励体系，重构本地服务供需匹配。"),
            ("2. 投资亮点", "第一，宏观时机清晰：AI 正在重塑工作，普通人对第二收入和灵活就业的需求提升。第二，供给侧更大：帮帮不只连接商家，而是连接每一个可信任的普通人。第三，交易信任可被系统化：实名、资质、评价、信用、定位、隐私保护和后台风控共同降低陌生人交易风险。第四，增长机制内生：平台服务费中预留推广奖励，让用户成为增长引擎。"),
            ("3. 市场背景", "中国灵活就业人员已超过 2 亿人级别，说明大量劳动者正在寻找更灵活的收入方式。与此同时，本地生活、到家服务、即时服务和服务零售继续增长。2024 年全国网上零售额达到 15.5225 万亿元，服务零售额同比增长 6.2%。到家服务中的家政、陪诊、陪护、维修安装、宠物照看等需求具备长期刚性。"),
            ("4. 问题与机会", "消费者端的核心痛点是找不到靠谱的人、价格不透明、服务过程不可追溯、售后难。服务人员端的核心痛点是获客成本高、非专业技能缺乏变现渠道、信用无法长期沉淀。平台端的机会在于建立统一分类、统一信用、统一风控和统一支付评价体系。"),
            ("5. 产品方案", "帮帮的核心流程为：发布需求、AI 智能分类、附近展示、服务人员接单、服务履约、支付结算、双方评价。首页直接进入产品体验，需求大厅按服务分类导航，师傅导航只展示在线接单人员，订单中心跟踪状态流转，我的页面承载钱包、推广、售后、卡券、浏览记录和技能认证。"),
            ("6. 服务与认证体系", "帮帮采用分层准入机制。普通低风险服务，如收纳、跑腿、陪聊、宠物照看、数码协助等，人人可接；专业或高风险服务，如开锁、电工、燃气、医疗护理、高空作业等，需要上传资质并通过后台审核。客户下单前可查看形象照、实名状态、技能证明、资质证明、用户评价和评价图片。"),
            ("7. 安全与合规体系", "安全体系包括实名认证、人脸识别、隐私协议、地址分段展示、订单内沟通、定位记录、投诉举报、退款售后、后台审核、黑名单和信用分。平台应避免撮合违法违规服务，并对陪聊、陪伴等服务设置内容边界和风控提示。地图定位仅在订单进行中共享，接单前仅展示大概区域。"),
            ("8. 商业模式", "平台按成交额收取 10% 服务费。其中 90% 支付给服务人员，10% 进入平台；平台 10% 中，8% 作为平台收入，2% 作为推广奖励。推广奖励由平台承担，不从服务人员收入中扣除。长期收入还可扩展至认证服务、增值曝光、商家工具、保险合作和企业服务。"),
            ("9. 增长策略", "第一阶段聚焦东莞，建立城市密度和口碑样板。第二阶段扩展广东重点城市，验证跨城复制能力。第三阶段覆盖珠三角，形成区域网络效应。平台增长依靠交易后的分享奖励、服务人员自传播、社区场景裂变、校园与宝妈/退休人群合作、线下地推和内容种草共同驱动。"),
            ("10. 竞争格局", "美团强在商家和履约，58 强在信息发布，闲鱼强在闲置交易，到位强在垂直到家服务。帮帮的定位不同：以双身份、人人接单、AI 分发、统一信用、推广飞轮和更宽服务类目形成差异。帮帮不是替代所有平台，而是在普通人技能变现和社区互助场景中建立新入口。"),
            ("11. 技术架构", "MVP 技术栈为 Next.js、Supabase、Storage、AI 分类推荐、地图定位和后台审核。Supabase 承载 Auth、Database、Storage 和 RLS；前端采用移动端优先设计；AI 用于需求理解、分类、筛选、客服、风控和未来智能派单。"),
            ("12. 团队与组织", "早期团队建议 6-7 人：CEO、AI/全栈工程师、产品设计、城市运营、增长、客服，以及外包法务财务。组织原则是 Lean Team，优先验证交易闭环、信任机制和城市单点模型。"),
            ("13. 融资计划", "本轮 Pre-Seed 融资 200 万元，拟出让 20%，投前估值 800 万元，投后估值 1000 万元。资金用途：产品研发 70 万，市场推广 45 万，人员薪资 45 万，云服务器与基础设施 15 万，法务财务知识产权 10 万，日常运营及预备资金 15 万。"),
            ("14. 里程碑", "0-3 个月：完成 MVP、实名认证、需求发布、接单、订单、支付预留和后台审核。3-6 个月：东莞小规模运营，验证首批服务类目、留存和成交。6-12 个月：完善地图、支付、售后、推广奖励和风控，形成可复制城市模型。"),
            ("15. 风险与应对", "主要风险包括安全事件、服务质量不稳定、合规边界、冷启动供给不足和获客成本上升。应对方式包括严格分层认证、订单保险和保障机制、先限定城市和服务类目、后台人工审核、用户教育、黑名单和投诉仲裁。"),
            ("16. 结论", "帮帮的核心价值不是把某个垂直上门服务线上化，而是用 AI、信用和推广机制，把每个普通人的技能和时间组织成可交易的灵活就业网络。它服务的是本地生活，也是 AI 时代的收入基础设施。"),
        ]
        sources = SOURCES_CN
    else:
        sections = [
            ("1. Executive Summary", "BangBang is not a traditional home-service marketplace. It is an AI-era skill sharing and flexible work platform. Every user can be both a customer and a provider: post needs when they need help, and earn when they have time and skills. BangBang combines AI classification, smart matching, real-name identity, skills verification, credit scoring, order records, after-sales arbitration and referral rewards to rebuild local-service matching."),
            ("2. Investment Highlights", "First, the timing is clear: AI is reshaping work and increasing demand for flexible income. Second, the supply side is larger: BangBang connects trusted ordinary people, not only merchants. Third, trust can be systematized through identity, proof, reviews, credit, location, privacy and risk controls. Fourth, growth is built into the model through platform-funded referral rewards."),
            ("3. Market Context", "China has more than 200 million flexible workers, showing a massive need for flexible income channels. Local services, instant services and service retail continue to grow. In 2024, China's online retail sales reached RMB 15.5225 trillion, and service retail grew 6.2%. Home services such as cleaning, escort care, repair, installation and pet care remain durable human-needed demand."),
            ("4. Problem and Opportunity", "Consumers struggle to find trustworthy people, transparent prices, traceable service processes and reliable after-sales. Providers face high acquisition cost, no path to monetize non-professional skills, and weak reputation accumulation. The platform opportunity is to build unified classification, unified trust, unified risk control and unified payment/review infrastructure."),
            ("5. Product Solution", "The core flow is: post a need, AI classification, nearby display, provider accepts, service delivery, payment settlement and mutual review. The home screen enters the product directly; the demand hall uses category navigation; the master hall only displays active providers; the order center tracks status; the profile page includes wallet, referrals, after-sales, coupons, browsing history and skill certification."),
            ("6. Provider and Verification System", "BangBang uses layered access. Low-risk tasks such as organizing, errands, companionship chat, pet care and device assistance are open to ordinary users. Professional or high-risk tasks such as lock opening, electrical work, gas repair, medical care and high-altitude work require proof and admin review. Customers can view photos, identity, skill proof, qualifications, reviews and review images before ordering."),
            ("7. Safety and Compliance", "The safety system includes real-name identity, face check, privacy agreements, partial address display, in-order communication, location records, complaints, refunds, admin review, blacklists and credit scoring. The platform should reject illegal services and set clear boundaries for companionship categories. Location is shared only during active orders; before acceptance only approximate areas are shown."),
            ("8. Business Model", "BangBang charges a 10% service fee per transaction. Providers receive 90%. Of the platform's 10%, 8% is platform revenue and 2% funds referral rewards. The reward is borne by the platform, not deducted from providers. Long-term revenue can expand to certification, promoted exposure, provider tools, insurance partnerships and enterprise services."),
            ("9. Growth Strategy", "Phase one focuses on Dongguan to build density and reputation. Phase two expands to key Guangdong cities. Phase three covers the Pearl River Delta and builds regional network effects. Growth is driven by post-transaction referrals, provider self-promotion, community distribution, campus/parent/retiree partnerships, offline acquisition and content seeding."),
            ("10. Competitive Landscape", "Meituan is strong in merchants and fulfillment, 58 in listings, Xianyu in second-hand transactions, and Daojia in vertical home services. BangBang is different: dual identity, everyone-can-earn supply, AI distribution, unified credit, referral flywheel and broader categories. It creates a new entry point for ordinary people's skill monetization and community mutual help."),
            ("11. Technology Architecture", "The MVP stack is Next.js, Supabase, Storage, AI classification/recommendation, maps/location and admin review. Supabase supports Auth, Database, Storage and RLS. The frontend is mobile-first. AI powers demand understanding, classification, filtering, support, risk control and future dispatch."),
            ("12. Team and Organization", "The early team should stay lean: CEO, AI/full-stack engineer, product/design, city operations, growth, support, plus outsourced legal and finance. The priority is to validate the transaction loop, trust mechanism and single-city model."),
            ("13. Financing Plan", "The Pre-Seed round seeks RMB 2 million for 20% equity, implying RMB 8 million pre-money and RMB 10 million post-money. Use of funds: RMB 700K product R&D, RMB 450K marketing, RMB 450K payroll, RMB 150K cloud/infrastructure, RMB 100K legal/finance/IP, and RMB 150K operations reserve."),
            ("14. Milestones", "0-3 months: MVP, identity, demand posting, acceptance, orders, payment reservation and admin review. 3-6 months: small-scale Dongguan operation and validation of initial service categories, retention and transactions. 6-12 months: maps, payment, after-sales, referral rewards and risk controls, forming a replicable city model."),
            ("15. Risks and Mitigation", "Key risks include safety incidents, inconsistent service quality, compliance boundaries, cold-start supply and rising acquisition cost. Mitigation includes layered verification, order protection mechanisms, limited initial city/category scope, admin review, user education, blacklists and dispute arbitration."),
            ("16. Conclusion", "BangBang is not simply moving one vertical home service online. It uses AI, trust and referral incentives to organize ordinary people's skills and time into a transactable flexible-work network. It is local service infrastructure and income infrastructure for the AI era."),
        ]
        sources = SOURCES_EN
    for heading, text in sections:
        add_doc_heading(doc, heading, 1, font)
        add_doc_para(doc, text, font)
    add_doc_heading(doc, "数据来源 / Sources" if lang == "cn" else "Sources", 1, font)
    for source in sources:
        add_doc_para(doc, source, font)
    doc.save(path)


if __name__ == "__main__":
    prepare_final_ui_assets()
    make_deck(CN_SLIDES, OUT / "帮帮_Pre-Seed融资PitchDeck_中文.pptx", "cn")
    make_deck(EN_SLIDES, OUT / "BangBang_Pre-Seed_Pitch_Deck_EN.pptx", "en")
    make_business_plan(OUT / "帮帮_Pre-Seed商业计划书_中文.docx", "cn")
    make_business_plan(OUT / "BangBang_Pre-Seed_Business_Plan_EN.docx", "en")
    print("Generated investor materials:")
    for file in sorted(OUT.iterdir()):
        print(file)
