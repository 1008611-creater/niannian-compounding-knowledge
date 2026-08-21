from pathlib import Path
from html import escape
import subprocess

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'visual' / 'demo-doubao' / 'images'
OUT.mkdir(parents=True, exist_ok=True)
CHROME = Path('C:/Program Files/Google/Chrome/Application/chrome.exe')
NAVY = '#18294F'
ORANGE = '#E65B36'
PAPER = '#F5EEE2'
INK = '#242A38'
MUTED = '#6F6B64'
WHITE = '#FFF9EF'
FONT = 'Microsoft YaHei, Noto Sans CJK SC, Arial, sans-serif'


def text(x, y, value, size, color=INK, weight=700, anchor='start'):
    return f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{size}" font-weight="{weight}" fill="{color}" text-anchor="{anchor}">{escape(value)}</text>'


def multiline(x, y, lines, size, color=INK, weight=700, gap=1.25):
    return ''.join(text(x, y + i * size * gap, line, size, color, weight) for i, line in enumerate(lines))


def defs():
    return f'''<defs>
      <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2" fill="{NAVY}" opacity=".10"/></pattern>
      <pattern id="orangeDots" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="1.8" fill="{ORANGE}" opacity=".20"/></pattern>
    </defs>'''


def robot(x, y, scale=1.0, action='toolbox'):
    s = scale
    parts = []
    def r(px, py, w, h, fill, rx=12, stroke=NAVY, sw=6):
        parts.append(f'<rect x="{x+px*s:.1f}" y="{y+py*s:.1f}" width="{w*s:.1f}" height="{h*s:.1f}" rx="{rx*s:.1f}" fill="{fill}" stroke="{stroke}" stroke-width="{sw*s:.1f}"/>')
    def line(x1,y1,x2,y2,color=NAVY,sw=8):
        parts.append(f'<path d="M{x+x1*s:.1f} {y+y1*s:.1f} L{x+x2*s:.1f} {y+y2*s:.1f}" fill="none" stroke="{color}" stroke-width="{sw*s:.1f}" stroke-linecap="round"/>')
    r(30, 80, 250, 190, NAVY, 30, NAVY, 7)
    r(55, 110, 200, 115, PAPER, 16, NAVY, 6)
    parts.append(f'<circle cx="{x+112*s:.1f}" cy="{y+164*s:.1f}" r="{15*s:.1f}" fill="{ORANGE}"/>')
    parts.append(f'<circle cx="{x+198*s:.1f}" cy="{y+164*s:.1f}" r="{15*s:.1f}" fill="{ORANGE}"/>')
    parts.append(f'<path d="M{x+112*s:.1f} {y+195*s:.1f} Q{x+155*s:.1f} {y+215*s:.1f} {x+198*s:.1f} {y+195*s:.1f}" fill="none" stroke="{NAVY}" stroke-width="{8*s:.1f}" stroke-linecap="round"/>')
    r(20, 265, 270, 34, ORANGE, 10, NAVY, 6)
    r(116, 278, 78, 52, PAPER, 10, NAVY, 5)
    line(55, 300, 10, 385, NAVY, 15)
    line(245, 300, 315, 365, NAVY, 15)
    if action == 'stamp':
        r(305, 330, 46, 120, ORANGE, 8, NAVY, 5)
        r(293, 442, 72, 24, ORANGE, 6, NAVY, 5)
    elif action == 'pipe':
        parts.append(f'<circle cx="{x+326*s:.1f}" cy="{y+365*s:.1f}" r="{25*s:.1f}" fill="{ORANGE}" stroke="{NAVY}" stroke-width="{6*s:.1f}"/>')
    else:
        r(0, 370, 80, 55, ORANGE, 10, NAVY, 5)
    line(98, 338, 75, 465, NAVY, 14)
    line(215, 338, 235, 465, NAVY, 14)
    r(42, 458, 72, 24, NAVY, 8, NAVY, 4)
    r(204, 458, 72, 24, NAVY, 8, NAVY, 4)
    parts.append(f'<path d="M{x+155*s:.1f} {y+78*s:.1f} L{x+155*s:.1f} {y+35*s:.1f}" stroke="{NAVY}" stroke-width="{7*s:.1f}"/>')
    parts.append(f'<path d="M{x+155*s:.1f} {y+35*s:.1f} L{x+185*s:.1f} {y+8*s:.1f} L{x+165*s:.1f} {y+13*s:.1f} L{x+185*s:.1f} {y+42*s:.1f}" fill="{ORANGE}" stroke="{NAVY}" stroke-width="{5*s:.1f}"/>')
    return ''.join(parts)


