from pydantic import BaseModel

class TravelRequest(BaseModel):
    query: str