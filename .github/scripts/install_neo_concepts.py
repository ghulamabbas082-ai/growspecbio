#!/usr/bin/env python3
"""Install approved, lightweight FarmCube Neo installation CONCEPTS from a ZIP.

No changes to product photographs, model comparison, canonical URL or FAQs.
The concept images are illustrations of possible placements, not built projects.
"""
from __future__ import annotations
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "GROWSPEC_FarmCube_Neo_2T_5T_Placement_Concepts_WebP.zip"
IMAGE_DIR = ROOT / "images/products/farmcube-neo/concepts"
PAGE = ROOT / "products/farmcube-neo/index.html"
CSS_LINK = '<link rel="stylesheet" href="../../assets/css/growspec-neo-placement-concepts.css?v=1"/>'

# Approved Library concepts mapped to specific buyer situations.
ITEMS = [
    ("mall-multi-unit", "SHOPPING MALL / MULTI-UNIT", "Shopping mall — fresh-growing island",
     "Conceptual mall placement combining multiple stainless-steel 2T countertop units and 5T floor cabinets. Plan sufficient customer circulation and maintenance access.",
     "Concept illustration of multiple FarmCube Neo growing cabinets in a shopping mall"),
    ("restaurant-countertop-2t", "RESTAURANT / 2T COUNTERTOP", "Restaurant — compact 2T presentation",
     "A countertop-led layout for microgreens and culinary herbs, suitable for a restaurant or breakfast service concept.",
     "Concept illustration of compact FarmCube Neo 2T cabinets on a restaurant counter"),
    ("hotel-lounge-2t-5t", "HOTEL / 2T + 5T", "Hotel — mixed-model fresh-food feature",
     "Combine floor-standing 5T growing cabinets with smaller 2T units at a service counter while maintaining practical working clearances.",
     "Concept hotel lounge with FarmCube Neo 2T and 5T growing cabinets"),
    ("commercial-kitchen-5t", "FOODSERVICE / 5T", "Commercial kitchen — multiple 5T units",
     "A back-of-house arrangement focused on ingredient access, operator movement, safe installation and regular cleaning.",
     "Concept illustration of several FarmCube Neo 5T cabinets in a commercial kitchen"),
    ("restaurant-multi-unit", "RESTAURANT / MULTI-UNIT", "Restaurant — scalable fresh-growing wall",
     "A multi-cabinet installation concept for restaurants planning more than one unit across preparation and guest-facing zones.",
     "Concept illustration of a multi-cabinet FarmCube Neo growing wall in a restaurant"),
    ("open-kitchen-2t-5t", "OPEN KITCHEN / 2T + 5T", "Open kitchen — grow-to-plate presentation",
     "Use visible growing cabinets to support a fresh-food experience; proposed placement remains subject to hygiene and ventilation planning.",
     "Concept illustration of an open-kitchen restaurant with FarmCube Neo 2T and 5T cabinets"),
]

def image_path(name: str) -> str:
    return f"../../images/products/farmcube-neo/concepts/farmcube-neo-concept-{name}.webp"

def gallery() -> str:
    out = ['<section class="neo62-section neo-placement-concepts" id="applications" aria-labelledby="neo-concepts-heading">',
           '<div class="neo-vision-wrap">',
           '<span class="neo-vision-eyebrow">FARMCUBE NEO / PLACEMENT VISUALIZATIONS</span>',
           '<h2 id="neo-concepts-heading">See how 2T and 5T cabinets can fit a multi-location hospitality concept.</h2>',
           '<p class="neo-vision-lead">From a single countertop growing station to a coordinated group of cabinets, different spaces call for different placements. These concepts explore shopping malls, hotels, restaurants and commercial kitchens using the stainless-steel FarmCube Neo series.</p>',
           '<p class="neo-vision-note"><strong>Illustrative design concepts — not photographs of actual customer installations.</strong> Cabinet counts, dimensions, installation clearances and final layout must be confirmed for each location.</p>',
           '<div class="neo-vision-grid">']
    for name, label, title, body, alt in ITEMS:
        out.append(f'<article class="neo-vision-card"><figure>'
                   f'<img src="{image_path(name)}" alt="{alt}" width="1151" height="864" '
                   f'loading="lazy" decoding="async"/>'
                   f'<figcaption class="neo-vision-caption"><small>{label}</small>'
                   f'<h3>{title}</h3><p>{body}</p></figcaption>'
                   '</figure></article>')
    out += ['</div><div class="neo-vision-bottom">',
            '<a href="#model-comparison">Compare Neo-2T and Neo-5T ↗</a>',
            '<a href="../../contact/?system=FarmCube%20Neo#project-enquiry">Discuss a multi-unit layout ↗</a>',
            '</div></div></section>']
    return "".join(out)

def main():
    if not ARCHIVE.is_file():
        raise FileNotFoundError(f"Upload {ARCHIVE.name} to the repository root.")
    expected = {f'images/products/farmcube-neo/concepts/farmcube-neo-concept-{name}.webp'
                for name, *_ in ITEMS}
    with zipfile.ZipFile(ARCHIVE, "r") as z:
        found = set(z.namelist())
        missing = expected - found
        if missing:
            raise ValueError(f"ZIP is missing: {sorted(missing)}")
        if len(z.namelist()) != len(found):
            raise ValueError("Duplicate entries in ZIP")
        assets = {}
        for p in sorted(expected):
            data = z.read(p)
            if len(data) > 250 * 1024 or len(data) < 5000:
                raise ValueError(f"Invalid or excessive file size: {p}")
            if not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
                raise ValueError(f"Expected genuine WebP: {p}")
            assets[p] = data

    html = PAGE.read_text(encoding="utf-8")
    before = '<section class="neo62-section neo62-section-soft" id="applications">'
    # Also handle idempotent reruns after successful installation.
    fallback = '<section class="neo62-section neo-placement-concepts" id="applications"'
    after = '<section class="neo62-section neo62-section-light" id="comparison">'
    i = html.find(before)
    if i < 0:
        i = html.find(fallback)
    j = html.find(after, i)
    if i < 0 or j < 0 or i >= j:
        raise ValueError("Neo applications section boundaries not found: refusing to modify page.")

    new_html = html[:i] + gallery() + html[j:]
    if CSS_LINK not in new_html:
        if new_html.count("</head>") != 1:
            raise ValueError("Unexpected head structure")
        new_html = new_html.replace("</head>", CSS_LINK + "</head>", 1)

    if new_html.count("<h1") != html.count("<h1"):
        raise ValueError("H1 count changed")
    if new_html.count('rel="canonical"') != html.count('rel="canonical"'):
        raise ValueError("Canonical link count changed")
    if new_html.count('class="neo-vision-card"') != len(ITEMS):
        raise ValueError("Not all six concepts were installed")
    if new_html.count('id="applications"') != 1:
        raise ValueError("Applications section is not unique")
    if '<script type="application/ld+json">' not in new_html:
        raise ValueError("Structured data was lost")
    if "Black / White / Stainless / Wood" in new_html:
        raise ValueError("Obsolete finish options remain")

    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    for relative, data in assets.items():
        (ROOT / relative).write_bytes(data)
    PAGE.write_text(new_html, encoding="utf-8")
    print(f"Installed {len(assets)} verified WebP visualizations and updated Neo page.")
    print(f"Total compressed images: {sum(map(len, assets.values())) / 1024:.0f} KB")

if __name__ == "__main__":
    sys.exit(main())
