import os
import time
import requests

from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv


# ============================================================
# ENVIRONMENT
# ============================================================

load_dotenv()

FORTYGUARD_API_KEY = os.getenv("FORTYGUARD_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


print("=" * 70)
print("THERMALGUIDE STARTING")
print("=" * 70)
print("FortyGuard configured:", bool(FORTYGUARD_API_KEY))
print("Gemini configured:", bool(GEMINI_API_KEY))
print("=" * 70)


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="ThermalGuide",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# REQUEST MODEL
# ============================================================

class ActivityRequest(BaseModel):
    location: str
    activity: str
    time: str


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "ThermalGuide backend is running",
        "fortyguard_configured": bool(FORTYGUARD_API_KEY),
        "gemini_configured": bool(GEMINI_API_KEY)
    }


# ============================================================
# LOCATION
# ============================================================

def geocode_location(location: str):

    print("\n" + "=" * 70)
    print("📍 LOCATION AGENT")
    print("=" * 70)

    print("Searching:", location)

    response = requests.get(
        "https://nominatim.openstreetmap.org/search",
        params={
            "q": location,
            "format": "json",
            "limit": 1
        },
        headers={
            "User-Agent": "ThermalGuide/3.0"
        },
        timeout=15
    )

    if not response.ok:
        raise RuntimeError(
            f"Location service failed: {response.status_code}"
        )

    results = response.json()

    if not results:
        raise ValueError(
            f"Location not found: {location}"
        )

    latitude = float(results[0]["lat"])
    longitude = float(results[0]["lon"])

    print("Found:", results[0]["display_name"])
    print("Latitude:", latitude)
    print("Longitude:", longitude)

    return latitude, longitude


# ============================================================
# FORTYGUARD
# ============================================================

def get_fortyguard_data(
    latitude,
    longitude,
    requested_time
):

    print("\n" + "=" * 70)
    print("🌡️ CLIMATE AGENT")
    print("=" * 70)

    if not FORTYGUARD_API_KEY:
        raise RuntimeError(
            "FORTYGUARD_API_KEY is missing."
        )

    # --------------------------------------------------------
    # FortyGuard currently supports US locations
    # --------------------------------------------------------

    if not (
        24 <= latitude <= 50
        and -125 <= longitude <= -66
    ):
        raise ValueError(
            "FortyGuard currently supports US locations only."
        )

    today = datetime.now().strftime("%Y-%m-%d")

    # Validate time
    try:
        datetime.strptime(
            requested_time,
            "%H:%M"
        )

        start_time = requested_time

    except ValueError:

        print(
            "Invalid time received. Using 14:00."
        )

        start_time = "14:00"


    # --------------------------------------------------------
    # Environmental Parameters
    # --------------------------------------------------------

    payload = {

        "latitude": latitude,

        "longitude": longitude,

        "temperature": 30.0,

        "date_time": {

            "start_date": today,

            "start_time": start_time,

            "filter_type": 1

        }

    }


    headers = {

        "api-key": FORTYGUARD_API_KEY,

        "Content-Type": "application/json"

    }


    print("Endpoint:")
    print(
        "https://api.fortyguard.com/v1/env_params"
    )

    print("Submitting request...")


    response = requests.post(

        "https://api.fortyguard.com/v1/env_params",

        headers=headers,

        json=payload,

        timeout=30

    )


    print(
        "Submission status:",
        response.status_code
    )

    print(
        "Submission response:",
        response.text[:1500]
    )


    if response.status_code == 401:

        raise RuntimeError(
            "FortyGuard API key was rejected."
        )


    if response.status_code == 403:

        raise RuntimeError(
            "FortyGuard denied access to this endpoint."
        )


    if response.status_code >= 400:

        raise RuntimeError(
            f"FortyGuard request failed "
            f"({response.status_code}): "
            f"{response.text[:500]}"
        )


    submission = response.json()


    # --------------------------------------------------------
    # Get activity ID
    # --------------------------------------------------------

    activity_id = (
        submission
        .get("data", {})
        .get("activity_id")
    )


    if not activity_id:

        print(
            "FULL SUBMISSION:",
            submission
        )

        raise RuntimeError(
            "FortyGuard did not return an activity_id."
        )


    print(
        "Activity ID:",
        activity_id
    )


    # ========================================================
    # POLLING
    # ========================================================

    status_url = (
        "https://api.fortyguard.com/v1/status/"
        + activity_id
    )


    print("\nWaiting for FortyGuard...")
    print("Maximum wait: 5 minutes")


    # 150 × 2 seconds = 5 minutes

    for attempt in range(150):

        try:

            status_response = requests.get(

                status_url,

                headers={
                    "api-key":
                        FORTYGUARD_API_KEY
                },

                timeout=30

            )

        except requests.RequestException as error:

            print(
                "Status request error:",
                error
            )

            time.sleep(2)

            continue


        if status_response.status_code != 200:

            print(
                "Status HTTP:",
                status_response.status_code
            )

            print(
                status_response.text[:500]
            )

            time.sleep(2)

            continue


        status_json = status_response.json()


        data = status_json.get(
            "data",
            {}
        )


        status = str(
            data.get(
                "status",
                ""
            )
        ).lower().strip()


        print(
            f"[{attempt + 1}/150] "
            f"FortyGuard status: {status}"
        )


        # ----------------------------------------------------
        # COMPLETED
        # ----------------------------------------------------

        if status in [
            "completed",
            "complete",
            "success",
            "succeeded",
            "done"
        ]:

            result = data.get(
                "result"
            )


            # Some responses may put
            # result elsewhere.

            if result is None:

                result = data


            print(
                "✅ FortyGuard analysis completed!"
            )


            print(
                "Result keys:",
                list(result.keys())
                if isinstance(result, dict)
                else "not-dict"
            )


            return result


        # ----------------------------------------------------
        # FAILED
        # ----------------------------------------------------

        if status in [
            "failed",
            "failure",
            "error"
        ]:

            print(
                "❌ FortyGuard reported failure."
            )

            print(
                "Response:",
                status_json
            )

            raise RuntimeError(
                "FortyGuard processing failed."
            )


        # ----------------------------------------------------
        # WAIT
        # ----------------------------------------------------

        time.sleep(2)


    # --------------------------------------------------------
    # TIMEOUT
    # --------------------------------------------------------

    raise TimeoutError(
        "FortyGuard analysis did not complete "
        "within 5 minutes."
    )


