import zipfile
import xml.etree.ElementTree as ET
import sys

def read_docx(path):
    try:
        with zipfile.ZipFile(path) as zf:
            xml_content = zf.read('word/document.xml')
        tree = ET.fromstring(xml_content)
        ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
        text = []
        for p in tree.findall('.//w:p', ns):
            texts = [node.text for node in p.findall('.//w:t', ns) if node.text]
            if texts:
                text.append(''.join(texts))
        return '\n'.join(text)
    except Exception as e:
        return f"Error reading {path}: {e}"

if __name__ == '__main__':
    for arg in sys.argv[1:]:
        print(f"\n--- Content of {arg} ---\n")
        print(read_docx(arg))
