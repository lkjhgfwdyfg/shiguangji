# -*- coding: utf-8 -*-
"""优计划「检查更新」方案示例图（v5 轮）"""
from PIL import Image, ImageDraw, ImageFont

FONT_R = "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"
FONT_B = "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"

BG = "#FAF6EF"
CARD = "#FFFFFF"
TXT = "#4A4238"
SUB = "#8A7F6E"
BROWN = "#6B5B45"
APRICOT = "#F2C47C"
GREEN = "#BFD8C2"
SOFT = "#F3EBDC"
BORDER = "#EDE5D8"
ACCENT = "#C08A3E"
MASK = "#3A342C"

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


def set_row(d, y, icon, label, right, right_bold=False):
    """设置页一行"""
    rrect(d, (30, y, 630, y + 96), 22, fill=CARD)
    rrect(d, (56, y + 24, 96, y + 64), 20, fill=SOFT)
    d.text((70, y + 36), icon, font=f(24, True), fill=ACCENT)
    d.text((116, y + 34), label, font=f(26, True), fill=TXT)
    if right:
        ctext(d, 596, y + 36, right, f(22, True) if right_bold else f(22, False), SUB)
    d.text((610, y + 32), "›", font=f(30, True), fill="#C9BFB0")
    return y + 112


# ============ 图 A：更新弹窗 ============
img, d = new_canvas()
# 遮罩背景
overlay = Image.new("RGBA", (W, H), (58, 52, 44, 150))
img = Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")
d = ImageDraw.Draw(img)
status_bar(d)

# 弹窗卡片
rrect(d, (40, 300, 620, 1000), 34, fill=CARD)
# 顶部图标
rrect(d, (280, 348, 380, 448), 50, fill="#FBEED7")
d.ellipse((318, 362, 342, 386), fill=ACCENT)
d.line((330, 434, 330, 396), fill=ACCENT, width=10)
d.polygon([(310, 410), (330, 380), (350, 410)], fill=ACCENT)
# 标题
ctext(d, W / 2, 486, "发现新版本", font=f(38, True), fill=TXT)
ctext(d, W / 2, 542, "v0.5.0 · 优计划更新了", font=f(22), fill=ACCENT)
ctext(d, W / 2, 586, "想邀请你来慢慢看看", font=f(22), fill=SUB)

# 更新内容列表
items = [
    "回顾页新增「完成收录集」，完成的事都收在这里",
    "每件事都可以补文字和照片，留一份自己的记录",
    "修复了归档收录的问题，短期归档也会进来",
]
y = 636
for it in items:
    d.ellipse((84, y + 10, 100, y + 26), fill=GREEN)
    d.line((88, y + 20, 93, y + 24), fill=BROWN, width=3)
    d.line((93, y + 24, 98, y + 14), fill=BROWN, width=3)
    d.text((116, y + 6), it, font=f(20), fill=TXT)
    y += 58

# 勾选"不再提醒"
rrect(d, (70, y + 14, 590, y + 78), 18, fill=SOFT)
rrect(d, (94, y + 32, 130, y + 68), 12, outline=BORDER, width=3)
d.text((150, y + 34), "不再提醒这个版本", font=f(22, True), fill=BROWN)
d.text((330, y + 36), "更新内容后也可以自己来设置里检查", font=f(18), fill=SUB)
y += 120

# 按钮
rrect(d, (70, y, 296, y + 96), 26, fill=SOFT)
ctext(d, 183, y + 30, "以后再说", font=f(26, True), fill=SUB)
rrect(d, (318, y, 590, y + 96), 26, fill=APRICOT)
ctext(d, 454, y + 30, "去更新", font=f(26, True), fill=BROWN)

ctext(d, W / 2, y + 136, "更新后，你的计划、日记、语录都会保留", font=f(19), fill=SUB)
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v5/update-dialog.png")

# ============ 图 B：设置页「检查更新」入口 ============
img, d = new_canvas()
status_bar(d)
d.text((50, 90), "设置", font=f(40, True), fill=TXT)
d.text((50, 148), "让优计划按你喜欢的方式陪伴", font=f(22), fill=SUB)

y = 210
y = set_row(d, y, "铃", "提醒通知", "关闭", False)
y = set_row(d, y, "句", "每日一句", "开", True)
y = set_row(d, y, "色", "主题色", "", False)
y = set_row(d, y, "月", "外观", "浅色", False)
# 检查更新行（高亮，右侧版本号）
rrect(d, (30, y, 630, y + 96), 22, fill="#FBEED7")
rrect(d, (56, y + 24, 96, y + 64), 20, fill="#F2C47C")
d.text((72, y + 34), "↑", font=f(26, True), fill=BROWN)
d.text((116, y + 34), "检查更新", font=f(26, True), fill=TXT)
ctext(d, 596, y + 34, "v0.4.1", f(22, True), ACCENT)
d.text((612, y + 32), "›", font=f(30, True), fill="#C9BFB0")
y += 130
d.text((50, y), "有新版本时，打开 App 会轻轻提醒你；", font=f(20), fill=SUB)
d.text((50, y + 36), "也可以随时在这里手动检查。", font=f(20), fill=SUB)

nav_bar(d, "设置")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v5/settings-check.png")

# ============ 图 C：检查结果（已是最新） ============
img, d = new_canvas()
status_bar(d)
d.text((50, 90), "设置", font=f(40, True), fill=TXT)
d.text((50, 148), "让优计划按你喜欢的方式陪伴", font=f(22), fill=SUB)

y = 210
y = set_row(d, y, "铃", "提醒通知", "关闭", False)
y = set_row(d, y, "句", "每日一句", "开", True)
y = set_row(d, y, "色", "主题色", "", False)
y = set_row(d, y, "月", "外观", "浅色", False)
y = set_row(d, y, "↑", "检查更新", "v0.4.1", True)

# 检查后的结果条
rrect(d, (30, y, 630, y + 84), 22, fill="#EAF2E8")
d.ellipse((56, y + 26, 84, y + 54), fill=GREEN)
d.line((62, y + 42, 69, y + 48), fill=BROWN, width=4)
d.line((69, y + 48, 79, y + 34), fill=BROWN, width=4)
d.text((104, y + 30), "已经是最新版本了，安心用吧。", font=f(23, True), fill=BROWN)
nav_bar(d, "设置")
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v5/settings-result.png")
print("done")
