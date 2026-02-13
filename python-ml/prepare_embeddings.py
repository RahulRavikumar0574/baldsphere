import pandas as pd
import numpy as np
import os
from utils.semantic_utils import embed_list

# Ensure 'models' directory exists
os.makedirs('models', exist_ok=True)

# Load dataset
df = pd.read_csv('data/verb_brain_map.csv')
words = df['word'].tolist()

# Compute embeddings
embeddings = embed_list(words).cpu().numpy()

# Save to disk
np.save('models/dataset_embeddings.npy', embeddings)

print("✅ Embeddings saved in 'models/'")