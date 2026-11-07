#!/usr/bin/env python3
"""Install GROWSPEC-approved WebP assets and update two crop pages in one transaction.

The incoming archive is a user-uploaded, pre-optimized crop-photo ZIP.
Keeps old assets untouched, fails closed on invalid/missing content.
"""
from __future__ import annotations
import io
import json
import sys
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ARCHIVE = ROOT / "GROWSPEC_Crop_Pages_Optimized_WebP.zip"
IMAGES = ROOT / "images" / "crop-pages"

EXPECTED = {
    "strawberry-container-cutaway.webp",
    "strawberry-growing-aisle.webp",
    "strawberry-rack-system.webp",
    "strawberry-crop-reference.webp",
    "microgreens-container-growing.webp",
    "microgreens-purple-crop.webp",
    "microgreens-green-crop.webp",
}

def replace_once(content: str, old: str, new: str, label: str) -> str:
    occurrences = content.count(old)
    if occurrences != 1:
        raise ValueError(f"{label}: expected 1 occurrence, found {occurrences}")
    return content.replace(old, new, 1)

def update_page(slug: str, hero: str, intro: str, items: list[tuple[str, str, str]], og: str) -> None:
    page = ROOT / "products" / slug / "index.html"
    html = page.read_text(encoding="utf-8")
    generic = "../../images/products/biocube-container/biocube-container-vertical-farming-system-open-door-hero.webp"
    # Scope to the real hero image, not the shared launcher preview asset.
    hero_anchor = f'<img src="{generic}" alt="GROWSPEC 40ft BioCube Container controlled environment farming system" width="1600" height="1000" fetchpriority="high" loading="eager" decoding="async"/>'
    hero_replacement = (
        f'<img src="../../images/crop-pages/{hero}" '
        f'alt="{og}" width="1440" height="960" fetchpriority="high" '
        f'loading="eager" decoding="async"/>'
    )
    html = replace_once(html, hero_anchor, hero_replacement, f"{slug} hero")
    if slug.startswith("strawberry"):
        old_intro = '../../images/products/farmcube-ultra/farmcube-ultra-farmcube-ultra-strawberry-cultivation-in-grow-buckets.webp'
        old_alt = "Strawberry plants growing indoors in a GROWSPEC controlled farming system"
        new_alt = "Strawberry plants inside the crop growing system"
        old_caption = "Strawberry crop reference from a separate GROWSPEC growing system. The BioCube Container strawberry layout is specified per project."
        new_caption = "Strawberry crop reference provided for this project page. Visual appearance and layout may vary by system configuration."
    else:
        old_intro = "../../images/home/home/home-biocube-modular-microgreen.webp"
        old_alt = "Microgreens growing in a GROWSPEC indoor modular vertical farm"
        new_alt = "Purple microgreens growing densely under LED lighting inside a container"
        old_caption = "Crop reference photograph from an indoor GROWSPEC system; a container's tray arrangement is configured separately."
        new_caption = "Microgreens growing inside a container system, showing the close-up crop canopy."
    html = replace_once(html, old_intro, "../../images/crop-pages/" + intro, f"{slug} intro source")
    html = replace_once(html, old_alt, new_alt, f"{slug} intro alt")
    html = replace_once(html, old_caption, new_caption, f"{slug} intro caption")
    # Explicitly distinguish the cutaway visualization from a real project photograph.
    if slug.startswith("strawberry"):
        old_hero_caption = "The BioCube Container platform. The internal growing layout is configured for the selected crop."
        new_hero_caption = "Illustrative cutaway of a 40ft strawberry growing container. Final equipment arrangement is defined in project drawings."
    else:
        old_hero_caption = "The BioCube Container platform. The internal growing layout is configured for the selected crop."
        new_hero_caption = "Microgreens growing inside a controlled-environment container. Final tray and rack layouts are specified per project."
    html = replace_once(html, old_hero_caption, new_hero_caption, f"{slug} hero caption")
    gallery = '<section class="crop-section crop-section-light crop-photo-gallery" id="crop-gallery"><div class="crop-wrap">' \
        '<span class="crop-label">GROWING SYSTEM PHOTO GALLERY</span>' \
        '<h2>Explore the crop and equipment inside the growing environment.</h2>' \
        '<div class="crop-gallery-grid">'
    for filename, alt, caption in items:
        gallery += (
            f'<figure><img src="../../images/crop-pages/{filename}" alt="{alt}" '
            f'width="1200" height="800" loading="lazy" decoding="async"/>'
            f'<figcaption>{caption}</figcaption></figure>'
        )
    gallery += '</div></div></section>\n'
    faq_start = '<section class="crop-section crop-section-light" id="faq">'
    html = replace_once(html, faq_start, gallery + faq_start, f"{slug} gallery insertion")
    if html.count('id="crop-gallery"') != 1:
        raise ValueError("Gallery not inserted exactly once")
    page.write_text(html, encoding="utf-8")

