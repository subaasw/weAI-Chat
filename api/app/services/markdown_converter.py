from markitdown import MarkItDown

def convert_to_markdown(file: str):
    md = MarkItDown(enable_plugins=False)
    result = md.convert(file)

    return result.text_content
