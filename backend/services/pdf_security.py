import os
import tempfile
from pypdf import PdfReader, PdfWriter
import pikepdf

def protect_pdf(pdf_path: str, password: str) -> str:
    reader = PdfReader(pdf_path)
    writer = PdfWriter()

    for page in reader.pages:
        writer.add_page(page)

    writer.encrypt(password)

    fd, output_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path

def unlock_pdf(pdf_path: str, password: str) -> str:
    reader = PdfReader(pdf_path)
    if reader.is_encrypted:
        success = reader.decrypt(password)
        if not success:
            raise ValueError("Incorrect password")

    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)

    fd, output_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)

    with open(output_path, "wb") as f:
        writer.write(f)

    return output_path

def force_unlock_pdf(pdf_path: str) -> str:
    try:
        pdf = pikepdf.open(pdf_path, allow_overwriting_input=False)
        fd, output_path = tempfile.mkstemp(suffix=".pdf")
        os.close(fd)
        pdf.save(output_path)
        pdf.close()
        return output_path
    except pikepdf.PasswordError:
        raise ValueError("This PDF requires a user password and cannot be unlocked without it.")
    except Exception as e:
        raise ValueError(f"Error unlocking PDF: {str(e)}")
