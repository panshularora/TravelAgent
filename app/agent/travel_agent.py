from app.services.config import client
from app.agent.prompts import SYSTEM_PROMPT
import json
from google import genai
from app.tools.weather import get_weather
from app.tools.flights import search_flights
from app.tools.hotels import search_hotels
from app.tools.itinerary import get_iternary

def travel_agent(query: str):
    chat = client.chats.create(
        model="gemini-2.5-flash",
        config=genai.types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=[get_weather, search_flights, search_hotels, get_iternary]
        )
    )
    
    response = chat.send_message(query)
    
    while response.function_calls:
        function_responses = []
        
        for tool_call in response.function_calls:
            if tool_call.name == "get_weather":
                result = get_weather(**(tool_call.args or {}))
            elif tool_call.name == "search_flights":
                result = search_flights(**(tool_call.args or {}))
            elif tool_call.name == "search_hotels":
                result = search_hotels(**(tool_call.args or {}))
            elif tool_call.name == "get_iternary":
                result = get_iternary(**(tool_call.args or {}))
            else:
                result = {"error": "Tool not found"}
                
            function_responses.append(
                genai.types.Part.from_function_response(
                    name=tool_call.name,
                    response={"result": result}
                )
            )
            
        response = chat.send_message(function_responses)

    text = response.text
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
        
    return json.loads(text.strip())