from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.optimizerModel import predict

router = APIRouter()

class OptimizeRequest(BaseModel):
    code: str
    language: str = "javascript"


@router.post("/optimize")
async def optimize_code(request: OptimizeRequest):

    if not request.code:
        raise HTTPException(status_code=400, detail="No code provided")

    try:
        result = predict(request.code, request.language)

        return {
            "success": True,
            "data": result
        }

    except Exception as e:
        print("Optimization error:", e)
        raise HTTPException(status_code=500, detail="Optimization failed")