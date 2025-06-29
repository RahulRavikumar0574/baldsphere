from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import re
import pandas as pd
from difflib import get_close_matches
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js integration

# Define path to the CSV file - UPDATE THIS PATH
CSV_PATH = "baldmanndataset.csv"

# Load data and clean words
try:
    df = pd.read_csv(CSV_PATH)
    df["word"] = df["word"].astype(str).str.lower().str.strip()
    base_words = df["word"].dropna().unique().tolist()
    print(f"Loaded {len(base_words)} words from dataset")
except Exception as e:
    print(f"Error loading CSV: {e}")
    base_words = []

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "words_loaded": len(base_words)})

@app.route("/normalize", methods=["POST"])
def normalize_word():
    """Normalize user input to closest matching word from dataset"""
    try:
        data = request.get_json()
        user_input = data.get("input", "").strip()
        
        if not user_input:
            return jsonify({"error": "No input provided"}), 400
        
        if not base_words:
            return jsonify({"error": "Dataset not loaded"}), 500

        # Step 1: Check if offensive
        safety_prompt = f"""
You are a content safety filter. Analyze the phrase: "{user_input}".

If it is offensive, profane, or inappropriate in any cultural, sexual, racial, or violent context, reply with only: "CENSORED".

If it is safe, reply only: "OK".
"""

        try:
            safety_result = subprocess.run(
                ["C:\\Users\\Rahul R\\AppData\\Local\\Programs\\Ollama\\ollama.exe", "run", "gemma3:latest"],
                input=safety_prompt.encode("utf-8"),
                capture_output=True,
                check=True,
                timeout=30  # 30 second timeout
            )
            safety_response = safety_result.stdout.decode("utf-8").strip().lower()

            if "censored" in safety_response:
                return jsonify({
                    "error": "Content flagged as inappropriate",
                    "original": user_input,
                    "normalized": None,
                    "brain_regions": None
                }), 400

        except subprocess.TimeoutExpired:
            return jsonify({"error": "Safety check timeout"}), 500
        except Exception as e:
            print(f"Safety check error: {e}")
            # Continue without safety check if Ollama is not available

        # Step 2: Run normalization
        prompt = f"""
You must and should pick one word from the list below that is closest in meaning to "{user_input}".

List: {", ".join(base_words)}

Reply with only one word from the list. No extra explanation.
"""

        try:
            result = subprocess.run(
                ["C:\\Users\\Rahul R\\AppData\\Local\\Programs\\Ollama\\ollama.exe", "run", "gemma3:latest"],
                input=prompt.encode("utf-8"),
                capture_output=True,
                check=True,
                timeout=30  # 30 second timeout
            )
            response = result.stdout.decode("utf-8").strip().lower()
            
            # Extract the matched word
            match = re.findall(r"\b(" + "|".join(re.escape(w) for w in base_words) + r")\b", response)
            
            if match:
                normalized = match[-1]  # Take the last match if multiple
            else:
                # Fallback to fuzzy matching
                close_matches = get_close_matches(response, base_words, n=1, cutoff=0.6)
                if close_matches:
                    normalized = close_matches[0]
                else:
                    # Final fallback to fuzzy matching with user input
                    close_matches = get_close_matches(user_input.lower(), base_words, n=1, cutoff=0.3)
                    normalized = close_matches[0] if close_matches else None

            if not normalized:
                return jsonify({
                    "error": "No suitable match found",
                    "original": user_input,
                    "normalized": None,
                    "brain_regions": None
                }), 404

            # Lookup brain region values
            row = df[df["word"] == normalized]
            if not row.empty:
                brain_regions = row.iloc[0][["Central", "Frontal", "Occipital", "Parietal", "Temporal"]].to_dict()
                # Convert to list of regions with value 1
                regions = [region for region, val in brain_regions.items() if val == 1]
                
                return jsonify({
                    "success": True,
                    "original": user_input,
                    "normalized": normalized,
                    "brain_regions": regions,
                    "confidence": "high" if match else "medium"
                })
            else:
                return jsonify({
                    "error": "Normalized word found but no brain data available",
                    "original": user_input,
                    "normalized": normalized,
                    "brain_regions": None
                }), 404

        except subprocess.TimeoutExpired:
            return jsonify({"error": "Normalization timeout"}), 500
        except Exception as e:
            return jsonify({"error": f"Normalization error: {str(e)}"}), 500

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500

@app.route("/words", methods=["GET"])
def get_words():
    """Get list of available words (for debugging)"""
    return jsonify({
        "words": base_words[:100],  # Return first 100 words
        "total_count": len(base_words)
    })

if __name__ == "__main__":
    print("Starting Ollama semantic matching service...")
    print(f"Loaded {len(base_words)} words from dataset")
    app.run(host="0.0.0.0", port=5000, debug=True)
