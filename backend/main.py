import os

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")


def get_restaurants():
    lat = request.args.get("lat")
    long = request.args.get("long")
    radius = request.args.get("radius", default=2000)
    url = f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?location={lat},{long}&radius={radius}&type=restaurant&key={GOOGLE_API_KEY}"
    response = requests.get(url)
    data = response.json()

    restaurants = []
    for place in data.get("results", []):
        restaurants.append(
            {
                "id": place.get("place_id"),
                "name": place.get("name"),
                "rating": place.get("rating"),
                "location": place.get("geometry", {}).get("location"),
                "types": place.get("types", []),
                "photo_reference": (
                    place["photos"][0]["photo_reference"]
                    if "photos" in place and place["photos"]
                    else None
                ),
            }
        )
    return jsonify(restaurants)


if __name__ == "__main__":
    app.run(debug=True)
