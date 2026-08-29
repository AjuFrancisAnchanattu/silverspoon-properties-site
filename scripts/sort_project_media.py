#!/usr/bin/env python3
"""
Moves project media files referenced in content/projects/*.json into their
project's own images/projects/<id>/ folder, renaming them to match the
site's hero.jpg / gallery-NN.ext / floorplan-NN.ext / brochure.ext convention.

Decap's media_folder templating (e.g. "{{slug}}", "{{fields.id}}") has
proven unreliable on this repo: uploads land in a single shared pool
(images/projects/_uploads/) instead. This script runs after every push and
fixes that automatically, so nobody has to sort files by hand.

Any field value already pointing inside its own project's folder is left
untouched. Files that don't exist yet (e.g. "Coming soon" placeholder
paths for projects with no real photos yet) are skipped, not errors.
"""
import json
import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PROJECTS_DIR = REPO_ROOT / "content" / "projects"
IMAGES_ROOT = REPO_ROOT / "images" / "projects"


def normalize(path_str):
    return path_str.lstrip("/")


def claimed_numbers(dest_dir, prefix, refs):
    """Numbers already spoken for, whether or not the file exists yet —
    a dangling placeholder reference (e.g. gallery-01.jpg from before any
    real photo was uploaded) still reserves its number, otherwise a real
    new upload could be renamed to collide with it."""
    pattern = re.compile(rf"^{re.escape(prefix)}-(\d+)\.")
    used = set()
    if dest_dir.exists():
        for f in dest_dir.iterdir():
            m = pattern.match(f.name)
            if m:
                used.add(int(m.group(1)))
    for ref in refs:
        if not ref:
            continue
        m = pattern.match(Path(normalize(ref)).name)
        if m:
            used.add(int(m.group(1)))
    return used


def move_file(rel_path, dest_dir, new_stem):
    src = REPO_ROOT / normalize(rel_path)
    if not src.exists() or not src.is_file():
        return None  # placeholder path, nothing uploaded yet — skip
    dest_dir.mkdir(parents=True, exist_ok=True)
    new_name = f"{new_stem}{src.suffix.lower()}"
    dest = dest_dir / new_name
    src.rename(dest)
    return f"images/projects/{dest_dir.name}/{new_name}"


def already_placed(rel_path, project_id):
    return normalize(rel_path).startswith(f"images/projects/{project_id}/")


def process_project(json_path):
    project_id = json_path.stem
    dest_dir = IMAGES_ROOT / project_id
    data = json.loads(json_path.read_text())
    changed = False

    # Same source file can be picked for more than one field (e.g. the same
    # photo set as both hero and a gallery entry). Moving is destructive —
    # the second field to process it would find nothing left at the
    # original path. Track what's already been moved this run and reuse
    # the destination instead of trying to move an already-moved file.
    moved = {}

    def resolve(src, new_stem):
        key = normalize(src)
        if key in moved:
            return moved[key], False
        new_path = move_file(src, dest_dir, new_stem)
        if new_path:
            moved[key] = new_path
        return new_path, True

    hero = data.get("heroImage")
    if hero and not already_placed(hero, project_id):
        new_path, _ = resolve(hero, "hero")
        if new_path:
            data["heroImage"] = new_path
            changed = True

    gallery = data.get("gallery") or []
    gallery_refs = [item.get("src") if isinstance(item, dict) else item for item in gallery]
    used = claimed_numbers(dest_dir, "gallery", gallery_refs)
    next_num = (max(used) + 1) if used else 1
    for i, item in enumerate(gallery):
        is_dict = isinstance(item, dict)
        src = item.get("src") if is_dict else item
        if not src or already_placed(src, project_id):
            continue
        new_path, is_new = resolve(src, f"gallery-{next_num:02d}")
        if new_path:
            gallery[i] = {"src": new_path}
            changed = True
            if is_new:
                next_num += 1
        elif not is_dict:
            gallery[i] = {"src": src}
            changed = True
    if changed:
        data["gallery"] = gallery

    floor_plans = data.get("floorPlans") or []
    fp_refs = [item.get("image") if isinstance(item, dict) else None for item in floor_plans]
    used = claimed_numbers(dest_dir, "floorplan", fp_refs)
    next_num = (max(used) + 1) if used else 1
    for i, item in enumerate(floor_plans):
        img = item.get("image") if isinstance(item, dict) else None
        if not img or already_placed(img, project_id):
            continue
        new_path, is_new = resolve(img, f"floorplan-{next_num:02d}")
        if new_path:
            item["image"] = new_path
            changed = True
            if is_new:
                next_num += 1

    brochure = data.get("brochureUrl")
    if brochure and not already_placed(brochure, project_id):
        new_path, _ = resolve(brochure, "brochure")
        if new_path:
            data["brochureUrl"] = new_path
            changed = True

    if changed:
        json_path.write_text(json.dumps(data, indent=2) + "\n")
        print(f"Sorted media for {project_id}")
    return changed


def main():
    any_changed = False
    for json_path in sorted(PROJECTS_DIR.glob("*.json")):
        if process_project(json_path):
            any_changed = True
    if not any_changed:
        print("Nothing to sort.")


if __name__ == "__main__":
    main()
