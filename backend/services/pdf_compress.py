import tempfile
import os
import fitz
from pypdf import PdfWriter

def compress_pdf(pdf_path: str) -> str:
    """
    Compresses a PDF file using pypdf to compress images,
    falling back to PyMuPDF optimization features if needed.
    Returns the path to the compressed PDF file.
    """
    fd, output_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    try:
        writer = PdfWriter(clone_from=pdf_path)
        
        # Try to compress images
        for page in writer.pages:
            for img in page.images:
                try:
                    # Reduce quality to 50 for lossy compression
                    img.replace(img.image, quality=50)
                except Exception:
                    pass
                    
        # Compress streams
        for page in writer.pages:
            try:
                page.compress_content_streams()
            except Exception:
                pass
                
        with open(output_path, "wb") as f:
            writer.write(f)
            
        return output_path
    except Exception as e:
        # Fallback to PyMuPDF
        print(f"pypdf compression failed: {e}")
        doc = fitz.open(pdf_path)
        doc.save(output_path, 
                 garbage=4, 
                 deflate=True, 
                 clean=True)
        
        doc.close()
        return output_path
