# regular expression based code scanner for security vulnerabilities
import re
from app.ml_model import predict_severity   # 🔹 ML IMPORT

RULES = [
    {
        "type": "SQL Injection",
        "pattern": r"(SELECT|INSERT|UPDATE|DELETE).*['\"]",
        "message": "Possible SQL Injection detected"
    },
    {
        "type": "Cross-Site Scripting (XSS)",
        "pattern": r"<script.*?>.*?</script>",
        "message": "Possible XSS vulnerability detected"
    },
    {
        "type": "Hardcoded Secret",
        "pattern": r"(API_KEY|SECRET|PASSWORD)\s*=\s*['\"].+['\"]",
        "message": "Hardcoded sensitive data detected"
    }
]

def scan_code(code: str):
    issues = []
    lines = code.split("\n")

    for line_no, line in enumerate(lines, start=1):
        for rule in RULES:
            if re.search(rule["pattern"], line, re.IGNORECASE):

                # 🔹 ML PREDICTS SEVERITY HERE
                predicted_severity = predict_severity(
                    f"{rule['type']} {line}"
                )

                issues.append({
                    "type": rule["type"],
                    "severity": predicted_severity,  # 🔥 ML USED
                    "line": line_no,
                    "message": rule["message"],
                    "code": line.strip()
                })

    return issues
