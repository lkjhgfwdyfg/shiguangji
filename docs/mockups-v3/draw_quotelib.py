# -*- coding: utf-8 -*-
"""优计划「语录集」方案示例图（v3 轮）"""
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
RED = "#E0654F"

W, H = 660, 1420


def f(size, bold=False):
    return ImageFont.truetype(FONT_B if bold else FONT_R, size, index=2)


def new_canvas(bg=BG):
    img = Image.new("RGB", (W, H), bg)
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


def status_bar(d, time="20:13"):
    d.text((40, 30), time, font=f(24, True), fill=TXT)
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


# ============ 图 1：今日页 · 书签入口 ============
img, d = new_canvas()
status_bar(d)

d.text((50, 90), "晚上好", font=f(40, True), fill=TXT)
d.text((50, 146), "10月10日 周六", font=f(26), fill=SUB)

# 语录卡
rrect(d, (30, 200, 630, 420), 28, fill=CARD)
d.line((30, 200, 630, 200), fill=BORDER, width=0)
# 书签图标（右上角）
cx = 566
d.rounded_rectangle((cx - 22, 224, cx + 22, 272), radius=8, fill=SOFT, outline=ACCENT, width=2)
d.polygon([(cx - 10, 238), (cx + 10, 238), (cx + 10, 258), (cx, 250), (cx - 10, 258)], fill=ACCENT)
# 红圈标注书签
d.ellipse((cx - 38, 208, cx + 38, 290), outline=RED, width=4)
d.text((cx, 320), "改为：点击进入语录集", font=f(22, True), fill=RED)
# 语录正文
ctext(d, W / 2, 250, "今天愿意开始，", font=f(34, True), fill=BROWN)
ctext(d, W / 2, 300, "就已经很棒。", font=f(34, True), fill=BROWN)

# 目标胶囊
pill_y = 452
rrect(d, (30, pill_y, 380, pill_y + 66), 33, fill=SOFT)
d.text((60, pill_y + 14), "在路上的目标 · 3", font=f(25, True), fill=BROWN)
rrect(d, (396, pill_y, 630, pill_y + 66), 33, fill=SOFT)
d.text((420, pill_y + 14), "每个都值得慢慢来", font=f(24), fill=SUB)

# 今日卡片
rrect(d, (30, 550, 630, 700), 24, fill=CARD)
d.text((60, 578), "明天用 WorkBuddy 重新部署一下", font=f(27), fill=TXT)
d.text((60, 626), "今天已完成，真不错。", font=f(23), fill=GREEN and "#7BA683")

# 明天的打算
rrect(d, (30, 730, 630, 900), 24, fill=CARD)
d.text((60, 756), "明天的打算", font=f(27, True), fill=TXT)
d.text((500, 760), "明天 周日", font=f(22), fill=SUB)
d.text((60, 800), "明天到了，会自动出现在今日卡片里。", font=f(21), fill=SUB)
rrect(d, (60, 842, 600, 894), 16, fill=SOFT)
d.text((84, 858), "想一件明天做的小事…", font=f(24), fill="#B5A896")

img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v3/quotelib-today.png")

# ============ 图 2：语录集主页 ============
img, d = new_canvas()
status_bar(d)
# 顶栏
d.text((50, 88), "‹ 返回", font=f(28, True), fill=TXT)
d.text((250, 88), "语录集", font=f(34, True), fill=TXT)
d.text((430, 96), "共 24 句", font=f(22), fill=SUB)
# 添加按钮
rrect(d, (420, 150, 630, 208), 29, fill=APRICOT)
ctext(d, 525, 160, "＋ 添加一句", font=f(26, True), fill=BROWN)
d.text((50, 158), "这些句子会随机出现在今日页", font=f(22), fill=SUB)

