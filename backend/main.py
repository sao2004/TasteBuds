import os

import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

GOOGLE_PHOTO_BASE = "https://maps.googleapis.com/maps/api/place/photo"


@app.get("/get_restaurants")
def get_restaurants():
    lat = request.args.get("lat")
    long = request.args.get("long")
    radius = request.args.get("radius", 10000)

    url = (
        f"https://maps.googleapis.com/maps/api/place/nearbysearch/json"
        f"?location={lat},{long}&radius={radius}&type=restaurant&key={GOOGLE_API_KEY}"
    )
    response = requests.get(url)
    data = response.json()

    restaurants = []

    for place in data.get("results", []):
        photo_url = None
        if "photos" in place and place["photos"]:
            ref = place["photos"][0]["photo_reference"]
            photo_url = f"{GOOGLE_PHOTO_BASE}?maxwidth=400&photoreference={ref}&key={GOOGLE_API_KEY}"

        restaurants.append(
            {
                "id": place.get("place_id"),
                "name": place.get("name"),
                "rating": place.get("rating"),
                "location": place.get("geometry", {}).get("location"),
                "types": place.get("types", []),
                "photo": photo_url,
            }
        )

    return jsonify(restaurants)


if __name__ == "__main__":
    app.run(debug=True)
