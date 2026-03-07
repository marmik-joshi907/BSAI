from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.database import scan_collection

router = APIRouter()

#  1. STATIC ROUTE FIRST
@router.get("/scans/history")
def get_scan_history():
    scans = list(scan_collection.find().sort("scan_date", -1))

    for scan in scans:
        scan["_id"] = str(scan["_id"])

    return scans


#  2. DYNAMIC ROUTE SECOND
@router.get("/scans/{scan_id}")
def get_scan_by_id(scan_id: str):
    if not ObjectId.is_valid(scan_id):
        raise HTTPException(status_code=400, detail="Invalid scan ID")

    scan = scan_collection.find_one({"_id": ObjectId(scan_id)})

    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    scan["_id"] = str(scan["_id"])
    return scan
