import sys
from pypdf import PdfWriter

def compress(pdf_path):
    writer = PdfWriter(clone_from=pdf_path)
    for page in writer.pages:
        for img in page.images:
            try:
                img.replace(img.image, quality=50)
            except Exception as e:
                print(f"Error on image: {e}")
                pass
    for page in writer.pages:
        page.compress_content_streams()
    writer.write("compressed_out.pdf")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        compress(sys.argv[1])
