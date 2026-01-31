# This model shows how data is stored in backend
# for each scan
from datetime import datetime

def build_scan_response(file_name: str, issues: list):
    return {
        "file_name": file_name,
        "language": file_name.split(".")[-1],
        "vulnerabilities": issues,
        "total_issues": len(issues),
        "summary": {
            "critical": sum(1 for i in issues if i["severity"] == "Critical"),
            "high": sum(1 for i in issues if i["severity"] == "High"),
            "medium": sum(1 for i in issues if i["severity"] == "Medium"),
            "low": sum(1 for i in issues if i["severity"] == "Low"),
        },
        "scan_date": datetime.utcnow()
    }
