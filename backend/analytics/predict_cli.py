import json
import sys
from datetime import datetime

from predictive_availability import (
    best_slots_next_week,
    load_model,
    predict_availability,
    predict_overlap,
)

def main():
    try:
        if len(sys.argv) < 2:
            raise ValueError("Missing JSON payload argument.")

        payload = json.loads(sys.argv[1])
        action = payload.get("action")
        bundle = load_model()

        if action == "predict":
            dt = datetime.fromisoformat(payload["datetime"])
            prob = predict_availability(bundle, payload["user_id"], dt)
            result = {"user_id": payload["user_id"], "datetime": payload["datetime"], "free_probability": prob}

        elif action == "overlap":
            dt = datetime.fromisoformat(payload["datetime"])
            result = predict_overlap(bundle, payload["user_ids"], dt)
            result["datetime"] = payload["datetime"]

        elif action == "best_slots":
            top_n = payload.get("top_n", 5)
            result = {
                "user_ids": payload["user_ids"],
                "suggestions": best_slots_next_week(bundle, payload["user_ids"], top_n),
            }

        else:
            raise ValueError(f"Unknown action '{action}'")

        print(json.dumps(result))
        sys.exit(0)

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
