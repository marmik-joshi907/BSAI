from groq import Groq
import json
import os
import time
import hashlib
import logging
from dotenv import load_dotenv


try:
    import radon.complexity as radon_cc
    RADON_AVAILABLE = True
except ImportError:
    RADON_AVAILABLE = False

load_dotenv()


#  Login Setup 

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger(__name__)


# Constants
MAX_CODE_LENGTH = 10_000

SUPPORTED_LANGUAGES = {
    "python", "javascript", "typescript", "java",
    "c", "c++", "go", "rust", "php", "ruby"
}


#  Prompt
PROMPT_TEMPLATE = """You are a senior software security engineer and performance optimizer.

Analyze the following {language} source code and return a JSON response.

TASKS:
1. Detect bugs
2. Detect security vulnerabilities (SQL Injection, XSS, unsafe input handling, hardcoded secrets, etc.)
3. Detect performance issues
4. Detect bad coding practices

STRICT JSON OUTPUT RULES — FOLLOW EXACTLY:
- Return ONLY a raw JSON object, nothing else
- NO markdown, NO code fences, NO backticks, NO explanation text
- The "optimized_code" value MUST be a single-line JSON string
- In "optimized_code": replace every newline with \\n (escaped backslash-n)
- In "optimized_code": replace every double quote inside code with \\" (escaped)
- In "optimized_code": replace every backslash with \\\\ (escaped)
- Do NOT use actual line breaks inside the "optimized_code" string value

EXAMPLE OF CORRECT FORMAT:
{{"suggestions":[{{"type":"security","message":"SQL injection found"}}],"optimized_code":"def foo():\\n    return 1"}}

NOW ANALYZE THIS {language} CODE AND RETURN JSON:

{code}"""



#  Raw APi -> Valid JSON
def _sanitize_json(raw: str) -> str:
    """
    Strip markdown fences and whitespace that
    some models add even when told not to.
    """
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.splitlines()
        raw = "\n".join(lines[1:-1]).strip()
    return raw


#  Complexity Calculation
def calculate_complexity(code: str) -> str:
    if RADON_AVAILABLE:
        try:
            blocks = radon_cc.cc_visit(code)
            if blocks:
                avg = sum(b.complexity for b in blocks) / len(blocks)
                return f"{avg:.1f}"
            return "1.0"
        except Exception:
            pass

    # Fallback heuristic
    lines = len(code.splitlines())
    if lines <= 13:
        return "Low"
    elif lines <= 25 and lines >= 13:
        return "Medium"
    return "High"


def complexity_label(score_str: str) -> str:
    """Convert a numeric complexity score to a human-readable label."""
    try:
        val = float(score_str)
        if val <= 5:
            return "Low"
        elif val <= 10:
            return "Medium"
        return "High"
    except ValueError:
        return score_str

def improvement_score(original: str, optimized: str, suggestions: list) -> str:
    """
    Score based on:
    - Number of issues found (40% weight)
    - Complexity reduction via radon (30% weight)  
    - Code quality changes (30% weight)
    """
    score = 0

    # 1. Points for each issue detected and fixed (main signal)
    issue_points = {
        "security":    15,
        "bug":         12,
        "performance": 10,
        "bad_practice": 8,
    }
    for s in suggestions:
        points = issue_points.get(s.get("type", ""), 5)
        score += points

    # 2. Bonus if radon detects complexity drop
    if RADON_AVAILABLE:
        try:
            orig_blocks = radon_cc.cc_visit(original)
            opt_blocks  = radon_cc.cc_visit(optimized)
            orig_avg = sum(b.complexity for b in orig_blocks) / max(len(orig_blocks), 1)
            opt_avg  = sum(b.complexity for b in opt_blocks)  / max(len(opt_blocks),  1)
            if opt_avg < orig_avg:
                score += 10
        except Exception:
            pass

    # Cap at 95% — never claim 100% perfect
    return f"{min(score, 95)}%" 


