#!/usr/bin/env python3
"""Notify participating IndexNow search engines about updated canonical website URLs.

Runs in GitHub Actions, uses only stdlib, and never modifies or crawls content.
GitHub Pages must have published the matching root verification key beforehand.
"""
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

HOST = "www.growspecbio.com"
ORIGIN = "https://" + HOST + "/"
KEY = "aec3026e4e3ee1d50f58eaf5e9d3c6d6"
VERIFY_URL = ORIGIN + KEY + ".txt"
API = "https://api.indexnow.org/indexnow"


def canonical_urls(xml_text: str) -> set[str]:
    root = ET.fromstring(xml_text)
    urls = set()
    for elem in root.findall(".//{http://www.sitemaps.org/schemas/sitemap/0.9}loc"):
        url = (elem.text or "").strip()
        if url.startswith(ORIGIN) and "?" not in url and "#" not in url:
            urls.add(url)
    return urls


def prior_sitemap() -> set[str]:
    result = subprocess.run(
        ["git", "show", "HEAD^:sitemap.xml"], capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        return set()
    try:
        return canonical_urls(result.stdout)
    except ET.ParseError:
        return set()


def changed_pages(allowlist: set[str]) -> list[str]:
    result = subprocess.run(
        ["git", "diff", "--name-only", "HEAD^", "HEAD"],
        capture_output=True, text=True, check=False,
    )
    if result.returncode != 0:
        return []
    paths = [line.strip() for line in result.stdout.splitlines()]
    urls = set()
    for path in paths:
        if path == "index.html":
            urls.add(ORIGIN)
        elif path.endswith("/index.html") and not path.startswith("."):
            urls.add(ORIGIN + path[:-len("index.html")])
    if "sitemap.xml" in paths:
        urls |= allowlist - prior_sitemap()
    if ".github/workflows/indexnow.yml" in paths and not urls:
        # Only on the initial workflow installation: publish all canonical URLs once.
        urls = allowlist.copy()
    if os.environ.get("GITHUB_EVENT_NAME") == "workflow_dispatch":
        urls = allowlist.copy()
    return sorted(urls & allowlist)


def main() -> int:
    keypath = Path(KEY + ".txt")
    if not keypath.is_file() or keypath.read_text(encoding="utf-8").strip() != KEY:
        print("IndexNow: wrong/missing root verification file", file=sys.stderr)
        return 1
    xml_text = Path("sitemap.xml").read_text(encoding="utf-8")
    allowlist = canonical_urls(xml_text)
    urls = changed_pages(allowlist)
    if not urls:
        print("IndexNow: no changed canonical HTML pages to notify.")
        return 0
    print(f"IndexNow: submitting {len(urls)} canonical URL(s) for {HOST}.")
    payload = json.dumps(
        {"host": HOST, "key": KEY, "keyLocation": VERIFY_URL, "urlList": urls}
    ).encode("utf-8")
    request = urllib.request.Request(
        API, data=payload, method="POST",
        headers={"Content-Type": "application/json; charset=utf-8", "User-Agent": "GROWSPEC-IndexNow/1.0"},
    )
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            status = response.status
    except urllib.error.HTTPError as exc:
        print(f"IndexNow API returned HTTP {exc.code}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"IndexNow network request failed: {type(exc).__name__}: {exc}", file=sys.stderr)
        return 1
    if status not in (200, 202):
        print(f"IndexNow unexpected status: HTTP {status}", file=sys.stderr)
        return 1
    print(f"IndexNow notified (HTTP {status}). This is discovery notification, not an indexing or ranking guarantee.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
