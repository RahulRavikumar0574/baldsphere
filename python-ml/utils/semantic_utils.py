from sentence_transformers import SentenceTransformer, util
import numpy as np
import torch

model = SentenceTransformer('all-MiniLM-L6-v2')

def embed(word):
    return model.encode(word, convert_to_tensor=True)

def embed_list(word_list):
    return model.encode(word_list, convert_to_tensor=True)

def find_best_among_variations(user_variants, dataset_words, dataset_embeddings):
    best_score = -1
    best_match = None

    for variant in user_variants:
        query_embedding = embed(variant)
        scores = util.pytorch_cos_sim(query_embedding, dataset_embeddings)[0]
        max_score = float(torch.max(scores))
        max_index = torch.argmax(scores)

        if max_score > best_score:
            best_score = max_score
            best_match = dataset_words[max_index]

    return best_match, best_score
