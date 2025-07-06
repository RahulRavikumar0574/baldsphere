from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from difflib import get_close_matches
import os
import requests
import json
from typing import Optional, Dict, List, Any
import time
from config import Config

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js integration

class OllamaClient:
    """Proper Ollama client using HTTP API"""
    
    def __init__(self, base_url: str = Config.OLLAMA_BASE_URL, timeout: int = Config.OLLAMA_TIMEOUT):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
    
    def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a request to Ollama API with proper error handling"""
        try:
            url = f"{self.base_url}{endpoint}"
            response = self.session.post(
                url,
                json=data,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.ConnectionError:
            raise Exception("Ollama service is not running. Please start Ollama first.")
        except requests.exceptions.Timeout:
            raise Exception("Request to Ollama timed out")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Ollama API error: {str(e)}")
    
    def generate(self, prompt: str, model: str = Config.OLLAMA_MODEL, stream: bool = False) -> str:
        """Generate text using Ollama"""
        data = {
            "model": model,
            "prompt": prompt,
            "stream": stream,
            "options": Config.get_generation_options()
        }
        
        try:
            result = self._make_request("/api/generate", data)
            return result.get("response", "").strip()
        except Exception as e:
            print(f"Ollama generation error: {e}")
            raise
    
    def health_check(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False

# Initialize Ollama client
ollama_client = OllamaClient()

# Load data and clean words
try:
    df = pd.read_csv(Config.CSV_PATH)
    df["word"] = df["word"].astype(str).str.lower().str.strip()
    base_words = df["word"].dropna().unique().tolist()
    print(f"Loaded {len(base_words)} words from dataset")
except Exception as e:
    print(f"Error loading CSV: {e}")
    base_words = []

@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    ollama_status = ollama_client.health_check()
    return jsonify({
        "status": "healthy" if ollama_status else "ollama_unavailable",
        "words_loaded": len(base_words),
        "ollama_available": ollama_status
    })

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

        # Check if Ollama is available
        if not ollama_client.health_check():
            return jsonify({
                "error": "Ollama service is not available. Please start Ollama first.",
                "original": user_input,
                "normalized": None,
                "brain_regions": None
            }), 503

        # Step 1: Content safety check
        safety_prompt = f"""You are a content safety filter. Analyze this phrase: "{user_input}"

If the phrase is offensive, profane, inappropriate, or contains harmful content in any context (cultural, sexual, racial, violent, etc.), respond with exactly: "CENSORED"

If the phrase is safe and appropriate, respond with exactly: "OK"

Response:"""

        try:
            safety_response = ollama_client.generate(safety_prompt)
            safety_response = safety_response.strip().lower()
            
            if "censored" in safety_response:
                return jsonify({
                    "error": "Content flagged as inappropriate",
                    "original": user_input,
                    "normalized": None,
                    "brain_regions": None
                }), 400

        except Exception as e:
            print(f"Safety check error: {e}")
            # Continue without safety check if Ollama fails

        # Step 2: Semantic normalization
        normalization_prompt = f"""You are a semantic matching system. Your task is to find the closest word from the provided list that matches the meaning of the input phrase.

Input phrase: "{user_input}"

Available words: {", ".join(base_words[:Config.MAX_WORDS_IN_PROMPT])}  # Limit for performance

Instructions:
1. Analyze the meaning of the input phrase
2. Find the word from the list that is most semantically similar
3. Respond with ONLY that word, nothing else
4. If no good match exists, respond with "NO_MATCH"

Response:"""

        try:
            normalized_response = ollama_client.generate(normalization_prompt)
            normalized_response = normalized_response.strip().lower()
            
            # Extract the matched word using regex
            import re
            match = re.findall(r"\b(" + "|".join(re.escape(w) for w in base_words) + r")\b", normalized_response)
            
            if match:
                normalized = match[-1]  # Take the last match if multiple
                confidence = "high"
            elif "no_match" in normalized_response:
                # Fallback to fuzzy matching with user input
                close_matches = get_close_matches(user_input.lower(), base_words, n=1, cutoff=Config.FUZZY_MATCH_CUTOFF)
                if close_matches:
                    normalized = close_matches[0]
                    confidence = "low"
                else:
                    return jsonify({
                        "error": "No suitable match found",
                        "original": user_input,
                        "normalized": None,
                        "brain_regions": None
                    }), 404
            else:
                # Try fuzzy matching with the response
                close_matches = get_close_matches(normalized_response, base_words, n=1, cutoff=0.6)
                if close_matches:
                    normalized = close_matches[0]
                    confidence = "medium"
                else:
                    # Final fallback
                    close_matches = get_close_matches(user_input.lower(), base_words, n=1, cutoff=Config.FUZZY_MATCH_CUTOFF)
                    normalized = close_matches[0] if close_matches else None
                    confidence = "low"

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
                    "confidence": confidence
                })
            else:
                return jsonify({
                    "error": "Normalized word found but no brain data available",
                    "original": user_input,
                    "normalized": normalized,
                    "brain_regions": None
                }), 404

        except Exception as e:
            print(f"Normalization error: {e}")
            # Fallback to fuzzy matching only
            close_matches = get_close_matches(user_input.lower(), base_words, n=1, cutoff=Config.FUZZY_MATCH_CUTOFF)
            if close_matches:
                normalized = close_matches[0]
                row = df[df["word"] == normalized]
                if not row.empty:
                    brain_regions = row.iloc[0][["Central", "Frontal", "Occipital", "Parietal", "Temporal"]].to_dict()
                    regions = [region for region, val in brain_regions.items() if val == 1]
                    
                    return jsonify({
                        "success": True,
                        "original": user_input,
                        "normalized": normalized,
                        "brain_regions": regions,
                        "confidence": "fallback"
                    })
            
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

@app.route("/ollama-status", methods=["GET"])
def ollama_status():
    """Check Ollama service status"""
    is_healthy = ollama_client.health_check()
    return jsonify({
        "ollama_available": is_healthy,
        "base_url": Config.OLLAMA_BASE_URL,
        "model": Config.OLLAMA_MODEL
    })

if __name__ == "__main__":
    print("Starting Ollama semantic matching service...")
    print(f"Loaded {len(base_words)} words from dataset")
    
    # Check Ollama availability on startup
    if ollama_client.health_check():
        print("✅ Ollama service is available")
    else:
        print("⚠️  Ollama service is not available. Please start Ollama first.")
        print(f"   Expected URL: {Config.OLLAMA_BASE_URL}")
    
    app.run(host=Config.FLASK_HOST, port=Config.FLASK_PORT, debug=Config.FLASK_DEBUG)
