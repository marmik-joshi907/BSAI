from fastapi import APIRouter, UploadFile, File, HTTPException
from app.scanner import scan_code
from app.models import build_scan_response
from app.database import scan_collection

router = APIRouter()

@router.post("/scan/upload")
async def upload_and_scan(file: UploadFile = File(...)):
    allowed_ext = (".js", ".ts", ".jsx", ".py", ".php", ".html",".tsx")

    filename = file.filename or ""

    if not filename.lower().endswith(allowed_ext):
        raise HTTPException(status_code=400, detail="Unsupported file type")

    content = await file.read()
    code = content.decode("utf-8", errors="ignore")

    issues = scan_code(code)

    scan_result = build_scan_response(filename, issues)
    result = scan_collection.insert_one(scan_result)

    scan_result["_id"] = str(result.inserted_id)
    return scan_result