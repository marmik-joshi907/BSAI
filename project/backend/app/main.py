from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# from routes.scan import router as scan_router
from app.routes.scan import router as scan_router

app = FastAPI(title="BugShield AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend access
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, prefix="/api")
