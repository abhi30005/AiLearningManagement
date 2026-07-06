import ast

with open('fixed_new_state_store.py') as f:
    fixed_src = f.read()

with open('skeleton.py') as f:
    skel_src = f.read()

fixed_tree = ast.parse(fixed_src)
skel_tree = ast.parse(skel_src)

fixed_funcs = {node.name for node in ast.walk(fixed_tree) if isinstance(node, ast.FunctionDef)}
skel_funcs = {node.name for node in ast.walk(skel_tree) if isinstance(node, ast.FunctionDef)}

missing = skel_funcs - fixed_funcs

out = [fixed_src, "\n# ---- AUTO-GENERATED MISSING FUNCTIONS ----\n"]

for node in ast.walk(skel_tree):
    if isinstance(node, ast.FunctionDef) and node.name in missing:
        args = ast.unparse(node.args)
        returns = ast.unparse(node.returns) if node.returns else 'Any'
        sig = f"def {node.name}({args}) -> {returns}:"
        out.append(sig)
        out.append(f"    # TODO: Implement missing {node.name}")
        out.append("    return None\n")

with open('state_store.py', 'w') as f:
    f.write("\n".join(out))
