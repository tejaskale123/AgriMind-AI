#!/usr/bin/env python3
# ============================================================================
# PROJECT EXTRACTION UTILITY
# ============================================================================
# Purpose: Generate a comprehensive report of the entire codebase
# Output: Single text file containing:
#         1. Visual tree structure of project directories/files
#         2. Complete content of all user-selected files
#         3. Summary statistics
# Usage: python project_extraction.py
# Use Case: Code review, documentation, sharing codebase overview
# ============================================================================

"""
Extract project files with user-selected extensions and project structure
into a single text file.
"""

import os
import sys
from collections import Counter

IGNORE_DIRS = {
    ".git", "__pycache__", ".pytest_cache", "*.egg-info",
    ".venv", "venv", "env", ".csv", ".log",
    "build", ".dart_tool", ".idea", "android", "ios",
    "linux", "macos", "windows", "web"
}

BINARY_EXTENSIONS = {
    # Images
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".svg", ".ico", ".webp", ".tiff", ".tif", ".avif",
    # Models / checkpoints
    ".pt", ".pth", ".ckpt", ".bin", ".onnx", ".task",
    # Serialized data
    ".pkl", ".joblib", ".pickle",
    # Documents
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
    # Archives
    ".zip", ".tar", ".gz", ".bz2", ".7z", ".rar",
    # Audio / video
    ".mp3", ".mp4", ".wav", ".avi", ".mov", ".flac", ".m4a", ".ogg",
    # Compiled / object
    ".exe", ".dll", ".so", ".dylib", ".o", ".a", ".lib",
    # Databases / binary data
    ".db", ".sqlite", ".sqlite3", ".parquet", ".h5", ".hdf5",
    # Fonts
    ".ttf", ".otf", ".woff", ".woff2",
    # Bytecode
    ".pyc", ".pyo",
}


def get_project_structure(root_dir, prefix="", max_depth=10, current_depth=0, ignore_dirs=None):
    """
    Generate a text representation of the project structure.

    Creates a tree-style visualization of directories and files.
    Recursively traverses subdirectories while respecting depth limits.

    Args:
        root_dir: Starting directory path
        prefix: String prefix for tree indentation
        max_depth: Maximum recursion depth to prevent infinite loops
        current_depth: Current recursion level
        ignore_dirs: Set of directory names to skip

    Returns:
        String containing formatted directory tree
    """
    if ignore_dirs is None:
        ignore_dirs = {".git", "__pycache__", ".pytest_cache", "*.egg-info", ".venv", "venv", "env", ".csv", ".log"}

    if current_depth >= max_depth:
        return ""

    structure = ""
    try:
        items = sorted(os.listdir(root_dir))
    except PermissionError:
        return ""

    dirs = []
    files = []

    for item in items:
        # Skip hidden files/dirs and common ignore patterns
        if item.startswith("."):
            continue
        if item in ignore_dirs or any(item.endswith(x.replace("*", "")) for x in ignore_dirs if "*" in x):
            continue

        item_path = os.path.join(root_dir, item)
        if os.path.isdir(item_path):
            dirs.append(item)
        else:
            files.append(item)

    # Add files first
    for i, file in enumerate(files):
        is_last_file = (i == len(files) - 1) and len(dirs) == 0
        structure += f"{prefix}{'└── ' if is_last_file else '├── '}{file}\n"

    # Add directories
    for i, dir_name in enumerate(dirs):
        is_last = i == len(dirs) - 1
        structure += f"{prefix}{'└── ' if is_last else '├── '}{dir_name}/\n"

        dir_path = os.path.join(root_dir, dir_name)
        extension = "    " if is_last else "│   "
        structure += get_project_structure(dir_path, prefix + extension, max_depth, current_depth + 1, ignore_dirs)

    return structure


def discover_extensions(root_dir, ignore_dirs=None):
    """
    Scan the project and discover every unique file extension.

    Walks through the directory tree (skipping ignored directories)
    and counts how many files belong to each extension.

    Args:
        root_dir: Root directory to scan
        ignore_dirs: Set of directory names to skip

    Returns:
        Counter mapping extension (e.g. '.py') to file count
    """
    if ignore_dirs is None:
        ignore_dirs = IGNORE_DIRS

    ext_counter = Counter()

    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith(".")]

        for file in files:
            _, ext = os.path.splitext(file)
            if ext:
                ext_counter[ext.lower()] += 1

    return ext_counter


