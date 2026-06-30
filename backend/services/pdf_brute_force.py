import os
import tempfile
from pypdf import PdfReader, PdfWriter
import itertools
import string

# Common passwords wordlist
COMMON_PASSWORDS = [
    "123456", "password", "123456789", "12345678", "12345", "1234567",
    "1234567890", "qwerty", "abc123", "111111", "123123", "admin",
    "letmein", "welcome", "monkey", "1234", "dragon", "master", "hello",
    "login", "pass", "test", "user", "guest", "root", "secret", "default",
    "password1", "password123", "pass123", "iloveyou", "sunshine",
    "football", "charlie", "shadow", "michael", "superman", "batman",
    "trustno1", "access", "696969", "mustang", "baseball", "soccer",
    "123321", "654321", "987654321", "000000", "999999", "12341234",
    "pdf", "pdf123", "pdfpassword", "adobe", "document", "secure",
    "protected", "locked", "open", "unlock", "owner", "mypassword",
    "passw0rd", "p@ssword", "p@ss123", "Pa$$w0rd", "Passw0rd",
    "Password", "Password1", "Admin123", "admin123", "Admin@123",
    "qwerty123", "Qwerty123", "Test@123", "Welcome1",
    "test123"
]


def _try_password(pdf_path: str, password: str) -> bool:
    try:
        reader = PdfReader(pdf_path)
        if not reader.is_encrypted:
            return False
        result = reader.decrypt(password)
        return result != 0
    except Exception:
        return False

def _write_unlocked(pdf_path: str, password: str, output_path: str):
    reader = PdfReader(pdf_path)
    reader.decrypt(password)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    with open(output_path, "wb") as f:
        writer.write(f)

def brute_force_unlock_pdf(pdf_path: str, max_attempts: int = 50000):
    attempts = 0

    # Phase 1: Common passwords
    for pwd in COMMON_PASSWORDS:
        if _try_password(pdf_path, pwd):
            fd, output_path = tempfile.mkstemp(suffix=".pdf")
            os.close(fd)
            _write_unlocked(pdf_path, pwd, output_path)
            return output_path, pwd
        attempts += 1

    # Phase 2: Numeric brute force (1-8 digits)
    for length in range(1, 9):
        for i in range(10 ** length):
            if attempts >= max_attempts:
                break
            pwd = str(i).zfill(length)
            if _try_password(pdf_path, pwd):
                fd, output_path = tempfile.mkstemp(suffix=".pdf")
                os.close(fd)
                _write_unlocked(pdf_path, pwd, output_path)
                return output_path, pwd
            attempts += 1

    # Phase 3: Simple lowercase letter combos up to 3 chars
    for length in range(1, 4):
        for combo in itertools.product(string.ascii_lowercase, repeat=length):
            if attempts >= max_attempts:
                break
            pwd = "".join(combo)
            if _try_password(pdf_path, pwd):
                fd, output_path = tempfile.mkstemp(suffix=".pdf")
                os.close(fd)
                _write_unlocked(pdf_path, pwd, output_path)
                return output_path, pwd
            attempts += 1

    raise ValueError(f"Password not found after {attempts} attempts. Password may be too complex.")
