from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
import torch
from nltk.stem import WordNetLemmatizer
from utils.semantic_utils import find_best_among_variations
import os

# Ensure offline mode for HF
os.environ["HF_HUB_OFFLINE"] = "1"

# Load data (same as app.py)
df = pd.read_csv('data/verb_brain_map.csv')
dataset_embeddings = np.load('models/dataset_embeddings.npy')
dataset_embeddings_tensor = torch.tensor(dataset_embeddings)
word_list = df['word'].tolist()
lemmatizer = WordNetLemmatizer()

FALLBACK_SYNONYMS = {
    "smooching": ["smooch", "kiss", "peck", "make out"],
    "punching": ["punch", "strike", "jab", "hit"],
    "hugging": ["hug", "embrace", "cuddle"],
}

def map_to_brain_regions(user_input):
    user_input = user_input.lower().strip()
    base = lemmatizer.lemmatize(user_input, pos='v')
    candidates = {user_input, base}
    # Expand with all synonyms if any candidate is in FALLBACK_SYNONYMS
    for cand in list(candidates):
        if cand in FALLBACK_SYNONYMS:
            candidates.update(FALLBACK_SYNONYMS[cand])
    matched_word, similarity = find_best_among_variations(
        candidates, word_list, dataset_embeddings_tensor
    )
    brain_row = df[df['word'] == matched_word].iloc[0].to_dict()
    brain_regions = {k: int(v) for k, v in brain_row.items() if k != 'word'}
    return matched_word, float(similarity), brain_regions

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    user_word = data.get('verb')
    if not user_word:
        return jsonify({'error': 'No verb provided'}), 400
    match, sim, regions = map_to_brain_regions(user_word)
    return jsonify({
        'input': user_word,
        'closest_match': match,
        'similarity': sim,
        'brain_regions': regions
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
