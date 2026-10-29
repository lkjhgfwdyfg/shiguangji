# -*- coding: utf-8 -*-
"""优计划 v2 优化方案示例图（第二轮：按用户反馈调整）"""
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
    d.text((40, 30), "20:14", font=f(24, True), fill=TXT)
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


def card(d, y0, y1, r=24):
    rrect(d, (30, y0, 630, y1), r, fill=CARD)


def pill(d, cx, cy, text, font, fill, tcol, padx=22, h=None):
    w, hh = tw(d, text, font)
    if h is None:
        h = hh + 18
    pw = w + padx * 2
    rrect(d, (cx - pw / 2, cy - h / 2, cx + pw / 2, cy + h / 2), h, fill=fill)
    d.text((cx - w / 2, cy - hh / 2), text, font=font, fill=tcol)


# ---------------- 1. 今日页改版（语录卡：无提示、点击即换） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "晚上好", font=f(34, True), fill=TXT)
d.text((52, 182), "10月9日 周五", font=f(22), fill=SUB)

card(d, 240, 430)
w, hh = tw(d, "有些日子光是好好度过，", f(26, True))
d.text(((660 - w) / 2, 292), "有些日子光是好好度过，", font=f(26, True), fill=TXT)
w, hh = tw(d, "就已经足够。", f(26, True))
d.text(((660 - w) / 2, 334), "就已经足够。", font=f(26, True), fill=TXT)

pill(d, W / 2, 500, "✦  在路上的目标 · 3", f(24, True), YELLOW, BROWN, padx=26, h=52)
d.text((300, 532), "每个都值得慢慢来", font=f(18), fill=SUB)

card(d, 600, 800)
ctext(d, W / 2, 640, "今天没有必须做的事", f(26, True), TXT)
ctext(d, W / 2, 700, "可以好好休息，或随手做一件喜欢的小事。", f(22), SUB)

d.text((50, 852), "明天的打算", font=f(27, True), fill=TXT)
d.text((400, 858), "+ 添加", font=f(22, True), fill=ACCENT)
d.text((50, 896), "明天到了，会自动出现在今日卡片里", font=f(20), fill=SUB)
rrect(d, (30, 930, 630, 996), 20, fill=SOFT)
d.text((58, 950), "想一件明天做的小事…", font=f(22), fill="#B0A48F")
d.ellipse((576, 940, 622, 986), fill=APRICOT)
d.text((590, 953), "+", font=f(26, True), fill="#FFFFFF")
pill(d, 200, 1052, "晨跑 20 分钟 ✕", f(21), SOFT, BROWN, padx=18, h=44)
pill(d, 415, 1052, "给妈妈打个电话 ✕", f(21), SOFT, BROWN, padx=18, h=44)

nav_bar(d, "今天")
img.save("today-v2.png")

# ---------------- 2. 记录页 · 日记（收录集） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "记录", font=f(34, True), fill=TXT)
d.text((52, 182), "写下来，就是温柔的整理。", font=f(22), fill=SUB)

rrect(d, (170, 230, 490, 282), 26, fill=SOFT)
rrect(d, (174, 234, 332, 278), 22, fill=APRICOT)
ctext(d, 253, 242, "日记", f(23, True), BROWN)
ctext(d, 407, 242, "灵感", f(23), SUB)

pill(d, W / 2, 314, "已收录 · 3 篇", f(20, True), SOFT, BROWN, padx=18, h=36)

card(d, 350, 650)
d.text((58, 382), "10月9日 · 周五", font=f(24, True), fill=TXT)
d.text((520, 386), "20:14", font=f(20), fill=SUB)
d.line((58, 428, 602, 428), fill=BORDER, width=2)
d.text((58, 450), "今天很安静，风很舒服。散步的时候想通了", font=f(22), fill=TXT)
d.text((58, 490), "一件小事：有些事，不急就是最好的进度。", font=f(22), fill=TXT)

card(d, 680, 940)
d.text((58, 712), "10月8日 · 周四", font=f(24, True), fill=TXT)
d.text((520, 716), "21:02", font=f(20), fill=SUB)
d.line((58, 758, 602, 758), fill=BORDER, width=2)
d.text((58, 780), "晚上和妈妈视频，她气色好了很多。", font=f(22), fill=TXT)
d.text((58, 820), "记下了：常打电话，不需要理由。", font=f(22), fill=TXT)

