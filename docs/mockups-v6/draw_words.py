# -*- coding: utf-8 -*-
"""优计划「累计写字数」方案示例图（v6 轮）"""
from PIL import Image, ImageDraw, ImageFont

FONT_R = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_B = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

BG = "#FAF6EF"
CARD = "#FFFFFF"
TXT = "#4A4238"
SUB = "#8A7F6E"
BROWN = "#6B5B45"
APRICOT = "#F2C47C"
SOFT = "#F3EBDC"
BORDER = "#EDE5D8"
ACCENT = "#C08A3E"

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


def stat_card(d, x, y, w, h, label, value, note, highlight=False):
    """回顾页统计小卡"""
    fill = "#FBEED7" if highlight else CARD
    rrect(d, (x, y, x + w, y + h), 24, fill=fill)
    d.text((x + 24, y + 22), label, font=f(22, True), fill=SUB)
    d.text((x + 24, y + 62), value, font=f(42, True), fill=BROWN if highlight else TXT)
    d.text((x + 24, y + 118), note, font=f(18), fill=SUB)


def tag(d, x, y, text, fill=SOFT, color=SUB):
    """方案角标"""
    w, h = tw(d, text, f(20, True))
    rrect(d, (x, y, x + w + 24, y + 38), 19, fill=fill)
    d.text((x + 12, y + 7), text, font=f(20, True), fill=color)


# ============ 图 A：回顾页三卡并列（第三卡=写下过的字） ============
img, d = new_canvas()
status_bar(d)
tag(d, 40, 82, "方案一 · 回顾页顶部统计卡", SOFT, ACCENT)
d.text((50, 150), "回顾", font=f(40, True), fill=TXT)
d.text((50, 208), "只看你为自己做了多少，不做评判。", font=f(22), fill=SUB)

# 三张统计卡
card_w = 190
gap = 16
x0 = 40
y0 = 270
stat_card(d, x0, y0, card_w, 180, "这周的选择", "3", "这周你为自己做了 3 次选择。")
stat_card(d, x0 + card_w + gap, y0, card_w, 180, "这个月\n靠近的目标", "2", "这个月，你在 2 个\n目标上留下脚印。")
stat_card(d, x0 + 2 * (card_w + gap), y0, card_w, 180, "写下过的字", "1.2万", "日记、灵感、记录\n里写下的句子。", highlight=True)

# 下面示意小柱图
rrect(d, (40, 490, 620, 620), 24, fill=CARD)
d.text((64, 510), "本周的轻轻记录", font=f(22, True), fill=TXT)
bars = [0.5, 0.8, 0.3, 1.0, 0.6, 0.4, 0.7]
bx = 96
for i, b in enumerate(bars):
    bh = int(b * 56)
    d.rounded_rectangle((bx, 620 - 24 - bh, bx + 34, 620 - 24), 10, fill=APRICOT if i < 5 else "#E7DFD0")
    bx += 64
nav_bar(d, "回顾")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v6/plan-a-review-card.png")

# ============ 图 B：回顾页大数字卡片（仪式感） ============
img, d = new_canvas()
status_bar(d)
tag(d, 40, 82, "方案二 · 回顾页大数字卡片", SOFT, ACCENT)
d.text((50, 150), "回顾", font=f(40, True), fill=TXT)
d.text((50, 208), "只看你为自己做了多少，不做评判。", font=f(22), fill=SUB)

# 两张小卡（选择/目标）
stat_card(d, 40, 270, 300, 180, "这周的选择", "3", "这周你为自己做了 3 次选择。")
stat_card(d, 356, 270, 264, 180, "靠近的目标", "2", "这个月，你在 2 个目标\n上留下脚印。")

# 大数字卡
rrect(d, (40, 470, 620, 700), 28, fill="#FBEED7")
d.text((64, 496), "写下过的字", font=f(24, True), fill=SUB)
d.text((64, 534), "12,580", font=f(88, True), fill=BROWN)
d.text((240, 570), "字", font=f(34, True), fill=SUB)
d.text((64, 634), "日记、灵感、补记，都是你认真生活的痕迹。", font=f(20), fill=SUB)
d.text((64, 668), "从你第一次打开优计划开始，一直在增加。", font=f(18), fill=SUB)

