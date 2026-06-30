import os
import tempfile
import shutil
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from services.pdf_to_word import convert_pdf_to_word
from services.pdf_security import protect_pdf, unlock_pdf, force_unlock_pdf
from services.pdf_to_jpg import convert_pdf_to_jpg
from services.pdf_compress import compress_pdf
from services.pdf_to_excel import convert_pdf_to_excel
from services.excel_to_pdf import convert_excel_to_pdf
from services.pdf_ocr import perform_pdf_ocr
from services.pdf_brute_force import brute_force_unlock_pdf
from services.image_to_word import convert_image_to_word

router = APIRouter()

def cleanup_files(*file_paths):
    for path in file_paths:
        try:
            if os.path.exists(path):
                os.remove(path)
        except Exception:
            pass

@router.post("/convert/pdf-to-word")
async def pdf_to_word_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")

    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        docx_path = convert_pdf_to_word(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, docx_path)
        return FileResponse(path=docx_path, filename=f"{os.path.splitext(file.filename)[0]}.docx")
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

from pathlib import Path

@router.post("/security/protect")
async def protect_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...), password: str = Form(...)):
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        protected_path = protect_pdf(temp_pdf_path, password)
        
        # Save directly to user's Downloads folder
        downloads_dir = Path.home() / "Downloads"
        downloads_dir.mkdir(parents=True, exist_ok=True)
        final_filename = f"protected_{file.filename}"
        if not final_filename.lower().endswith(".pdf"):
            final_filename += ".pdf"
        dest_path = downloads_dir / final_filename
        
        shutil.copy(protected_path, dest_path)
        
        background_tasks.add_task(cleanup_files, temp_pdf_path, protected_path)
        return {"status": "success", "filename": final_filename, "path": str(dest_path)}
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/security/unlock")
async def unlock_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...), password: str = Form(...)):
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        unlocked_path = unlock_pdf(temp_pdf_path, password)
        background_tasks.add_task(cleanup_files, temp_pdf_path, unlocked_path)
        return FileResponse(path=unlocked_path, filename=f"unlocked_{file.filename}")
    except ValueError as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/security/force-unlock")
async def force_unlock_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        unlocked_path = force_unlock_pdf(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, unlocked_path)
        return FileResponse(path=unlocked_path, filename=f"unlocked_{file.filename}")
    except ValueError as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/security/brute-force-unlock")
async def brute_force_unlock_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        unlocked_path, found_password = brute_force_unlock_pdf(temp_pdf_path)
        
        # Save to Downloads folder
        downloads_dir = Path.home() / "Downloads"
        downloads_dir.mkdir(parents=True, exist_ok=True)
        final_filename = f"unlocked_{file.filename}"
        if not final_filename.lower().endswith(".pdf"):
            final_filename += ".pdf"
        dest_path = downloads_dir / final_filename
        shutil.copy(unlocked_path, dest_path)
        
        background_tasks.add_task(cleanup_files, temp_pdf_path, unlocked_path)
        return {
            "status": "success",
            "filename": final_filename,
            "found_password": found_password,
            "path": str(dest_path)
        }
    except ValueError as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/pdf-to-jpg")
async def pdf_to_jpg_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        zip_path = convert_pdf_to_jpg(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, zip_path)
        return FileResponse(path=zip_path, filename=f"{os.path.splitext(file.filename)[0]}_images.zip", media_type="application/zip")
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/compress")
async def compress_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        compressed_path = compress_pdf(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, compressed_path)
        return FileResponse(path=compressed_path, filename=f"compressed_{file.filename}")
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/pdf-to-excel")
async def pdf_to_excel_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        excel_path = convert_pdf_to_excel(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, excel_path)
        return FileResponse(path=excel_path, filename=f"{os.path.splitext(file.filename)[0]}.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/excel-to-pdf")
async def excel_to_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="File must be an Excel file (.xlsx or .xls)")
    fd, temp_excel_path = tempfile.mkstemp(suffix=".xlsx")
    os.close(fd)
    with open(temp_excel_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        pdf_path = convert_excel_to_pdf(temp_excel_path)
        background_tasks.add_task(cleanup_files, temp_excel_path, pdf_path)
        return FileResponse(path=pdf_path, filename=f"{os.path.splitext(file.filename)[0]}.pdf")
    except Exception as e:
        cleanup_files(temp_excel_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/ocr")
async def ocr_pdf_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="File must be a PDF")
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        ocr_pdf_path = perform_pdf_ocr(temp_pdf_path)
        background_tasks.add_task(cleanup_files, temp_pdf_path, ocr_pdf_path)
        return FileResponse(path=ocr_pdf_path, filename=f"ocr_{file.filename}")
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert/image-to-word")
async def image_to_word_api(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp")):
        raise HTTPException(status_code=400, detail="File must be a JPG, PNG, or WebP image")

    ext = os.path.splitext(file.filename)[1].lower()
    fd, temp_img_path = tempfile.mkstemp(suffix=ext)
    os.close(fd)
    with open(temp_img_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        docx_path = convert_image_to_word(temp_img_path)
        background_tasks.add_task(cleanup_files, temp_img_path, docx_path)
        return FileResponse(
            path=docx_path, 
            filename=f"{os.path.splitext(file.filename)[0]}.docx",
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
    except Exception as e:
        cleanup_files(temp_img_path)
        raise HTTPException(status_code=500, detail=str(e))

