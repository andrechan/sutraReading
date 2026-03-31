"""Collapse 3+ newlines to one blank line; merge repeated <br><span class='spacing'/> runs."""
import re
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
FILES = ["desc_2.html", "desc_3.html", "desc_4.html"]

BR_SPAN = r"<br>\s*<span class='spacing'(?:/>|></span>)"
PAT_DOUBLE_BR = re.compile(rf"(?:{BR_SPAN}\s*){{2,}}")


def normalize(text: str) -> str:
    # Collapse stacked <br> (common in desc_3/4: "<br>\\n<br>" → huge gaps in panels)
    text = re.sub(r"(?:<br>\s*){2,}", "<br>\n", text, flags=re.IGNORECASE)
    text = re.sub(r"\n{3,}", "\n\n", text)
    prev = None
    while prev != text:
        prev = text
        text = PAT_DOUBLE_BR.sub("<br><span class='spacing'/>", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text


def main() -> None:
    for name in FILES:
        p = BASE / name
        raw = p.read_text(encoding="utf-8")
        out = normalize(raw)
        if out != raw:
            p.write_text(out, encoding="utf-8", newline="\n")
            print(f"{name}: {len(raw)} -> {len(out)} bytes")
        else:
            print(f"{name}: unchanged")


if __name__ == "__main__":
    main()