# 下方小柱图占位
rrect(d, (40, 730, 620, 850), 24, fill=CARD)
d.text((64, 752), "本周的轻轻记录", font=f(22, True), fill=TXT)
nav_bar(d, "回顾")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v6/plan-b-review-hero.png")

# ============ 图 C：设置页关于区（低调） ============
img, d = new_canvas()
status_bar(d)
tag(d, 40, 82, "方案三 · 设置页「关于」里低调一行", SOFT, ACCENT)
d.text((50, 150), "设置", font=f(40, True), fill=TXT)
d.text((50, 208), "按你喜欢的方式，照顾自己。", font=f(22), fill=SUB)

# 上面几个设置项占位
y = 270
for icon, label, right in [("铃", "提醒通知", "关闭"), ("句", "每日一句", "开"), ("色", "主题色", ""), ("月", "外观", "浅色")]:
    rrect(d, (40, y, 620, y + 88), 22, fill=CARD)
    rrect(d, (64, y + 20, 100, y + 56), 18, fill=SOFT)
    d.text((78, y + 28), icon, font=f(22, True), fill=ACCENT)
    d.text((120, y + 28), label, font=f(24, True), fill=TXT)
    if right:
        ctext(d, 580, y + 30, right, f(20), SUB)
    y += 104

# 关于卡（含字数）
rrect(d, (40, y + 10, 620, y + 250), 28, fill=CARD)
d.text((W / 2, y + 36), "优计划", font=f(28, True), fill=TXT, anchor="ma")
d.text((W / 2, y + 84), "版本 0.5.0", font=f(20), fill=SUB, anchor="ma")
# 字数行（低调胶囊）
w_text = "你在这里写下了 12,580 个字"
wt = tw(d, w_text, f(22, True))
rrect(d, ((W - wt[0] - 44) / 2, y + 122, (W + wt[0] + 44) / 2, y + 170), 24, fill="#FBEED7")
d.text((W / 2, y + 130), w_text, font=f(22, True), fill=BROWN, anchor="ma")
d.text((W / 2, y + 196), "日记、灵感、记录，慢慢积累的句子。", font=f(18), fill=SUB, anchor="ma")
nav_bar(d, "设置")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v6/plan-c-settings-about.png")

# ============ 图 D：记录页顶部小提示 ============
img, d = new_canvas()
status_bar(d)
tag(d, 40, 82, "方案四 · 记录页顶部小提示", SOFT, ACCENT)
d.text((50, 150), "记录", font=f(40, True), fill=TXT)
d.text((50, 208), "写下想留住的句子和画面。", font=f(22), fill=SUB)

# 顶部小横幅
rrect(d, (40, 262, 620, 330), 22, fill="#FBEED7")
d.rounded_rectangle((64, 278, 96, 310), 16, fill="#E8D3A8")
d.text((71, 284), "记", font=f(18, True), fill=BROWN)
d.text((112, 284), "在优计划里，你已写下 12,580 个字", font=f(22, True), fill=BROWN)

# 日记列表占位
for i, (day, title, note) in enumerate([
    ("今天", "秋日散步", "银杏落了一地，风很温柔，走了很久也不觉得累。"),
    ("10月20日", "一个想法", "想把每天的一件小事，写成三行字。"),
    ("10月18日", "跑步记", "五公里跑完，配速比上周稳了一点，开心。"),
]):
    y = 366 + i * 180
    rrect(d, (40, y, 620, y + 160), 24, fill=CARD)
    d.text((64, y + 22), day, font=f(20, True), fill=ACCENT)
    d.text((64, y + 56), title, font=f(26, True), fill=TXT)
    d.text((64, y + 104), note[:26] + ("…" if len(note) > 26 else ""), font=f(20), fill=SUB)
    rrect(d, (556, y + 60, 596, y + 100), 20, fill=SOFT)
nav_bar(d, "记录")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v6/plan-d-record-banner.png")
print("done")
