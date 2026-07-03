import os
import re

def fix_imports_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Match:
    # import {
    # import { PageLoader } from '...'
    
    pattern = re.compile(r'(import\s*\{\s*\n)(import\s*\{\s*PageLoader\s*\}\s*from\s*\'[^\']+\'\s*\n)', re.MULTILINE)
    
    if pattern.search(content):
        new_content = pattern.sub(r'\2\1', content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {filepath}")

def main():
    pages_dir = r"c:\Users\abhijitbhunia\OneDrive - virtualemployee P Ltd\Desktop\Learn\AiLearningManagement\frontend\src\pages"
    for root, dirs, files in os.walk(pages_dir):
        for file in files:
            if file.endswith('.tsx'):
                fix_imports_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