# ============================================================
# EXTRACT ENVIRONMENT
# ============================================================

def extract_environment(result):

    print("\n" + "=" * 70)
    print("🌍 ENVIRONMENT DATA")
    print("=" * 70)


    # --------------------------------------------------------
    # Locate result
    # --------------------------------------------------------

    locations = result.get(
        "locations",
        []
    )


    if not locations:

        # Try alternative structures

        if "data" in result:

            locations = result[
                "data"
            ].get(
                "locations",
                []
            )


    if not locations:

        print(
            "Result:",
            result
        )

        raise RuntimeError(
            "FortyGuard returned no location data."
        )


    location_data = locations[0]


    # --------------------------------------------------------
    # Temperature
    # --------------------------------------------------------

    temperature_c = location_data.get(
        "temperature"
    )


    # Some API responses may put
    # temperature inside parameters.

    if temperature_c is None:

        temperature_c = 30.0

        print(
            "Temperature missing; "
            "using fallback 30°C."
        )


    temperature_c = float(
        temperature_c
    )


    temperature_f = (
        temperature_c * 9 / 5
    ) + 32


    parameters = location_data.get(
        "parameters",
        {}
    )


    # --------------------------------------------------------
    # Helper
    # --------------------------------------------------------

    def get_first(key):

        value = parameters.get(key)


        if isinstance(value, list):

            if len(value) > 0:

                return value[0]

            return None


        return value


    heat_index_c = get_first(
        "heat_index_celsius"
    )


    apparent_temperature_c = get_first(
        "apparent_temperature_celsius"
    )


    humidity = get_first(
        "relative_humidity_percent"
    )


    aqi = get_first(
        "aqi_us"
    )


    # --------------------------------------------------------
    # Convert heat index
    # --------------------------------------------------------

    heat_index_f = None


    if heat_index_c is not None:

        heat_index_f = (
            float(heat_index_c) * 9 / 5
        ) + 32


    # --------------------------------------------------------
    # Apparent temperature
    # --------------------------------------------------------

    apparent_f = None


    if apparent_temperature_c is not None:

        apparent_f = (
            float(apparent_temperature_c)
            * 9 / 5
        ) + 32


    environment = {

        "temperature":
            round(temperature_f, 1),

        "temperature_c":
            round(temperature_c, 1),

        "heat_index":
            round(heat_index_f, 1)
            if heat_index_f is not None
            else None,

        "apparent_temperature":
            round(apparent_f, 1)
            if apparent_f is not None
            else None,

        "humidity":
            round(float(humidity), 1)
            if humidity is not None
            else None,

        "aqi":
            round(float(aqi), 1)
            if aqi is not None
            else None
    }


    print(
        "Temperature:",
        environment["temperature"],
        "°F"
    )

    print(
        "Heat index:",
        environment["heat_index"]
    )

    print(
        "Humidity:",
        environment["humidity"]
    )

    print(
        "AQI:",
        environment["aqi"]
    )


    return environment


