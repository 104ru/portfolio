"""Render inspection views without modifying production image files."""
from pathlib import Path
import argparse
import math
import numpy as np
from PIL import Image, ImageDraw


def perspective(im, yaw, pitch, size=480, fov=90):
    yy, xx = np.mgrid[:size, :size]
    scale = math.tan(math.radians(fov / 2))
    x = (2 * (xx + .5) / size - 1) * scale
    y = (1 - 2 * (yy + .5) / size) * scale
    z = np.ones_like(x)
    a, b = math.radians(yaw), math.radians(pitch)
    yp, zp = y * math.cos(b) + z * math.sin(b), -y * math.sin(b) + z * math.cos(b)
    xp, zp = x * math.cos(a) + zp * math.sin(a), -x * math.sin(a) + zp * math.cos(a)
    lon = np.arctan2(xp, zp)
    lat = np.arctan2(yp, np.sqrt(xp*xp + zp*zp))
    sx = ((lon / (2 * math.pi) + .5) * im.width).astype(int) % im.width
    sy = np.clip(((.5 - lat / math.pi) * im.height).astype(int), 0, im.height - 1)
    return Image.fromarray(np.asarray(im)[sy, sx])


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('source')
    parser.add_argument('output')
    args = parser.parse_args()
    im = Image.open(args.source).convert('RGB')
    views = [('Front',0,0),('Right',90,0),('Back / seam',180,0),('Left',-90,0),('Up / zenith',0,90),('Down / nadir',0,-90)]
    sheet = Image.new('RGB', (1440,1040), '#eee9df')
    draw = ImageDraw.Draw(sheet)
    for i,(label,yaw,pitch) in enumerate(views):
        x,y=(i%3)*480,(i//3)*520
        sheet.paste(perspective(im,yaw,pitch), (x,y))
        draw.text((x+10,y+490),label,fill='black')
    output=Path(args.output)
    output.parent.mkdir(parents=True,exist_ok=True)
    sheet.save(output,quality=92)
