import json
import os
from tqdm import tqdm
from models import get_embedding_model
from rag_chatbot import get_response
import prompts as prompts

BATCH_SIZE = 128
INPUT_FILE = "./json_files/data_compressed.json"
OUTPUT_FILE = "./embedded/data_embedded.json"
model = get_embedding_model()

with open(INPUT_FILE, "r", encoding="utf-8") as file:
    data = json.load(file)

items = data["items"]

def chunk_data(data, batch_size):
    for i in range(0, len(data), batch_size):
        yield data[i:i + batch_size]

def get_attribute(key: str, item):
    if key in item:
        return item[key]
    return ""

# Batch processing of items to create embeddings    
for batch in tqdm(chunk_data(items, BATCH_SIZE), total=len(items) // BATCH_SIZE, desc="Processing batches"):
    texts_for_embedding = [("title: " + get_attribute("title", item) +
                          "\n\n\nshortDescription: " + get_attribute("shortDescription", item) +
                          "\n\n\ndescription: " + get_attribute("description", item) +
                          "\n\n\nconditionDescription: " + get_attribute("conditionDescription", item) +
                          "\n\n\nlocalizedAspects: " + "\n".join(map(str, get_attribute("localizedAspects", item)))) for item in batch]

    embeddings = model.encode(texts_for_embedding)

    for item, embedding in zip(batch, embeddings):
        # Summarize the description using the LLM, may take some time
        # If you want to skip this step, you can use the commented line below and comment two lines below
        summarized_description = get_response(prompts.prompt_summarize.format(description=get_attribute("description", item)))
        item["summarizedLongerDescription"] = summarized_description

        # If you want to skip the summarization step, uncomment the line below  
        # item["summarizedLongerDescription"] = get_attribute("description", item)

        
        item["embedding"] = embedding.tolist()

# Create folder if it does not exist
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)


with open(OUTPUT_FILE, "w", encoding="utf-8") as file:
    json.dump(data, file, ensure_ascii=True, indent=2)