groups = [
    ("今天", ["从前的日色变得慢，车、马、邮件都慢。—— 木心《从前慢》", "长长的路，慢慢地走。—— 龙应台", "你比你想象的要勇敢……—— 小熊维尼"]),
    ("完成", ["你终究会成为你正在成为的人。—— 毛姆《刀锋》", "正是你为你的玫瑰花费的时间……—— 小王子"]),
    ("顺延", ["让我们每天带着希望出门……—— 朱德庸", "从明天起，做一个幸福的人。—— 海子"]),
    ("跳过", ["我就喜欢你现在这个样子。—— 佛瑞德·罗杰斯"]),
    ("回顾", ["黑夜给了我黑色的眼睛……—— 顾城", "我在最深的绝望里，遇见最美丽的惊喜。—— 几米"]),
]
y = 240
for name, rows in groups:
    d.text((50, y), name, font=f(25, True), fill=ACCENT)
    d.text((140, y + 2), f"{len(rows)} 句", font=f(20), fill=SUB)
    y += 46
    for rtext in rows:
        rrect(d, (30, y, 630, y + 78), 20, fill=CARD)
        d.text((56, y + 14), rtext[:18], font=f(23), fill=TXT)
        # 编辑/删除
        rrect(d, (486, y + 22, 548, y + 58), 14, fill=SOFT)
        d.text((500, y + 30), "改", font=f(21, True), fill=BROWN)
        rrect(d, (558, y + 22, 620, y + 58), 14, fill=SOFT)
        d.text((572, y + 30), "删", font=f(21, True), fill=BROWN)
        y += 92
# 底部提示
d.text((50, y + 20), "删掉的句子不会再出现，想恢复可以重新添加。", font=f(21), fill=SUB)
img.save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v3/quotelib-main.png")

# ============ 图 3：添加 / 编辑语录弹窗 ============
img, d = new_canvas()
d.rectangle((0, 0, W, H), fill=(0, 0, 0, 0))
overlay = Image.new("RGBA", (W, H), (90, 80, 66, 150))
img = Image.alpha_composite(img.convert("RGBA"), overlay)
d = ImageDraw.Draw(img)
# 弹窗
rrect(d, (40, 300, 620, 1080), 28, fill=CARD)
d.text((80, 350), "添加一句语录", font=f(34, True), fill=TXT)
d.text((80, 420), "写下想对自己说的那句话…", font=f(24), fill=SUB)
# 输入框
rrect(d, (80, 470, 580, 640), 20, fill=SOFT, outline=BORDER, width=2)
d.text((104, 500), "在这里输入你的语录…", font=f(25), fill="#B5A896")
# 场景选择
d.text((80, 690), "它属于哪个场景", font=f(26, True), fill=TXT)
d.text((80, 732), "选好后，这句话会在对应时机随机出现", font=f(21), fill=SUB)
scenes = ["今天", "完成", "顺延", "跳过", "回顾"]
x = 80
for i, s in enumerate(scenes):
    w = 92 if len(s) == 2 else 104
    sel = i == 0
    rrect(d, (x, 800, x + w, 858), 29, fill=APRICOT if sel else SOFT)
    d.text((x + (w - tw(d, s, f(24, sel))[0]) / 2, 812), s, font=f(24, sel), fill=BROWN if sel else SUB)
    x += w + 18
# 提示
d.text((80, 900), "示例：今天想对自己说……", font=f(21), fill=SUB)
d.text((80, 928), "开合随机，温柔就好。", font=f(21), fill=SUB)
# 按钮
rrect(d, (80, 968, 320, 1032), 26, fill=SOFT)
ctext(d, 200, 980, "取消", font=f(26, True), fill=SUB)
rrect(d, (340, 968, 580, 1032), 26, fill=APRICOT)
ctext(d, 460, 980, "保存", font=f(26, True), fill=BROWN)
img.convert("RGB").save("/home/user/Doubao/chats/38443503911360258/you-plan/docs/mockups-v3/quotelib-edit.png")
print("done")
