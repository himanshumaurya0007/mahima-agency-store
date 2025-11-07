import os
import sys

# Ensure UTF-8 encoding for Windows terminals
sys.stdout.reconfigure(encoding='utf-8')

# Folders to exclude from the tree generation
EXCLUDE_DIRS = {'.git', 'node_modules'}

def generate_tree(directory, prefix="", output_file=None):
    """Recursively generates a tree structure for a given directory and saves it to a file."""
    try:
        entries = sorted(os.listdir(directory))
    except PermissionError:
        line = f"{prefix}[ACCESS DENIED] {directory}\n"
        print(line, end="")
        if output_file:
            output_file.write(line)
        return

    for index, entry in enumerate(entries):
        # Skip excluded directories
        if entry in EXCLUDE_DIRS:
            continue

        path = os.path.join(directory, entry)
        is_last = index == len(entries) - 1
        connector = "└── " if is_last else "├── "
        line = prefix + connector + entry + "\n"
        print(line, end="")
        if output_file:
            output_file.write(line)

        if os.path.isdir(path):
            new_prefix = prefix + ("    " if is_last else "│   ")
            generate_tree(path, new_prefix, output_file)

if _name_ == "_main_":
    project_dir = os.getcwd()
    output_file_path = os.path.join(project_dir, "tree_structure.txt")
    
    with open(output_file_path, "w", encoding="utf-8") as output_file:
        output_file.write(project_dir + "\n")
        print(project_dir)
        generate_tree(project_dir, output_file=output_file)
    
    print(f"\nProject structure saved to: {output_file_path}")