def prompt_extension_selection(ext_counter):
    """
    Display a numbered menu of extensions sorted by descending file count.

    Prompts the user to enter one or more numbers separated by commas,
    or 'all' to select every extension.  Validates input and repeats
    until a valid selection is made.

    Args:
        ext_counter: Counter mapping extension -> file count

    Returns:
        Set of selected extension strings (e.g. {'.py', '.json'})
    """
    sorted_exts = sorted(ext_counter.items(), key=lambda x: -x[1])
    sorted_exts = [(ext, count) for ext, count in sorted_exts if ext not in BINARY_EXTENSIONS]

    if not sorted_exts:
        print("\nNo text-based file extensions found in the project.")
        sys.exit(1)

    print("\nDiscovered file extensions:")
    print("-" * 40)
    for i, (ext, count) in enumerate(sorted_exts, 1):
        print(f"[{i}] {ext} ({count} files)")
    print()

    while True:
        choice = input("Enter numbers separated by commas (e.g. 1,4,5) or type 'all': ").strip()

        if choice.lower() == "all":
            return {ext for ext, _ in sorted_exts}

        try:
            indices = [int(x.strip()) for x in choice.split(",") if x.strip()]
            if not indices:
                print("No valid numbers entered. Please try again.")
                continue
            if any(i < 1 or i > len(sorted_exts) for i in indices):
                print(f"Invalid number(s). Please enter numbers between 1 and {len(sorted_exts)}.")
                continue
            return {sorted_exts[i - 1][0] for i in indices}
        except ValueError:
            print("Invalid input. Please enter numbers separated by commas or 'all'.")


def collect_files(root_dir, extensions, ignore_dirs=None):
    """
    Collect all files matching the given extensions from the project tree.

    Walks through the directory tree (skipping ignored directories)
    and returns a sorted list of absolute file paths whose extension
    is in the provided set.

    Args:
        root_dir: Root directory to scan
        extensions: Set of extension strings to collect (e.g. {'.py', '.json'})
        ignore_dirs: Set of directory names to skip

    Returns:
        Sorted list of matching file paths
    """
    if ignore_dirs is None:
        ignore_dirs = IGNORE_DIRS

    collected = []
    for root, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith(".")]

        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() in extensions:
                collected.append(os.path.join(root, file))

    collected.sort()
    return collected


def extract_project_files(root_dir, output_file, extensions):
    """
    Extract files with the given extensions and write a comprehensive report.

    Main extraction function that:
    1. Collects all files matching the selected extensions
    2. Generates project structure visualization
    3. Writes formatted output with all file contents
    4. Provides summary statistics

    Args:
        root_dir: Root directory to scan
        output_file: Path to output text file
        extensions: Set of extension strings to extract
    """
    extracted_files = collect_files(root_dir, extensions)
    ext_list = ", ".join(sorted(extensions))

    # Write to output file
    with open(output_file, "w", encoding="utf-8") as out:
        # Header
        out.write("=" * 80 + "\n")
        out.write("PROJECT EXTRACTION REPORT\n")
        out.write("=" * 80 + "\n\n")

        # Project Structure
        out.write("PROJECT STRUCTURE:\n")
        out.write("-" * 80 + "\n\n")
        out.write(f"{os.path.basename(root_dir)}/\n")
        out.write(get_project_structure(root_dir))
        out.write("\n\n")

        # File Contents
        out.write("=" * 80 + "\n")
        out.write(f"FILE CONTENTS ({ext_list})\n")
        out.write("=" * 80 + "\n\n")

        for file_path in extracted_files:
            # Calculate relative path
            rel_path = os.path.relpath(file_path, root_dir)

            # Write file header
            out.write(f"\n{'=' * 80}\n")
            out.write(f"FILE: {rel_path}\n")
            out.write(f"{'=' * 80}\n\n")

            _, ext = os.path.splitext(file_path)
            if ext.lower() in BINARY_EXTENSIONS:
                out.write(f"[BINARY FILE] Skipped content extraction ({ext})\n")
            else:
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                        out.write(content)
                except Exception as e:
                    out.write(f"[ERROR] Could not read file: {e!s}\n")

            out.write("\n")

        # Summary
        out.write("\n" + "=" * 80 + "\n")
        out.write(f"SUMMARY: {len(extracted_files)} files extracted ({ext_list})\n")
        out.write("=" * 80 + "\n")

    print("✓ Extraction complete!")
    print(f"✓ Total files extracted ({ext_list}): {len(extracted_files)}")
    print(f"✓ Output saved to: {output_file}")
    print(f"✓ File size: {os.path.getsize(output_file) / 1024:.2f} KB")


if __name__ == "__main__":
    # Get project root (current directory)
    project_root = os.getcwd()

    # Output file
    output_filename = "project_extraction.txt"
    output_path = os.path.join(project_root, output_filename)

    # Discover available extensions
    ext_counter = discover_extensions(project_root)

    if not ext_counter:
        print("No files with extensions found in the project.")
        sys.exit(1)

    # Let user select which extensions to extract
    selected_extensions = prompt_extension_selection(ext_counter)

    ext_list = ", ".join(sorted(selected_extensions))
    print(f"\nExtracting {ext_list} files from: {project_root}")
    print(f"Output file: {output_path}\n")

    extract_project_files(project_root, output_path, selected_extensions)