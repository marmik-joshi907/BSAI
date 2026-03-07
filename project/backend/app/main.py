from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.scan import router as scan_router
from app.routes.history import router as history_router
from app.routes.report import router as report_router
from app.routes.github import router as github_router
from app.routes.optimizerRoutes import router as optimizer_router




app = FastAPI(title="BugShield AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend access
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(report_router, prefix="/api")
app.include_router(github_router, prefix="/api")
app.include_router(optimizer_router, prefix="/api")

@app.get("/")
def root():
    return {"message": "BugShield AI Backend is running"}
