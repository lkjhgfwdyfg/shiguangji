# -*- coding: utf-8 -*-
"""优计划 日记贴图功能 示例图"""
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


def photo(d, x0, y0, x1, y1, sun_x=0.62, sun_y=0.28):
    """画一张温柔风景小照片（圆角）"""
    r = 14
    # 渐变天空（浅杏 → 浅黄）
    steps = 12
    for i in range(steps):
        t = i / (steps - 1)
        col = (
            int(247 / 255 * 250) if False else int(246 + (250 - 246) * t),
            int(196 + (208 - 196) * t),
            int(124 + (140 - 124) * t),
        )
        yy0 = y0 + (y1 - y0) * i / steps
        yy1 = y0 + (y1 - y0) * (i + 1) / steps
        d.rounded_rectangle((x0, yy0, x1, yy1), radius=r, fill=col)
    # 太阳
    sx = x0 + (x1 - x0) * sun_x
    sy = y0 + (y1 - y0) * sun_y
    d.ellipse((sx - 12, sy - 12, sx + 12, sy + 12), fill="#F8E8B0")
    # 远山
    d.rounded_rectangle((x0, y0 + (y1 - y0) * 0.58, x1, y1), radius=r, fill="#D8C79A")
    d.ellipse((x0 - 30, y0 + (y1 - y0) * 0.46, x0 + 130, y1 + 40), fill="#CFB98C")
    d.ellipse((x1 - 120, y0 + (y1 - y0) * 0.50, x1 + 20, y1 + 40), fill="#C4AD80")
    # 近处草地
    d.rounded_rectangle((x0, y0 + (y1 - y0) * 0.74, x1, y1), radius=r, fill="#B9D4A4")
    # 圆角遮罩（重绘边框圆角）
    d.rounded_rectangle((x0, y0, x1, y1), radius=r, outline=CARD, width=3)


# ---------------- 1. 记录页 · 日记（收录集 · 带小图） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "记录", font=f(34, True), fill=TXT)
d.text((52, 182), "写下来，就是温柔的整理。", font=f(22), fill=SUB)

rrect(d, (170, 230, 490, 282), 26, fill=SOFT)
rrect(d, (174, 234, 332, 278), 22, fill=APRICOT)
ctext(d, 253, 242, "日记", f(23, True), BROWN)
ctext(d, 407, 242, "灵感", f(23), SUB)

pill_w = 210
rrect(d, (W / 2 - pill_w / 2, 296, W / 2 + pill_w / 2, 332), 18, fill=SOFT)
ctext(d, W / 2, 302, "已收录 · 3 篇", f(20, True), BROWN)

# 日记卡片1（带小图）
card(d, 360, 660)
d.text((58, 392), "10月9日 · 周五", font=f(24, True), fill=TXT)
d.text((520, 396), "20:14", font=f(20), fill=SUB)
d.line((58, 438, 602, 438), fill=BORDER, width=2)
d.text((58, 462), "今天很安静，风很舒服。散步的时候想通了", font=f(21), fill=TXT)
d.text((58, 500), "一件小事。", font=f(21), fill=TXT)
photo(d, 470, 540, 600, 640)

# 日记卡片2（带小图）
card(d, 690, 990)
d.text((58, 722), "10月8日 · 周四", font=f(24, True), fill=TXT)
d.text((520, 726), "21:02", font=f(20), fill=SUB)
d.line((58, 768, 602, 768), fill=BORDER, width=2)
d.text((58, 792), "晚上和妈妈视频，她气色好了很多。", font=f(21), fill=TXT)
d.text((58, 830), "记下了：常打电话，不需要理由。", font=f(21), fill=TXT)
photo(d, 470, 870, 600, 970)

card(d, 1020, 1120)
d.text((58, 1042), "＋ 写今天的一小段", font=f(22), fill="#B0A48F")

d.ellipse((560, 1200, 632, 1272), fill=APRICOT)
d.text((580, 1218), "+", font=f(40, True), fill="#FFFFFF")

nav_bar(d, "记录")
img.save("record-diary.png")

# ---------------- 2. 写日记（编辑器） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "写日记", font=f(32, True), fill=TXT)
d.text((52, 180), "10月9日 · 周五", font=f(22), fill=SUB)

# 文字编辑区
card(d, 230, 560)
d.text((58, 262), "今天想写点什么…", font=f(24), fill="#B0A48F")
d.line((58, 520, 602, 520), fill=BORDER, width=2)
d.text((58, 536), "12 / 500", font=f(18), fill="#C4BBA7")

# 图片区：已选2张 + 添加按钮
d.text((50, 610), "图片（可多张）", font=f(23, True), fill=TXT)
photo(d, 30, 660, 190, 820)
d.ellipse((150, 730, 190, 770), fill="#FFFFFF", outline=SUB, width=2)
d.text((160, 740), "✕", font=f(20, True), fill=SUB)
photo(d, 210, 660, 370, 820, sun_x=0.4, sun_y=0.3)
d.ellipse((330, 730, 370, 770), fill="#FFFFFF", outline=SUB, width=2)
d.text((340, 740), "✕", font=f(20, True), fill=SUB)
rrect(d, (390, 660, 560, 820), 18, fill=SOFT, outline=BORDER, width=2)
d.text((458, 720), "+", font=f(44, True), fill="#B0A48F")
ctext(d, 475, 772, "添加图片", f(19), "#B0A48F")
d.text((58, 852), "可从相册选图或拍照，也支持长按粘贴", font=f(19), fill=SUB)

# 保存按钮
rrect(d, (180, 960, 480, 1030), 26, fill=APRICOT)
ctext(d, W / 2, 978, "保存这篇日记", f(25, True), BROWN)

nav_bar(d, "记录")
img.save("diary-write.png")

# ---------------- 3. 日记详情（大图 + 可编辑文字） ----------------
img, d = new_canvas()
status_bar(d)
d.text((50, 130), "10月9日 · 周五", font=f(30, True), fill=TXT)
d.text((52, 178), "编辑后自动保存", font=f(20), fill=SUB)

# 大图
photo(d, 30, 220, 630, 560, sun_x=0.55, sun_y=0.3)

# 文字（可编辑）
card(d, 590, 900)
d.text((58, 622), "今天很安静，风很舒服。散步的时候想通了", font=f(23), fill=TXT)
d.text((58, 662), "一件小事：有些事，不急就是最好的进度。", font=f(23), fill=TXT)
d.line((58, 860, 602, 860), fill=BORDER, width=2)
d.text((58, 876), "点击文字即可修改", font=f(18), fill="#C4BBA7")

# 小图缩略行
d.text((50, 930), "共 2 张图片", font=f(22, True), fill=TXT)
photo(d, 30, 972, 190, 1132, sun_x=0.4, sun_y=0.3)
photo(d, 210, 972, 370, 1132, sun_x=0.62, sun_y=0.28)
rrect(d, (390, 972, 550, 1132), 16, fill=SOFT, outline=BORDER, width=2)
d.text((458, 1030), "+", font=f(40, True), fill="#B0A48F")

nav_bar(d, "记录")
img.save("diary-detail.png")

print("done")