# ============================================================
# THERMAL DECISION
# ============================================================

def calculate_risk(
    temperature,
    activity
):

    print("\n" + "=" * 70)
    print("🧠 THERMAL DECISION AGENT")
    print("=" * 70)


    activity = activity.lower().strip()


    intensity = {

        "walking": 1,

        "outdoor dining": 1,

        "camping": 2,

        "hiking": 3,

        "cycling": 3,

        "running": 4

    }.get(
        activity,
        2
    )


    if temperature >= 110:

        base = 4

    elif temperature >= 100:

        base = 3

    elif temperature >= 90:

        base = 2

    elif temperature >= 80:

        base = 1

    else:

        base = 0


    score = base + intensity - 2


    if score >= 5:

        risk = "Extreme"

    elif score >= 3:

        risk = "High"

    elif score >= 1:

        risk = "Moderate"

    else:

        risk = "Low"


    print(
        "Activity:",
        activity
    )

    print(
        "Thermal score:",
        score
    )

    print(
        "Risk:",
        risk
    )


    return risk


# ============================================================
# GEMINI
# ============================================================

def generate_recommendation(
    location,
    activity,
    preferred_time,
    environment,
    risk
):

    print("\n" + "=" * 70)
    print("✨ GEMINI RECOMMENDATION AGENT")
    print("=" * 70)


    temperature = environment[
        "temperature"
    ]

    heat_index = environment[
        "heat_index"
    ]

    humidity = environment[
        "humidity"
    ]

    aqi = environment[
        "aqi"
    ]


    # --------------------------------------------------------
    # Fallback
    # --------------------------------------------------------

    if risk == "Extreme":

        fallback = (
            "Avoid strenuous outdoor activity "
            "under these conditions. Consider "
            "moving it to a cooler time such as "
            "early morning or evening."
        )

    elif risk == "High":

        fallback = (
            "Thermal exposure is high for this "
            "activity. Consider changing to a "
            "cooler time, use shade, stay hydrated, "
            "and take frequent breaks."
        )

    elif risk == "Moderate":

        fallback = (
            "The activity is possible, but stay "
            "hydrated, use shade when possible, "
            "and take regular breaks."
        )

    else:

        fallback = (
            "Thermal conditions are relatively "
            "favorable for this activity. "
            "Stay hydrated and monitor conditions."
        )


    if not GEMINI_API_KEY:

        return {

            "recommendation":
                fallback,

            "reasoning":
                "Gemini is not configured.",

            "ai_available":
                False

        }


    # --------------------------------------------------------
    # Gemini
    # --------------------------------------------------------

    try:

        from google import genai


        client = genai.Client(
            api_key=GEMINI_API_KEY
        )


        prompt = f"""
You are ThermalGuide's AI recommendation agent.

Create a concise, practical recommendation for
someone planning an outdoor activity.

Location: {location}

Activity: {activity}

Preferred time: {preferred_time}

Temperature: {temperature} °F

Heat index: {
    heat_index
    if heat_index is not None
    else "unavailable"
} °F

Humidity: {
    humidity
    if humidity is not None
    else "unavailable"
} %

AQI: {
    aqi
    if aqi is not None
    else "unavailable"
}

Thermal risk: {risk}

Give the user useful advice about:

- whether the activity is appropriate
- whether they should change the time
- hydration
- breaks
- shade/cooling
- heat exposure
- air quality when available

Do not diagnose medical conditions.

Do not invent data.

Do not say an activity is completely safe.

Keep the answer under 100 words.

Return only the recommendation.
"""


        response = client.models.generate_content(

            model="gemini-3.5-flash-lite",

            contents=prompt

        )


        text = (
            response.text.strip()
            if response.text
            else fallback
        )


        print(
            "✅ Gemini recommendation generated."
        )


        return {

            "recommendation":
                text,

            "reasoning":
                (
                    "Gemini evaluated the real "
                    "FortyGuard environmental data "
                    "and the Thermal Decision Agent's "
                    f"{risk} risk classification."
                ),

            "ai_available":
                True

        }


    except Exception as error:

        print(
            "Gemini error:",
            repr(error)
        )


        return {

            "recommendation":
                fallback,

            "reasoning":
                (
                    "Gemini was temporarily unavailable. "
                    "ThermalGuide used its deterministic "
                    "thermal-risk fallback."
                ),

            "ai_available":
                False

        }


