"""Write a Markdown copy next to each page listed in site/sitemap.xml (page.html -> page.md, dir/ -> dir/index.md)."""
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup
from markdownify import markdownify

SITE = Path(sys.argv[1] if len(sys.argv) > 1 else "site")
BASE = "https://sandy.tayts.com/"


def page_paths():
    for url in re.findall(r"<loc>([^<]+)</loc>", (SITE / "sitemap.xml").read_text()):
        rel = url.removeprefix(BASE)
        yield url, SITE / (rel + "index.html" if rel == "" or rel.endswith("/") else rel)


def to_markdown(url, html_path):
    soup = BeautifulSoup(html_path.read_text(), "html.parser")
    title = soup.title.get_text(strip=True) if soup.title else ""
    desc = soup.find("meta", attrs={"name": "description"})
    body = soup.body
    for tag in body.find_all(["script", "style", "svg", "canvas", "noscript", "template", "button", "form", "nav"]):
        tag.decompose()
    for tag in body.select('[aria-hidden="true"], .skip, .skip-link'):
        tag.decompose()
    for tag in body.select("strong b, strong strong"):
        tag.insert_after(" ")
        tag.unwrap()
    # Inline items placed side by side with no space (card fields, link rows) get a separator.
    for tag in body.find_all(["span", "a", "strong"]):
        nxt = tag.next_sibling
        if getattr(nxt, "name", None) in ("span", "a", "strong"):
            tag.insert_after(" · ")
    for a in body.find_all("a", href=True):
        a["href"] = re.sub(r"^(?!https?:|mailto:|tel:|#)", BASE, a["href"])
    for img in body.find_all("img", src=True):
        img["src"] = re.sub(r"^(?!https?:|data:)", BASE, img["src"])
    md = markdownify(str(body), heading_style="ATX", bullets="-")
    md = re.sub(r"\s*·\s*$", "", md, flags=re.M)
    md = re.sub(r"\n{3,}", "\n\n", md).strip()
    head = f"# {title}\n\n" + (f"{desc['content']}\n\n" if desc else "") + f"Source: {url}\n\n"
    return head + md + "\n"


for url, html_path in page_paths():
    out = html_path.with_suffix(".md")
    out.write_text(to_markdown(url, html_path))
    print(out)
