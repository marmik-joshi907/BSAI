# Demo Repo to Check:-
# https://github.com/pallets/flask
import os
import shutil
import uuid
import stat
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from git import Repo

from app.scanner import scan_code
from app.models import build_scan_response
from app.database import scan_collection

router = APIRouter()

SUPPORTED_EXTENSIONS = (".py", ".js", ".ts", ".jsx", ".php", ".html",".tsx")

class GitHubScanRequest(BaseModel):
    repo_url: str


def force_delete(func, path, exc_info):
    os.chmod(path, stat.S_IWRITE)
    func(path)


@router.post("/scan/github")
def scan_github_repo(data: GitHubScanRequest):
    repo_url = data.repo_url
    temp_dir = f"temp_repo_{uuid.uuid4()}"

    try:
        # 1️⃣ Clone repository
        Repo.clone_from(repo_url, temp_dir)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or private GitHub repository")

    all_issues = []
    total_files = 0

    try:
        # 2️⃣ Walk through repository files
        for root, _, files in os.walk(temp_dir):
            for file in files:
                if file.lower().endswith(SUPPORTED_EXTENSIONS):
                    total_files += 1
                    file_path = os.path.join(root, file)

                    try:
                        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                            code = f.read()

                        issues = scan_code(code)

                        for issue in issues:
                            issue["file"] = file
                            all_issues.append(issue)

                    except Exception:
                        continue

        # 3️⃣ Build structured response
        scan_result = build_scan_response(
            file_name=repo_url.split("/")[-1],
            issues=all_issues
        )

        scan_result["totalFiles"] = total_files
        scan_result["source"] = "github"

        # 4️⃣ Calculate risk score
        scan_result["summary"]["riskScore"] = (
            scan_result["summary"]["critical"] * 25 +
            scan_result["summary"]["high"] * 15 +
            scan_result["summary"]["medium"] * 8 +
            scan_result["summary"]["low"] * 3
        )

        # 5️⃣ Save to MongoDB
        result = scan_collection.insert_one(scan_result)
        scan_result["_id"] = str(result.inserted_id)

        return scan_result

    finally:
        # 6️⃣ Windows-safe cleanup
        if os.path.exists(temp_dir):
            time.sleep(1)
            shutil.rmtree(temp_dir, onerror=force_delete)
