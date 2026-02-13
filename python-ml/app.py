import os
os.environ["HF_HUB_OFFLINE"] = "1"

import pandas as pd
import numpy as np
import torch
from nltk.stem import WordNetLemmatizer
from utils.semantic_utils import find_best_among_variations

# Load data
df = pd.read_csv('verb_brain_map.csv')
dataset_embeddings = np.load('models/dataset_embeddings.npy')
dataset_embeddings_tensor = torch.tensor(dataset_embeddings)

# Read word list directly from CSV
word_list = df['word'].tolist()

lemmatizer = WordNetLemmatizer()

# Optional fallback dictionary for tricky informal verbs
FALLBACK_SYNONYMS = {
    "smooching": ["smooch", "kiss", "peck", "make out"],
    "punching": ["punch", "strike", "jab", "hit"],
    "hugging": ["hug", "embrace", "cuddle"],
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

if __name__ == "__main__":
    import nltk
    nltk.download('wordnet')
    nltk.download('omw-1.4')

    user_word = input("Enter a verb: ")
    match, sim, regions = map_to_brain_regions(user_word)

    print(f"\nClosest matched verb: {match} (Similarity: {sim:.2f})")
    print("Brain regions activated:")
    for region, val in regions.items():
        print(f"  {region}: {'Yes' if val else 'No'}")