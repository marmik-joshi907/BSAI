# For Git Repo Scanning

from fastapi import APIRouter

router = APIRouter()

@router.post("/scan/github")
def scan_github_repo(repo_url: str):
    return {
        "message": "GitHub scanning is planned for the next phase",
        "repo_url": repo_url,
        "status": "Not implemented yet"
    }