import os
import tempfile
import zipfile
import fitz  # PyMuPDF

def convert_pdf_to_jpg(pdf_path: str) -> str:
    """
    Converts each page of a PDF into a JPG and returns a ZIP file containing the images.
    """
    doc = fitz.open(pdf_path)
    temp_dir = tempfile.mkdtemp()
    
    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        pix = page.get_pixmap(dpi=150)
        img_path = os.path.join(temp_dir, f"page_{page_num + 1}.jpg")
        pix.save(img_path)
    
    fd, zip_path = tempfile.mkstemp(suffix=".zip")
    os.close(fd)
    
    with zipfile.ZipFile(zip_path, 'w') as zipf:
        for root, _, files in os.walk(temp_dir):
            for file in files:
                file_path = os.path.join(root, file)
                zipf.write(file_path, arcname=file)
                
    return zip_path