card(d, 970, 1070)
d.text((58, 992), "＋ 写今天的一小段", font=f(22), fill="#B0A48F")

d.ellipse((560, 1200, 632, 1272), fill=APRICOT)
d.text((580, 1218), "+", font=f(40, True), fill="#FFFFFF")

nav_bar(d, "记录")
img.save("record-diary.png")

# ---------------- 3. 记录页 · 灵感（保留小星星） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "记录", font=f(34, True), fill=TXT)
d.text((52, 182), "写下来，就是温柔的整理。", font=f(22), fill=SUB)

rrect(d, (170, 230, 490, 282), 26, fill=SOFT)
rrect(d, (328, 234, 486, 278), 22, fill=APRICOT)
ctext(d, 253, 242, "日记", f(23), SUB)
ctext(d, 407, 242, "灵感", f(23, True), BROWN)

rrect(d, (30, 312, 630, 372), 18, fill="#FBF3E0")
d.text((58, 330), "✦  今天也要记得收集让你心动的小事。", font=f(21), fill=BROWN)

card(d, 400, 640)
d.text((58, 432), "❝", font=f(40, True), fill=APRICOT)
d.text((58, 470), "慢一点没关系，方向对了就好。", font=f(26, True), fill=TXT)
d.text((58, 530), "来自 · 每日一句", font=f(20), fill=SUB)
d.ellipse((552, 512, 600, 560), fill="#FBE9E4")
d.text((568, 526), "♥", font=f(24, True), fill="#D98A7A")

card(d, 670, 870)
d.text((58, 702), "❝", font=f(40, True), fill=APRICOT)
d.text((58, 740), "休息不是放弃，是为了走得更远。", font=f(26, True), fill=TXT)
d.text((58, 800), "来自 · 每日一句", font=f(20), fill=SUB)
d.ellipse((552, 782, 600, 830), fill=SOFT)
d.text((568, 796), "♥", font=f(24, True), fill="#C9BFA9")

card(d, 900, 1000)
d.text((58, 922), "＋ 记一条灵感（一句话、一个念头）", font=f(22), fill="#B0A48F")

nav_bar(d, "记录")
img.save("record-inspiration.png")

# ---------------- 4. 设置 · 提醒通知（方案 B） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "设置 · 提醒通知", font=f(34, True), fill=TXT)
d.text((52, 182), "已选：方案 B · App 内真正生效", font=f(22), fill=SUB)

card(d, 240, 620)
d.text((58, 276), "提醒通知", font=f(25, True), fill=TXT)
d.text((58, 324), "开启后，在设定时间温柔提醒一次", font=f(21), fill=SUB)
d.text((58, 360), "（仅本地，不联网）", font=f(21), fill=SUB)
rrect(d, (528, 278, 596, 318), 20, fill=GREEN)
d.ellipse((560, 284, 590, 312), fill="#FFFFFF")
d.line((58, 410, 602, 410), fill=BORDER, width=2)
d.text((58, 436), "提醒时间", font=f(23, True), fill=TXT)
pill(d, 490, 466, "20:00", f(22, True), SOFT, BROWN, padx=20, h=44)
d.text((58, 520), "网页版暂不支持，安装 App 后可用", font=f(20), fill=SUB)

nav_bar(d, "设置")
img.save("settings-notify.png")

# ---------------- 5. 语录点击刷新（无提示，点击即换） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "每日一句 · 点击刷新示意", font=f(30, True), fill=TXT)

card(d, 200, 470)
d.text((58, 240), "❝", font=f(38, True), fill=APRICOT)
d.text((58, 282), "有些日子光是好好度过，就已经足够。", font=f(25, True), fill=TXT)

d.text((300, 510), "↓ 单击", font=f(26, True), fill=ACCENT)

card(d, 580, 880)
d.text((58, 620), "❝", font=f(38, True), fill=GREEN)
d.text((58, 662), "做一点，也算数。", font=f(25, True), fill=TXT)
d.text((58, 740), "柔和淡入 · 换一句", font=f(19), fill=SUB)

nav_bar(d, "今天")
img.save("quote-tap.png")

print("done")
