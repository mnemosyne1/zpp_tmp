from models import get_embedding_model, LLM_MODEL, options, number_of_tokens
import prompts
import requests
import ollama
import json
from pydantic import BaseModel
from enum import Enum

embed_model = get_embedding_model()
VESPA_URL = "http://localhost:8080/search/"

# Określenie ranking profile do zapytań
ranking_profile = "vector_rank" # tylko dopasowane do embeddingu
# ranking_profile = "vector_with_price" # embedding + cena


class Query(BaseModel):
    query: str
    max_price: float | None = None

class YesNo(str, Enum):
    yes = "YES"
    no = "NO"

class YesNoAnswer(BaseModel):
    answer: YesNo

class AnswerWithProducts(BaseModel):
    response: str
    product_numbers: list[int]

model_query_json = Query.model_json_schema()
model_yesno_answer = YesNoAnswer.model_json_schema()
model_answer_with_products = AnswerWithProducts.model_json_schema()


def get_attribute(item, attribute):
    if attribute in item:
        return item[attribute]
    else:
        return ""

def generate_context_and_products_list(context):
    result = ""
    with open("context.json", "w", encoding="utf-8") as file: # for debugging
        json.dump(context, file, ensure_ascii=True, indent=2)
    # TODO This loop should be replaced in future by preprocessing data from eBay.
    for item in context["root"]["children"]:
        short_description = ollama.generate(
            model=LLM_MODEL,
            prompt=prompts.prompt_summarize.format(description=get_attribute(item["fields"], "description"))
        )['response']
        item["fields"]["description"] = short_description
    real_context = context["root"]["children"]
    for i, item in enumerate(real_context):
        info = json.dumps(item["fields"], indent=2) + "\n\n"
        result += f"Product {i+1}, relevance: {item['relevance']}\n"
        result += info
    return result

def get_yql_query(query_embedding, price=None):
    if price is None:
        return {
            "yql": "SELECT * FROM items WHERE {targetHits: 100}nearestNeighbor(embedding, query_embedding)",
            "hits": 5,
            "input": {
            "query(query_embedding)": query_embedding.tolist()
            },


            "ranking.profile": ranking_profile,
            "ignoreFields": ["embedding"],

        }
    else:
        return {
        "yql": f"SELECT * FROM items WHERE {{targetHits: 100}}nearestNeighbor(embedding, query_embedding) AND price <= {price}",
        "hits": 5,
        "input": {
            "query(query_embedding)": query_embedding.tolist()
        },


        "ranking.profile": ranking_profile,
        "ignoreFields": ["embedding"],

        }

def set_system_prompt(chat_history, sysprompt):
    chat_history[0]['content'] = sysprompt

def get_response(prompt, format_=''):
    #print(f"Length of prompt (consists of chat history): {number_of_tokens(prompt)}\n")
    #print(prompt)
    response = ollama.generate(
        model=LLM_MODEL,
        prompt=prompt,
        options=options,
        format=format_
    )['response']
    return response

def get_chat(prompt, chat_history, format_=''):
    set_system_prompt(chat_history, prompt)
    #print(f"Length of chat history: {number_of_tokens(str(chat_history))}\n")
    #print(chat_history)
    response = ollama.chat(
        model=LLM_MODEL,
        options=options,
        messages=chat_history,
        format=format_
    )['message']['content']
    return response

def ask_about_details(products_list, chat_history):
    return get_chat(prompts.prompt_tell_details.format(products_list=products_list), chat_history)

def conversation(chat_history):
    query_price = get_response(prompts.prompt_generate_query.format(chat_history=chat_history), model_query_json)
    query_price = Query.model_validate_json(query_price)
    user_query = query_price.query
    max_price = query_price.max_price
    if max_price is not None and max_price <= 0:
        max_price = None
    query_embedding = embed_model.encode(user_query)

    #print(f"Generated query: {user_query}\n")
    #print(f"Max Price: {max_price}\n")

    response = requests.post(VESPA_URL, json=get_yql_query(query_embedding, max_price))
    if response.status_code != 200:
        print(f"Error: {response.status_code}, {response.text}")
    context = response.json()
    pretty_context = generate_context_and_products_list(context)
#    print(f"Context: {pretty_context}")

#    print(f"Prompt: {prompts.prompt_answer_template.format(context=pretty_context)}")
    bot_response = get_chat(prompts.prompt_answer_template.format(context=pretty_context), chat_history)
    new_products = []
    for item in context["root"]["children"]:
        new_products.append(item)
    #bot_response_products = get_chat(prompts.prompt_answer_template.format(context=pretty_context), chat_history, model_answer_with_products)
    #bot_response_products = AnswerWithProducts.model_validate_json(bot_response_products)
    #bot_response = bot_response_products.response

    #products_list = bot_response_products.product_numbers
    #new_products = []
    #for i, item in enumerate(context["root"]["children"], start=1):
    #    if i in products_list:
    #        new_products.append(item)


    set_system_prompt(chat_history, prompts.prompt_standard)

    """
    To jest poprzednia wersja z wykorzystaniem LLM do decydowania czy wyszukiwanie jest potrzebne.
    
    search = get_response(prompts.prompt_do_search.format(chat_history=chat_history), model_yesno_answer)
    search = YesNoAnswer.model_validate_json(search).answer.value
    if search == "NO":
        print("LLM decided that no search is needed.\n\n")
        print(f"Products list: {products_list}\n\n")
        bot_response = get_chat(prompts.prompt_continue_conv.format(products_list=products_list), chat_history)
    else:
        print("LLM decided that search is needed.\n\n")
        query_price = get_response(prompts.prompt_generate_query.format(chat_history=chat_history), model_query_json)
        query_price = Query.model_validate_json(query_price)
        user_query = query_price.query
        max_price = query_price.max_price
        query_embedding = embed_model.encode(user_query)

        print(f"Generated query: {user_query}\n")
        print(f"Max Price: {max_price}\n")

        response = requests.post(VESPA_URL, json=get_yql_query(query_embedding, max_price))
        if response.status_code != 200:
            print(f"Error: {response.status_code}, {response.text}")
        context = response.json()
        pretty_context = generate_context_and_products_list(context, products_list)
        print(f"Context: {pretty_context}")

        bot_response = get_chat(prompts.prompt_answer_template.format(context=pretty_context), chat_history)
    """

    return bot_response, new_products
