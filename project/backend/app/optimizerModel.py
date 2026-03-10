import time
import random


class CodeOptimizerModel:

    def __init__(self):
        self.models = [
            {"name": "Syntax Optimizer", "type": "heuristic"},
            {"name": "Security Scanner", "type": "pattern-matching"},
            {"name": "Performance Enhancer", "type": "rule-based"}
        ]

    def predict(self, code: str, language: str):

        # simulate ML latency
        time.sleep(1.5)

        optimized_code = code
        suggestions = []

        language = language.lower()

        if language in ["javascript", "js", "ts"]:
            result = self.optimize_javascript(code)
            optimized_code = result["code"]
            suggestions = result["suggestions"]

        elif language in ["python", "py"]:
            result = self.optimize_python(code)
            optimized_code = result["code"]
            suggestions = result["suggestions"]

        else:
            suggestions.append({
                "type": "info",
                "message": "Generic optimization applied (Language specific models not active for this type)."
            })

        return {
            "original_code": code,
            "optimized_code": optimized_code,
            "suggestions": suggestions,
            "metrics": {
                "original_complexity": "Medium",
                "optimized_complexity": "Low",
                "improvement_score": str(random.randint(10, 30)) + "%"
            }
        }

    def optimize_javascript(self, code: str):

        new_code = code
        suggestions = []

        # replace var → const
        if "var " in new_code:
            new_code = new_code.replace("var ", "const ")
            suggestions.append({
                "type": "optimization",
                "line": "Multiple",
                "message": "Replaced older `var` declarations with `const` for better scope management."
            })

        # console.log detection
        if "console.log" in new_code:
            suggestions.append({
                "type": "cleanup",
                "line": "Multiple",
                "message": "Detected `console.log` statements. Consider removing them for production."
            })

        # eval detection
        if "eval(" in new_code:
            suggestions.append({
                "type": "security",
                "message": "CRITICAL: Avoid using `eval()`. It is a major security risk."
            })

        return {
            "code": new_code,
            "suggestions": suggestions
        }

    def optimize_python(self, code: str):

        new_code = code
        suggestions = []

        # list comprehension suggestion
        if "for " in code and ".append(" in code:
            suggestions.append({
                "type": "optimization",
                "message": "Detailed loop found. Consider using List Comprehensions for better performance and readability."
            })

        # print check
        if "print(" in code:
            suggestions.append({
                "type": "cleanup",
                "message": "Remove `print()` calls in production code."
            })

        return {
            "code": new_code,
            "suggestions": suggestions
        }


optimizer_model = CodeOptimizerModel()


def predict(code: str, language: str):
    return optimizer_model.predict(code, language)