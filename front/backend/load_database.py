import json
import requests
from tqdm import tqdm


VESPA_URL = "http://localhost:8080/document/v1/items/items/docid/"

with open("./embedded/data_embedded.json", "r", encoding="utf-8") as file:
    data = json.load(file)

items = data["items"]

for item in tqdm(items, total=len(items), desc="Processing items"):
    item_id = item["itemId"]
    item_to_send = { "fields": item }
    response = requests.post(f"{VESPA_URL}{item_id}", json=item_to_send)
    if response.status_code != 200:
        print(item)
        print(f"Error: {response.status_code}, {response.text}")
        break
    
