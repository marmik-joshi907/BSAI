#  This file is for Scanning the History of scans 

from fastapi import APIRouter
from app.database import  scan_collection
from fastapi import HTTPException
from bson import ObjectId

router = APIRouter()

@router.get("/history")
def get_scan_history():
    scans = []
    for scan in scan_collection.find().sort("scan_date", -1):
        scan["_id"] = str(scan["_id"])
        scans.append(scan)
    return scans


@router.get("/scans/{scan_id}")
def get_scan_by_id(scan_id: str):
    scan = scan_collection.find_one({"_id": ObjectId(scan_id)})
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan["_id"] = str(scan["_id"])
    return scan