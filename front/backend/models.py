from sentence_transformers import SentenceTransformer
from transformers import AutoTokenizer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
# MODEL_NAME = "mixedbread-ai/mxbai-embed-large-v1" Lepszy model, ale za słaby na mój laptop.

LLM_MODEL = "llama3.1"

options = {
    'frequency_penalty': 1.3,
    'temperature': 0.2,
    'top_p': 0.5,
    'presence_pentalty': 0.1
}

tokenizer = AutoTokenizer.from_pretrained("NousResearch/Llama-2-7b-hf")

def get_embedding_model():
    return SentenceTransformer(MODEL_NAME, device="cuda")

def number_of_tokens(prompt):
    return len(tokenizer.encode(prompt))
