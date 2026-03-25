import os
import joblib
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.linear_model import LogisticRegression

#  bcz of directory error while loading model
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(BASE_DIR, "ml_severity_model.pkl")
VECTORIZER_PATH = os.path.join(BASE_DIR, "vectorizer.pkl")


def train_and_save_model():
    texts = [
        "sql injection user input",
        "cross site scripting xss",
        "hardcoded api key",
        "password stored plain text",
        "missing validation",
    ]

    labels = [
        "Critical",
        "High",
        "High",
        "Critical",
        "Medium",
    ]

    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(texts)

    model = LogisticRegression(max_iter=1000)
    model.fit(X, labels)

    joblib.dump(model, MODEL_PATH)
    joblib.dump(vectorizer, VECTORIZER_PATH)

    print(" ML model trained & saved")


def predict_severity(text: str) -> str:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)

    X_test = vectorizer.transform([text])
    return model.predict(X_test)[0]


# 👇 ONLY runs when file is executed directly
if __name__ == "__main__":
    train_and_save_model()