def main() -> int:
    if not ARCHIVE.is_file():
        raise FileNotFoundError(f"Upload {ARCHIVE.name} to the repository root to publish these images.")
    with zipfile.ZipFile(ARCHIVE, "r") as zip_in:
        contents = {}
        for name in EXPECTED:
            key = "images/crop-pages/" + name
            if key not in zip_in.namelist():
                raise ValueError(f"Missing required asset: {key}")
            data = zip_in.read(key)
            if not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
                raise ValueError(f"Image is not genuine WebP: {name}")
            if len(data) > 320 * 1024:
                raise ValueError(f"Image exceeds 320 KB: {name}")
            contents[name] = data
    IMAGES.mkdir(parents=True, exist_ok=True)
    for name, data in contents.items():
        (IMAGES / name).write_bytes(data)
    update_page(
        "strawberry-container-farm",
        "strawberry-container-cutaway.webp",
        "strawberry-crop-reference.webp",
        [
            ("strawberry-growing-aisle.webp", "Perspective view of strawberry growing tiers and lighting", "Illustrative strawberry growing aisle and lighting layout."),
            ("strawberry-rack-system.webp", "Strawberry planting racks with grow channels and access aisle", "Strawberry growing rack arrangement and access."),
        ],
        "Illustrative cutaway of the strawberry container growing system",
    )
    update_page(
        "microgreens-container-farm",
        "microgreens-container-growing.webp",
        "microgreens-purple-crop.webp",
        [
            ("microgreens-green-crop.webp", "Dense green microgreens crop under LED lights", "Green microgreens growing in a container system."),
            ("microgreens-purple-crop.webp", "Dense purple microgreens in the growing system", "Close-up of purple microgreens and the crop surface."),
        ],
        "Commercial green and purple microgreens growing inside a container farm",
    )
    css_path = ROOT / "assets" / "css" / "growspec-crop-pages.css"
    css = css_path.read_text(encoding="utf-8")
    gallery_css = """
/* Crop photo gallery — scoped, responsive and no additional JavaScript */
body.crop-landing-page .crop-photo-gallery .crop-gallery-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:19px;margin-top:22px}
body.crop-landing-page .crop-photo-gallery figure{margin:0;overflow:hidden;border:1px solid #dae6ee;border-radius:13px;background:#fff}
body.crop-landing-page .crop-photo-gallery img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}
body.crop-landing-page .crop-photo-gallery figcaption{padding:13px 16px;font:500 12px/1.7 Manrope,Arial,sans-serif;color:#405b70}
@media(max-width:700px){body.crop-landing-page .crop-photo-gallery .crop-gallery-grid{grid-template-columns:1fr}}
"""
    if "crop-photo-gallery .crop-gallery-grid" not in css:
        css_path.write_text(css + "\n" + gallery_css, encoding="utf-8")
    for slug in ["strawberry-container-farm", "microgreens-container-farm"]:
        page = ROOT / "products" / slug / "index.html"
        html = page.read_text(encoding="utf-8")
        if "growspec-crop-pages.css?v=2" in html:
            html = html.replace("growspec-crop-pages.css?v=2", "growspec-crop-pages.css?v=3", 1)
            page.write_text(html, encoding="utf-8")
    print("Installed seven verified WebP images; updated both crop pages and shared CSS.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
