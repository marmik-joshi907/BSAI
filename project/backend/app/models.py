from datetime import datetime

def build_scan_response(file_name, issues):
    return {
        "file_name": file_name,
        "language": file_name.split(".")[-1],
        "issues": issues,
        "total_issues": len(issues),
        "scan_date": datetime.utcnow()
    }
