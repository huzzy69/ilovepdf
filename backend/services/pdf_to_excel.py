import fitz
import pandas as pd
import tempfile
import os

def convert_pdf_to_excel(pdf_path: str) -> str:
    """
    Converts a PDF file to an Excel (xlsx) workbook by extracting tabular data.
    """
    doc = fitz.open(pdf_path)
    fd, output_path = tempfile.mkstemp(suffix=".xlsx")
    os.close(fd)
    
    writer = pd.ExcelWriter(output_path, engine='openpyxl')
    table_found = False
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        tables = page.find_tables()
        for i, table in enumerate(tables):
            table_found = True
            df = table.to_pandas()
            # Clean up completely empty rows/columns
            df = df.dropna(how='all')
            # Ensure sheet names conform to the 31-character Excel limit
            sheet_name = f"Page_{page_num+1}_Table_{i+1}"[:31]
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            
    if not table_found:
        # Fallback: Extract text content and write it row by row
        lines = []
        for page_num, page in enumerate(doc):
            lines.append(f"--- Page {page_num + 1} ---")
            lines.extend(page.get_text("text").split('\n'))
        df = pd.DataFrame(lines, columns=["Text Content"])
        df.to_excel(writer, sheet_name="Text Content", index=False)
        
    writer.close()
    doc.close()
    return output_path
