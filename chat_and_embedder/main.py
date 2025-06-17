from rag_chatbot import conversation
from models import number_of_tokens
import prompts

print("Chatbot jest gotowy! Możesz zadawać pytania. Wpisz 'exit' aby zakończyć.")
chat_history = [{'role': 'system', 'content': prompts.prompt_standard}] # It stores dictionaries, where the first element is system prompt.
# It stores dictionary: itemId -> (title, itemWebUrl).
# To get proper order, just do: for item_id, (title, link) in products_list1.items().
products_list1 = {}
# It stores itemId. To get ids in proper order, just do: for el, _ in products_list2.
products_list2 = {}

def add_list_to_dict(d, l):
    for (itemId, title, itemWebUrl) in l:
        if itemId not in d:
            d[itemId] = None

def add_list_to_dict_triple(d, l):
    for (itemId, title, itemWebUrl) in l:
        if itemId not in d:
            d[itemId] = (title, itemWebUrl)

while True:
    user_input = input("Twoje pytanie: ")
    chat_history.append({'role': 'user', 'content': user_input})

    if user_input.lower() in ["exit", "quit", "stop"]:
        print("Zamykanie chatbota. Do zobaczenia!")
        break

    response, new_products = conversation(chat_history) # new_products is a list, for now having triples.
    # print(new_products) # for debugging
    print("Chatbot:", response)

    chat_history.append({'role': 'assistant', 'content': response})
    add_list_to_dict_triple(products_list1, new_products)
    add_list_to_dict(products_list2, new_products)
    # If you want to print the dictionaries, uncomment the lines below:
    # print(f"First dictionary: {products_list1}")
    # print(f"Second dictionary: {products_list2}")
