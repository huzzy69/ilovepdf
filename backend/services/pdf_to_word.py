import os
import tempfile
from pdf2docx import Converter

def convert_pdf_to_word(pdf_path: str) -> str:
    """
    Converts a PDF file to a Word (docx) document.
    Returns the path to the converted docx file.
    """
    # Create a temporary file for the output
    fd, docx_path = tempfile.mkstemp(suffix=".docx")
    os.close(fd)
    
    cv = Converter(pdf_path)
    cv.convert(docx_path)      # all pages by default
    cv.close()
    
    return docx_path
