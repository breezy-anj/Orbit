import json
import pickle
import warnings
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split

warnings.filterwarnings("ignore")

RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)

HOURS = list(range(8, 23))
DAYS = list(range(7))
WEEKS_OF_HISTORY = 10

def _base_free_probability(day_of_week, hour, persona):
    is_weekend = day_of_week >= 5
    if persona == "student_night_owl":
        if not is_weekend and 9 <= hour <= 16:
            return 0.15
        if not is_weekend and hour >= 19:
            return 0.75
        if is_weekend:
            return 0.85
        return 0.5
    if persona == "working_professional":
        if not is_weekend and 9 <= hour <= 18:
            return 0.10
        if not is_weekend and 19 <= hour <= 20:
            return 0.35
        if not is_weekend and hour > 20:
            return 0.6
        if is_weekend:
            return 0.7
        return 0.5
    if persona == "early_bird":
        if hour <= 10:
            return 0.7
        if 11 <= hour <= 17:
            return 0.2
        return 0.5
    return 0.45

def generate_synthetic_data(users=None, weeks=WEEKS_OF_HISTORY, noise=0.08):
    if users is None:
        users = {
            "rahul": "student_night_owl",
            "priya": "working_professional",
            "aman": "early_bird",
            "karan": "student_night_owl",
        }
    rows = []
    today = datetime.now().date()
    start_date = today - timedelta(weeks=weeks)
    for user_id, persona in users.items():
        current = start_date
        while current <= today:
            dow = current.weekday()
            for hour in HOURS:
                base_p = _base_free_probability(dow, hour, persona)
                p_free = np.clip(base_p + np.random.normal(0, noise), 0.02, 0.98)
                is_free = np.random.rand() < p_free
                rows.append(
                    {
                        "user_id": user_id,
                        "date": current,
                        "day_of_week": dow,
                        "hour": hour,
                        "is_weekend": int(dow >= 5),
                        "is_free": int(is_free),
                    }
                )
            current += timedelta(days=1)
    return pd.DataFrame(rows)

def build_features(df):
    df = df.sort_values(["user_id", "date"]).copy()
    slot_freq = (
        df.groupby(["user_id", "day_of_week", "hour"])["is_free"]
        .mean()
        .rename("historical_free_rate")
        .reset_index()
    )
    df = df.merge(slot_freq, on=["user_id", "day_of_week", "hour"], how="left")
    df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
    df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)
    return df

FEATURE_COLUMNS = [
    "day_of_week",
    "hour_sin",
    "hour_cos",
    "is_weekend",
    "historical_free_rate",
]

def train_model(df):
    df = build_features(df)
    X = df[FEATURE_COLUMNS]
    y = df["is_free"]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y
    )
    model = RandomForestClassifier(
        n_estimators=200, max_depth=8, random_state=RANDOM_SEED
    )
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    report = classification_report(y_test, y_pred, target_names=["busy", "free"])
    print(f"Test accuracy: {acc:.3f}\n")
    print(report)
    return model, df

def save_model(model, df, path="model.pkl"):
    lookup = (
        df[["user_id", "day_of_week", "hour", "historical_free_rate"]]
        .drop_duplicates()
        .set_index(["user_id", "day_of_week", "hour"])["historical_free_rate"]
        .to_dict()
    )
    with open(path, "wb") as f:
        pickle.dump({"model": model, "lookup": lookup}, f)
    print(f"Saved model + lookup table to {path}")

def load_model(path="model.pkl"):
    with open(path, "rb") as f:
        return pickle.load(f)

def _slot_features(day_of_week, hour, is_weekend, historical_free_rate):
    return pd.DataFrame(
        [
            {
                "day_of_week": day_of_week,
                "hour_sin": np.sin(2 * np.pi * hour / 24),
                "hour_cos": np.cos(2 * np.pi * hour / 24),
                "is_weekend": is_weekend,
                "historical_free_rate": historical_free_rate,
            }
        ]
    )

def predict_availability(bundle, user_id, target_datetime):
    model = bundle["model"]
    lookup = bundle["lookup"]
    dow = target_datetime.weekday()
    hour = target_datetime.hour
    is_weekend = int(dow >= 5)
    hist_rate = lookup.get((user_id, dow, hour), 0.5)
    X = _slot_features(dow, hour, is_weekend, hist_rate)
    proba_free = model.predict_proba(X)[0][1]
    return round(float(proba_free), 3)

def predict_overlap(bundle, user_ids, target_datetime):
    probs = {
        uid: predict_availability(bundle, uid, target_datetime) for uid in user_ids
    }
    joint = 1.0
    for p in probs.values():
        joint *= p
    return {"individual": probs, "joint_free_probability": round(joint, 3)}

def best_slots_next_week(bundle, user_ids, top_n=5):
    results = []
    today = datetime.now().date()
    for day_offset in range(7):
        date = today + timedelta(days=day_offset)
        for hour in HOURS:
            dt = datetime(date.year, date.month, date.day, hour)
            r = predict_overlap(bundle, user_ids, dt)
            results.append(
                {
                    "datetime": dt.isoformat(),
                    "joint_free_probability": r["joint_free_probability"],
                }
            )
    results.sort(key=lambda r: r["joint_free_probability"], reverse=True)
    return results[:top_n]

def main():
    raw_df = generate_synthetic_data()
    model, feat_df = train_model(raw_df)
    save_model(model, feat_df)
    bundle = load_model()
    next_saturday = datetime.now() + timedelta(
        days=(5 - datetime.now().weekday()) % 7 + 1
    )
    next_saturday_6pm = next_saturday.replace(
        hour=18, minute=0, second=0, microsecond=0
    )
    p = predict_availability(bundle, "rahul", next_saturday_6pm)
    overlap = predict_overlap(bundle, ["rahul", "priya", "aman"], next_saturday_6pm)

if __name__ == "__main__":
    main()
