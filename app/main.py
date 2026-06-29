from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.models.request import TravelRequest
from app.agent.travel_agent import travel_agent

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return{"message": "hello"}

@app.post("/plans")
def plans(request: TravelRequest):
    return travel_agent(request.query)