def shell(width, height, body, kicker, title_lines, subtitle, footer):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">{defs()}
<rect width="100%" height="100%" fill="{PAPER}"/>
<rect x="0" y="0" width="100%" height="100%" fill="url(#dots)"/>
<rect x="0" y="0" width="{width}" height="32" fill="{NAVY}"/>
{text(82, 110, kicker, 28, ORANGE, 800)}
{multiline(82, 205, title_lines, 76 if width == 1080 else 68, NAVY, 900, 1.08)}
{multiline(82, 400 if width == 1080 else 370, [subtitle], 30, MUTED, 500, 1.2)}
{body}
{multiline(width/2, height-82, [footer], 27, NAVY, 800, 1.2)}
</svg>'''


def cover():
    body = []
    body.append(f'<rect x="80" y="500" width="920" height="760" rx="42" fill="{WHITE}" stroke="{NAVY}" stroke-width="8"/>')
    body.append(f'<rect x="130" y="550" width="300" height="170" rx="20" fill="{NAVY}"/>')
    body.append(multiline(165, 620, ['一次浏览器操作'], 32, PAPER, 800))
    body.append(f'<path d="M430 635 H520" stroke="{ORANGE}" stroke-width="18" stroke-linecap="round"/><path d="M500 605 L545 635 L500 665" fill="none" stroke="{ORANGE}" stroke-width="18" stroke-linecap="round"/>')
    body.append(f'<rect x="575" y="550" width="300" height="170" rx="20" fill="{ORANGE}"/>')
    body.append(multiline(610, 620, ['可验收服务链'], 32, WHITE, 800))
    body.append(robot(340, 760, 1.25, 'toolbox'))
    body.append(f'<rect x="90" y="1100" width="900" height="100" rx="22" fill="{NAVY}"/><text x="540" y="1166" font-family="{FONT}" font-size="34" font-weight="800" fill="{PAPER}" text-anchor="middle">FastAPI · Playwright · MP4 · 验收</text>')
    return shell(1080, 1440, ''.join(body), 'NIANNIAN KNOWLEDGE CARD / AUTOMATION', ['豆包视频生成服务'], '不是脚本展示，而是一条可复用的自动化链路', '把一次操作变成一条可验收的服务链')


def page_one():
    body=[]
    body.append(f'<rect x="82" y="480" width="916" height="450" rx="34" fill="{WHITE}" stroke="{NAVY}" stroke-width="8"/>')
    body.append(f'<rect x="125" y="555" width="300" height="250" rx="24" fill="{PAPER}" stroke="{NAVY}" stroke-width="6"/>')
    body.append(multiline(180, 625, ['脚本'], 52, NAVY, 900))
    body.append(multiline(155, 700, ['点一下','跑一次'], 34, MUTED, 600))
    body.append(f'<path d="M480 680 H600" stroke="{ORANGE}" stroke-width="18" stroke-linecap="round"/><path d="M575 650 L620 680 L575 710" fill="none" stroke="{ORANGE}" stroke-width="18"/>')
    body.append(f'<rect x="655" y="555" width="300" height="250" rx="24" fill="{NAVY}" stroke="{NAVY}" stroke-width="6"/>')
    body.append(multiline(710, 625, ['服务'], 52, PAPER, 900))
    body.append(multiline(690, 700, ['输入 · 状态','结果 · 验收'], 34, ORANGE, 800))
    body.append(robot(330, 1040, .95, 'toolbox'))
    body.append(f'<rect x="560" y="1050" width="430" height="330" rx="28" fill="{ORANGE}"/><text x="600" y="1130" font-family="{FONT}" font-size="34" font-weight="900" fill="{WHITE}">交付标准</text>')
    body.append(multiline(600, 1210, ['脚本能跑','不等于服务能交付'], 36, WHITE, 800, 1.4))
    return shell(1080, 1920, ''.join(body), '01 / THE SHIFT', ['它不是一个脚本'], '自动化的价值，不是复制点击，而是稳定交付', '脚本能跑 ≠ 服务能交付')


def page_two():
    body=[]
    body.append(f'<rect x="82" y="480" width="916" height="970" rx="38" fill="{WHITE}" stroke="{NAVY}" stroke-width="8"/>')
    labels=[('01','FastAPI','提交任务'),('02','CDP Worker','浏览器执行'),('03','豆包工作室','查询状态'),('04','MP4','回收结果')]
    y=580
    for i,(num,a,b) in enumerate(labels):
        body.append(f'<rect x="145" y="{y}" width="790" height="150" rx="24" fill="{NAVY if i%2==0 else ORANGE}"/>')
        body.append(text(195,y+62,num,28,PAPER if i%2==0 else WHITE,900))
        body.append(text(300,y+62,a,42,PAPER if i%2==0 else WHITE,900))
        body.append(text(300,y+112,b,28,ORANGE if i%2==0 else PAPER,700))
        if i<3: body.append(f'<path d="M540 {y+150} V{y+190}" stroke="{ORANGE if i%2==0 else NAVY}" stroke-width="14"/><path d="M520 {y+170} L540 {y+195} L560 {y+170}" fill="none" stroke="{ORANGE if i%2==0 else NAVY}" stroke-width="14"/>')
        y+=210
    body.append(robot(730, 1330, .62, 'pipe'))
    body.append(f'<rect x="110" y="1570" width="860" height="170" rx="26" fill="url(#orangeDots)" stroke="{ORANGE}" stroke-width="5"/>')
    body.append(multiline(160, 1640, ['一眼看懂：提交 → 执行 → 状态 → 结果'], 35, NAVY, 900))
    return shell(1080, 1920, ''.join(body), '02 / THE PIPELINE', ['真实链路怎么走？'], '每一步都有输入、状态和可回读的结果', 'FastAPI → CDP Worker → 豆包工作室 → MP4')


def page_three():
    body=[]
    body.append(f'<rect x="82" y="490" width="916" height="820" rx="38" fill="{WHITE}" stroke="{NAVY}" stroke-width="8"/>')
    body.append(f'<circle cx="540" cy="740" r="210" fill="{PAPER}" stroke="{NAVY}" stroke-width="12"/>')
    body.append(f'<circle cx="540" cy="740" r="115" fill="{ORANGE}" stroke="{NAVY}" stroke-width="8"/>')
    body.append(multiline(540, 730, ['验收'], 52, WHITE, 900, 1.1))
    checks=[('文件可回读',300,560),('任务对应',780,560),('授权清楚',300,1120),('结果可用',780,1120)]
    for label,x,y in checks:
        body.append(f'<rect x="{x-125}" y="{y-38}" width="250" height="76" rx="18" fill="{NAVY}"/><circle cx="{x-88}" cy="{y}" r="18" fill="{ORANGE}"/>{text(x-55,y+11,label,27,PAPER,800)}')
    body.append(robot(330, 1390, .78, 'stamp'))
    body.append(f'<rect x="570" y="1440" width="400" height="250" rx="28" fill="{ORANGE}"/><text x="610" y="1510" font-family="{FONT}" font-size="34" font-weight="900" fill="{WHITE}">重要边界</text>')
    body.append(multiline(610, 1590, ['HTTP 成功','不等于交付成功'], 38, WHITE, 900, 1.35))
    return shell(1080, 1920, ''.join(body), '03 / THE GATE', ['为什么必须有验收门？'], '结果文件、任务状态和授权边界必须同时成立', 'HTTP 成功 ≠ 视频交付成功')


def page_four():
    body=[]
    body.append(f'<rect x="82" y="490" width="916" height="850" rx="38" fill="{NAVY}" stroke="{NAVY}" stroke-width="8"/>')
    items=['授权账号','任务接口','状态查询','MP4 回收','验收回执']
    for i,item in enumerate(items):
        y=600+i*125
        body.append(f'<circle cx="190" cy="{y}" r="28" fill="{ORANGE}"/><path d="M175 {y} L185 {y+11} L207 {y-14}" fill="none" stroke="{WHITE}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')
        body.append(text(250,y+12,item,40,PAPER,800))
        if i<4: body.append(f'<path d="M190 {y+32} V{y+90}" stroke="{ORANGE}" stroke-width="7" stroke-dasharray="10 12"/>')
    body.append(robot(330, 1430, .78, 'toolbox'))
    body.append(f'<rect x="590" y="1500" width="370" height="170" rx="26" fill="{ORANGE}"/><text x="775" y="1570" font-family="{FONT}" font-size="35" font-weight="900" fill="{WHITE}" text-anchor="middle">团队 SOP</text><text x="775" y="1630" font-family="{FONT}" font-size="27" font-weight="700" fill="{WHITE}" text-anchor="middle">一箱装好，反复复用</text>')
    return shell(1080, 1920, ''.join(body), '04 / THE HANDOFF', ['一条可复用的服务链'], '把能力封装好，团队才能真正拿去用', '授权 → 提交 → 执行 → 状态 → 结果 → 验收')


svgs={'cover.svg':cover(),'page-01.svg':page_one(),'page-02.svg':page_two(),'page-03.svg':page_three(),'page-04.svg':page_four()}
for filename, svg in svgs.items():
    path=OUT/filename
    path.write_text(svg, encoding='utf-8')
    png=path.with_suffix('.png')
    size='1080,1440' if filename=='cover.svg' else '1080,1920'
    subprocess.run([str(CHROME),'--headless=new','--disable-gpu','--hide-scrollbars',f'--window-size={size}',f'--screenshot={png}',path.resolve().as_uri()],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    print(png)
