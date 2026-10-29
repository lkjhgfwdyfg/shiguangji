# -*- coding: utf-8 -*-
"""优计划「完成收录集」方案示例图（v4 轮）"""
from PIL import Image, ImageDraw, ImageFont

FONT_R = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_B = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

BG = "#FAF6EF"
CARD = "#FFFFFF"
TXT = "#4A4238"
SUB = "#8A7F6E"
BROWN = "#6B5B45"
APRICOT = "#F2C47C"
YELLOW = "#F5D08C"
GREEN = "#BFD8C2"
SOFT = "#F3EBDC"
BORDER = "#EDE5D8"
ACCENT = "#C08A3E"
DEEP = "#7BA683"

W, H = 660, 1420


def f(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT_R, size, index=2)


def new_canvas():
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)
    return img, d


def rrect(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def tw(d, text, font):
    b = d.textbbox((0, 0), text, font=font)
    return b[2] - b[0], b[3] - b[1]


def ctext(d, cx, y, text, font, fill=TXT):
    w, h = tw(d, text, font)
    d.text((cx - w / 2, y), text, font=font, fill=fill)
    return h


def status_bar(d):
    d.text((40, 30), "20:13", font=f(24, True), fill=TXT)
    d.text((560, 32), "59%", font=f(22, True), fill=TXT)
    d.rounded_rectangle((600, 38, 620, 52), radius=3, fill="#3A3A3A")
    d.rounded_rectangle((612, 34, 622, 44), radius=2, fill="#3A3A3A")
    d.text((500, 32), "5G", font=f(20, True), fill=TXT)


def nav_bar(d, active):
    items = ["今天", "计划", "记录", "回顾", "设置"]
    n = len(items)
    seg = W / n
    for i, it in enumerate(items):
        cx = seg * i + seg / 2
        col = ACCENT if it == active else SUB
        font = f(24, True) if it == active else f(24, False)
        ctext(d, cx, H - 92, it, font, col)
        if it == active:
            d.ellipse((cx - 4, H - 58, cx + 4, H - 50), fill=ACCENT)
    d.line((0, H - 120, W, H - 120), fill=BORDER, width=2)


def mini_thumb(d, x, y, size, base, sun=True):
    """小照片缩略图占位"""
    rrect(d, (x, y, x + size, y + size), 16, fill=base)
    if sun:
        d.ellipse((x + size * 0.30, y + size * 0.22, x + size * 0.52, y + size * 0.44), fill=YELLOW)
    d.polygon([(x + size * 0.08, y + size * 0.88), (x + size * 0.40, y + size * 0.55),
               (x + size * 0.58, y + size * 0.72), (x + size * 0.74, y + size * 0.58),
               (x + size * 0.92, y + size * 0.86)], fill="#D8E4CE")


# ============ 图 A：回顾页 · 完成收录集 ============
img, d = new_canvas()
status_bar(d)
d.text((50, 90), "回顾", font=f(40, True), fill=TXT)
d.text((50, 148), "10月11日 周日", font=f(24), fill=SUB)

# 统计行（三个小卡）
stats = [("本周", "3 次选择"), ("本月", "2 个目标"), ("完成", "8 件小事")]
x = 50
for t, v in stats:
    rrect(d, (x, 200, x + 190, 272), 22, fill=CARD)
    d.text((x + 20, 224), t, font=f(22), fill=SUB)
    d.text((x + 20, 254), v, font=f(24, True), fill=BROWN)
    x += 204

# 本周小柱图
rrect(d, (50, 292, 610, 396), 22, fill=CARD)
d.text((72, 308), "这周", font=f(20, True), fill=BROWN)
bars = [(0.3, GREEN), (0.55, APRICOT), (0.8, GREEN), (0.45, YELLOW), (0.95, APRICOT), (0.6, GREEN), (0.75, YELLOW)]
bx = 120
for h, col in bars:
    bh = int(h * 56)
    rrect(d, (bx, 396 - 40 - bh, bx + 34, 396 - 40), 8, fill=col)
    bx += 54

# 完成收录集
d.text((50, 440), "完成收录集 · 8 件事", font=f(28, True), fill=TXT)
d.text((50, 486), "完成的事都收在这里，可以补上文字和照片。", font=f(21), fill=SUB)

entries = [
    ("晨跑 20 分钟", "10月9日 周五 · 空气很好，跑了三公里。", True, True),
    ("读完《小王子》第 1 章", "10月8日 周四 · 睡前读的，很温柔。", False, True),
    ("整理书桌", "10月7日 周三 · 还没有记录", False, False),
]
y = 540
for title, meta, has_img, has_txt in entries:
    hh = 120 if has_img else 104
    rrect(d, (30, y, 630, y + hh), 24, fill=CARD)
    if has_img:
        mini_thumb(d, 52, y + 24, 72, "#E7EFE3")
        tx = 148
    else:
        tx = 56
    d.text((tx, y + 22), title, font=f(26, True), fill=TXT)
    d.text((tx, y + 60), meta, font=f(20), fill=SUB)
    if not has_txt:
        rrect(d, (tx, y + 26, tx + 150, y + 66), 18, fill=APRICOT)
        d.text((tx + 18, y + 34), "补一段记录", font=f(20, True), fill=BROWN)
    y += hh + 16

d.text((50, y + 8), "每完成一件事，都会自动收在这里。", font=f(20), fill=SUB)
nav_bar(d, "回顾")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v4/review-collection.png")

# ============ 图 B：单条完成记录详情 ============
img, d = new_canvas()
status_bar(d)
d.text((50, 88), "‹ 返回", font=f(28, True), fill=TXT)
ctext(d, W / 2, 88, "晨跑 20 分钟", font=f(32, True), fill=TXT)
rrect(d, (210, 140, 450, 178), 19, fill=GREEN)
ctext(d, W / 2, 146, "10月9日 周五 · 完成", font=f(20, True), fill=BROWN)

# 照片区（大图）
rrect(d, (30, 210, 630, 560), 26, fill="#E7EFE3")
d.ellipse((230, 260, 330, 360), fill=YELLOW)
d.polygon([(60, 540), (300, 330), (420, 430), (520, 350), (630, 520), (630, 560), (30, 560)], fill="#D8E4CE")
d.text((56, 222), "照片", font=f(20, True), fill=SUB)
# 添加照片按钮
rrect(d, (210, 590, 450, 646), 28, fill=SOFT, outline=BORDER, width=2)
ctext(d, W / 2, 602, "＋ 添加照片", font=f(24, True), fill=SUB)

# 文字记录
d.text((50, 692), "这段记录", font=f(22, True), fill=TXT)
rrect(d, (30, 726, 630, 906), 24, fill=CARD, outline=BORDER, width=2)
d.text((56, 752), "空气很好，跑了三公里。", font=f(25), fill=TXT)
d.text((56, 862), "想写点什么都可以，改动会自动保存。", font=f(19), fill=SUB)

# 删除
d.text((220, 946), "删除这段记录", font=f(21), fill="#C08A3E")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v4/review-detail.png")

# ============ 图 C：今日页完成时引导 ============
img, d = new_canvas()
status_bar(d)
d.text((50, 90), "晚上好", font=f(40, True), fill=TXT)
d.text((50, 146), "10月11日 周日", font=f(26), fill=SUB)

# 语录卡
rrect(d, (30, 200, 630, 360), 28, fill=CARD)
ctext(d, W / 2, 250, "长长的路，慢慢地走。", font=f(32, True), fill=BROWN)
ctext(d, W / 2, 300, "—— 龙应台", font=f(20), fill=SUB)

# 完成态卡片
rrect(d, (30, 400, 630, 512), 24, fill="#EAF2E8")
d.ellipse((56, 434, 96, 474), fill=DEEP)
d.line((66, 452, 78, 462), fill="white", width=5)
d.line((78, 462, 90, 442), fill="white", width=5)
d.text((120, 436), "晨跑 20 分钟", font=f(27, True), fill=TXT)
d.text((120, 476), "已经收进回顾里啦", font=f(21), fill=SUB)

# 底部引导卡（杏色）
rrect(d, (30, 560, 630, 736), 26, fill="#FBEED7")
d.text((60, 592), "完成啦，真不错。", font=f(27, True), fill=BROWN)
d.text((60, 638), "要不要在回顾里，给这件事", font=f(22), fill=BROWN)
d.text((60, 668), "补一段文字或照片？", font=f(22), fill=BROWN)
rrect(d, (60, 706, 210, 748), 21, fill=SOFT)
d.text((80, 716), "暂不", font=f(22, True), fill=SUB)
rrect(d, (240, 706, 400, 748), 21, fill=APRICOT)
d.text((270, 716), "去记录", font=f(22, True), fill=BROWN)

nav_bar(d, "今天")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v4/today-done-guide.png")
print("done")
