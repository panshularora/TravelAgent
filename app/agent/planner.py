from app.tools.weather import get_weather
from app.tools.itinerary import get_iternary
from app.tools.flights import search_flights
from app.tools.hotels import search_hotels

def plan_trip(query: str):
    # Basic extraction of the city from the query
    lower_query = query.lower()
    if "trip to " in lower_query:
        city = lower_query.split("trip to ")[-1].strip().title()
    else:
        city = query.strip().title()

    return {
        "summary": f"Trip to {city}",
        "weather": get_weather(city),
        "flights": search_flights(city),
        "hotels": search_hotels(city),
        "itinerary": get_iternary(city)
    }
