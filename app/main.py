from fastapi import FastAPI
from app.models.request import TravelRequest
from app.agent.travel_agent import travel_agent

app = FastAPI()

@app.get("/")
def home():
    return{"message": "hello"}

@app.post("/plans")
def plans(request: TravelRequest):
    return travel_agent(request.query)