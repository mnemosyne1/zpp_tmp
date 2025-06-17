from rag_chatbot import conversation
from models import number_of_tokens
import prompts

print("Chatbot jest gotowy! Możesz zadawać pytania. Wpisz 'exit' aby zakończyć.")
chat_history = [{'role': 'system', 'content': prompts.prompt_standard}]
products_list = []

while True:
    user_input = input("Twoje pytanie: ")
    chat_history.append({'role': 'user', 'content': user_input})

    if user_input.lower() in ["exit", "quit", "stop"]:
        print("Zamykanie chatbota. Do zobaczenia!")
        break

    response, new_products = conversation(chat_history)
    print(new_products) # for debugging
    print("Chatbot:", response)

    chat_history.append({'role': 'assistant', 'content': response})
    products_list.extend(new_products)