# ============================================================
# ANALYZE
# ============================================================

@app.post("/analyze")
def analyze(
    request: ActivityRequest
):

    print("\n\n")
    print("#" * 70)
    print("🔥 THERMALGUIDE ANALYSIS")
    print("#" * 70)


    try:

        # ====================================================
        # 1. LOCATION
        # ====================================================

        latitude, longitude = (
            geocode_location(
                request.location
            )
        )


        # ====================================================
        # 2. FORTYGUARD
        # ====================================================

        fortyguard_result = (
            get_fortyguard_data(
                latitude,
                longitude,
                request.time
            )
        )


        # ====================================================
        # 3. ENVIRONMENT
        # ====================================================

        environment = (
            extract_environment(
                fortyguard_result
            )
        )


        # ====================================================
        # 4. DECISION
        # ====================================================

        risk = calculate_risk(

            environment[
                "heat_index"
            ]
            if environment[
                "heat_index"
            ] is not None

            else environment[
                "temperature"
            ],

            request.activity
        )


        # ====================================================
        # 5. GEMINI
        # ====================================================

        ai = generate_recommendation(

            request.location,

            request.activity,

            request.time,

            environment,

            risk
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        result = {

            "location":
                request.location,

            "activity":
                request.activity,

            "preferred_time":
                request.time,

            "temperature":
                environment[
                    "temperature"
                ],

            "temperature_c":
                environment[
                    "temperature_c"
                ],

            "heat_index":
                environment[
                    "heat_index"
                ],

            "apparent_temperature":
                environment[
                    "apparent_temperature"
                ],

            "humidity":
                environment[
                    "humidity"
                ],

            "aqi":
                environment[
                    "aqi"
                ],

            "risk":
                risk,

            "recommendation":
                ai[
                    "recommendation"
                ],

            "reasoning":
                ai[
                    "reasoning"
                ],

            "ai_available":
                ai[
                    "ai_available"
                ],

            "coordinates": {

                "latitude":
                    latitude,

                "longitude":
                    longitude

            },

            "agents": {

                "location":
                    "complete",

                "climate":
                    "complete",

                "decision":
                    "complete",

                "recommendation":
                    (
                        "complete"
                        if ai["ai_available"]
                        else "fallback"
                    )

            }

        }


        print("\n" + "#" * 70)
        print("✅ THERMALGUIDE ANALYSIS COMPLETE")
        print("#" * 70)
        print()


        return result


    except ValueError as error:

        print(
            "Validation error:",
            error
        )

        raise HTTPException(
            status_code=400,
            detail=str(error)
        )


    except TimeoutError as error:

        print(
            "FortyGuard timeout:",
            error
        )

        raise HTTPException(
            status_code=504,
            detail=str(error)
        )


    except Exception as error:

        print(
            "ThermalGuide error:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "ThermalGuide analysis failed: "
                + str(error)
            )
        )
    