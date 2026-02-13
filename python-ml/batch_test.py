import os
os.environ["HF_HUB_OFFLINE"] = "1"

import pandas as pd
import numpy as np
import torch
from nltk.stem import WordNetLemmatizer
from utils.semantic_utils import find_best_among_variations

# Load dataset + model outputs
df = pd.read_csv('data/verb_brain_map.csv')
dataset_embeddings = np.load('models/dataset_embeddings.npy')
dataset_embeddings_tensor = torch.tensor(dataset_embeddings)

# Read word list directly from CSV
word_list = df['word'].tolist()

lemmatizer = WordNetLemmatizer()

# Optional fallback dictionary for better matching
FALLBACK_SYNONYMS = {
    "smooching": ["smooch", "kiss", "peck", "make out"],
    "punching": ["punch", "strike", "jab", "hit"],
    "hugging": ["hug", "embrace", "cuddle"],
    "scratching": ["scratch", "scrape"],
    "gazing": ["gaze", "look", "stare"],
    "staring": ["look", "gaze", "stare"]
}

def map_to_brain_regions(user_input):
    user_input = user_input.lower().strip()
    base = lemmatizer.lemmatize(user_input, pos='v')

    candidates = {user_input, base}
    if user_input in FALLBACK_SYNONYMS:
        candidates.update(FALLBACK_SYNONYMS[user_input])

    matched_word, similarity = find_best_among_variations(
        candidates, word_list, dataset_embeddings_tensor
    )

    brain_row = df[df['word'] == matched_word].iloc[0].to_dict()
    brain_regions = {k: int(v) for k, v in brain_row.items() if k != 'word'}
    return matched_word, similarity, brain_regions

def test_from_file(filepath):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    total = 0
    correct = 0
    for line in lines:
        if not line.strip() or line.startswith("//"):
            continue
        user_word, expected = line.strip().split(',')
        match, sim, _ = map_to_brain_regions(user_word)
        is_correct = (match == expected)
        print(f"Input: {user_word:12} | Expected: {expected:10} | Got: {match:10} | {'✅' if is_correct else '❌'} (Sim: {sim:.2f})")
        total += 1
        if is_correct:
            correct += 1
    print(f"\nAccuracy: {correct}/{total} ({(correct/total)*100:.1f}%)")

if __name__ == "__main__":
    test_from_file('test_verbs.txt')