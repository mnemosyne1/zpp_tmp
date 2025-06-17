from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from rag_chatbot import conversation
import prompts

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    chat_history: list[dict]

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        chat_history = [{'role': 'system', 'content': prompts.prompt_standard}]
        chat_history.extend(request.chat_history)
        chat_history.append({'role': 'user', 'content': request.message})
        
        response, products = conversation(chat_history)
        
        return {
            "response": response,
            "products": products
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)