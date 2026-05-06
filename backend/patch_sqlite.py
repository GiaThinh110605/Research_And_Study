import os
import glob

v_dir = "alembic/versions"
for f in glob.glob(os.path.join(v_dir, "*.py")):
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    modified = False
    if "sa.text('now()')" in content:
        content = content.replace("sa.text('now()')", "sa.text('CURRENT_TIMESTAMP')")
        modified = True
    if "sa.text(\"now()\")" in content:
        content = content.replace("sa.text(\"now()\")", "sa.text('CURRENT_TIMESTAMP')")
        modified = True
        
    if modified:
        with open(f, "w", encoding="utf-8") as file:
            file.write(content)
        print(f"Patched {f}")
