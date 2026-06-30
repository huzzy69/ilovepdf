from rapidocr_onnxruntime import RapidOCR
import fitz
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
import tempfile
import os

def perform_pdf_ocr(pdf_path: str) -> str:
    """
    Performs OCR on a PDF file page-by-page and returns a new searchable PDF of the extracted text.
    """
    doc = fitz.open(pdf_path)
    engine = RapidOCR()
    
    fd, output_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    pdf_doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    story = []
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'OCRTitle', 
        parent=styles['Heading2'], 
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=15
    )
    body_style = ParagraphStyle(
        'OCRBody',
        parent=styles['Normal'],
        fontSize=10,
        leading=14
    )
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        
        # 1. Render page to temporary PNG image
        pix = page.get_pixmap(dpi=150)
        temp_img_fd, temp_img_path = tempfile.mkstemp(suffix=".png")
        os.close(temp_img_fd)
        pix.save(temp_img_path)
        
        try:
            # 2. Run OCR using RapidOCR on image
            result, elapse = engine(temp_img_path)
            
            # Result is a list of lines: [ [ [x,y coordinates], text, confidence ], ... ]
            page_text = []
            if result:
                for line in result:
                    text_content = line[1]
                    page_text.append(text_content)
            
            # 3. Compile page content
            story.append(Paragraph(f"Page {page_num + 1} - OCR Extracted Text", title_style))
            story.append(Spacer(1, 10))
            
            if page_text:
                for paragraph_text in page_text:
                    story.append(Paragraph(paragraph_text, body_style))
                    story.append(Spacer(1, 4))
            else:
                story.append(Paragraph("[No text recognized on this page]", body_style))
                
            if page_num < len(doc) - 1:
                story.append(PageBreak())
                
        finally:
            try:
                if os.path.exists(temp_img_path):
                    os.remove(temp_img_path)
            except Exception:
                pass
                
    doc.close()
    pdf_doc.build(story)
    return output_path