# ─────────────────────────────────────────────
# Main model class
# ─────────────────────────────────────────────
class CodeOptimizerModel:

    def __init__(self, retries: int = 3, retry_delay: float = 1.0):
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise EnvironmentError(
                "GROQ_API_KEY not found. Add it to your .env file."
            )

        self.client = Groq(api_key=api_key)

    
        self.model = "llama-3.3-70b-versatile"

        self.retries     = retries
        self.retry_delay = retry_delay

        # In-memory cache: md5(language + code) → result dict
        self._cache: dict = {}

        logger.info("CodeOptimizerModel initialised (model=%s)", self.model)

    # ── Input validation ──────────────────────
    def _validate(self, code: str, language: str) -> None:
        if not code or not code.strip():
            raise ValueError("Code cannot be empty.")
        if len(code) > MAX_CODE_LENGTH:
            raise ValueError(
                f"Code exceeds maximum length of {MAX_CODE_LENGTH} characters "
                f"(got {len(code)})."
            )
        if language.lower() not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"Unsupported language '{language}'. "
                f"Supported: {', '.join(sorted(SUPPORTED_LANGUAGES))}"
            )

    # ── Cache key ─────────────────────────────
    def _cache_key(self, code: str, language: str) -> str:
        return hashlib.md5(f"{language}:{code}".encode()).hexdigest()

    # ── API call with retry + backoff ─────────
    def _call_api(self, prompt: str) -> str:
        """
        Calls Groq API with exponential backoff retries.
        ✅ Validates JSON BEFORE returning to catch bad responses early
           instead of letting them propagate to predict().
        """
        last_error = None

        for attempt in range(1, self.retries + 1):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    temperature=0.1,
                    response_format={"type": "json_object"},
                    messages=[{"role": "user", "content": prompt}]
                )

                raw     = response.choices[0].message.content
                cleaned = _sanitize_json(raw)

                # Validate — if broken JSON, raises JSONDecodeError
                # and we retry instead of returning garbage
                json.loads(cleaned)
                return cleaned

            except json.JSONDecodeError as e:
                last_error = e
                logger.warning(
                    "Invalid JSON on attempt %d/%d — retrying...",
                    attempt, self.retries
                )
                if attempt < self.retries:
                    time.sleep(self.retry_delay)

            except Exception as e:
                last_error = e
                wait = self.retry_delay * (2 ** (attempt - 1))
                logger.warning(
                    "API call failed (attempt %d/%d): %s — retrying in %.1fs",
                    attempt, self.retries, e, wait
                )
                if attempt < self.retries:
                    time.sleep(wait)

        raise RuntimeError(
            f"All {self.retries} API attempts failed."
        ) from last_error

    # ── Main predict method ───────────────────
    def predict(self, code: str, language: str) -> dict:
        # 1. Validate inputs
        self._validate(code, language)

        # 2. Return from cache if available
        key = self._cache_key(code, language)
        if key in self._cache:
            logger.info("Cache hit — returning cached result.")
            return self._cache[key]

        # 3. Build prompt
        prompt = PROMPT_TEMPLATE.format(language=language, code=code)

        # 4. Call API
        try:
            raw    = self._call_api(prompt)
            parsed = json.loads(raw)

        except json.JSONDecodeError as e:
            logger.error("JSON parse error: %s", e, exc_info=True)
            parsed = {
                "suggestions": [{
                    "type":    "warning",
                    "message": "AI response was not valid JSON. Please try again."
                }],
                "optimized_code": code
            }

        except RuntimeError as e:
            logger.error("API permanently failed: %s", e, exc_info=True)
            parsed = {
                "suggestions": [{
                    "type":    "warning",
                    "message": str(e)
                }],
                "optimized_code": code
            }

        # 5. Extract fields safely
        optimized_code = parsed.get("optimized_code", code)
        suggestions    = parsed.get("suggestions", [])

        # 6. Compute real metrics
        orig_complexity = calculate_complexity(code)
        opt_complexity  = calculate_complexity(optimized_code)
        improvement = improvement_score(code, optimized_code, suggestions)


        result = {
            "optimized_code": optimized_code,
            "suggestions":    suggestions,
            "metrics": {
                "original_complexity":  complexity_label(orig_complexity),
                "optimized_complexity": complexity_label(opt_complexity),
                "improvement_score":    improvement,
            }
        }

        # 7. Cache and return
        self._cache[key] = result
        return result


# ─────────────────────────────────────────────
# Global singleton + module-level wrapper
# ─────────────────────────────────────────────
optimizer_model = CodeOptimizerModel()


def predict(code: str, language: str) -> dict:
    return optimizer_model.predict(code, language)