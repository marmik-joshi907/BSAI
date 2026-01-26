# regular expression based code scanner for security vulnerabilities
import re

RULES = [
    {
        "type": "SQL Injection",
        "pattern": r"(SELECT|INSERT|UPDATE|DELETE).*['\"]",
        "severity": "High",
        "message": "Possible SQL Injection detected"
    },
    {
        "type": "Cross-Site Scripting (XSS)",
        "pattern": r"<script.*?>.*?</script>",
        "severity": "High",
        "message": "Possible XSS vulnerability detected"
    },
    {
        "type": "Hardcoded Secret",
        "pattern": r"(API_KEY|SECRET|PASSWORD)\s*=\s*['\"].+['\"]",
        "severity": "Medium",
        "message": "Hardcoded sensitive data detected"
    }
]

def scan_code(code: str):
    issues = []
    lines = code.split("\n")

    for line_no, line in enumerate(lines, start=1):
        for rule in RULES:
            if re.search(rule["pattern"], line, re.IGNORECASE):
                issues.append({
                    "type": rule["type"],
                    "severity": rule["severity"],
                    "line": line_no,
                    "message": rule["message"],
                    "code": line.strip()
                })

    return issues
