#  Download the reports
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from bson import ObjectId
import json
import os

from app.database import scan_collection

router = APIRouter()
REPORT_DIR = "reports"

os.makedirs(REPORT_DIR, exist_ok=True)

@router.get("/report/{scan_id}")
def download_report(scan_id: str):
    scan = scan_collection.find_one({"_id": ObjectId(scan_id)})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan["_id"] = str(scan["_id"])
    file_path = f"{REPORT_DIR}/{scan_id}.json"

    with open(file_path, "w") as f:
        json.dump(scan, f, indent=4, default=str)

    return FileResponse(
        path=file_path,
        filename=f"BugShield_Report_{scan_id}.json",
           media_type="application/json"
    )
