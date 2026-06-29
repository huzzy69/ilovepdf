import os
import tempfile
import shutil
from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.responses import FileResponse
from services.pdf_to_word import convert_pdf_to_word

router = APIRouter()

def cleanup_files(*file_paths):
    """Utility to clean up temporary files after response is sent."""
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

    # Save the uploaded file to a temporary location
    fd, temp_pdf_path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    
    with open(temp_pdf_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Convert using our service
        docx_path = convert_pdf_to_word(temp_pdf_path)
        
        # Schedule cleanup of both the input PDF and output DOCX after the response is sent
        background_tasks.add_task(cleanup_files, temp_pdf_path, docx_path)
        
        return FileResponse(
            path=docx_path, 
            filename=f"{os.path.splitext(file.filename)[0]}.docx",
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except Exception as e:
        cleanup_files(temp_pdf_path)
        raise HTTPException(status_code=500, detail=str(e))
