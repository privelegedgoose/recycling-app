"""
recycling_guide.py
Maps the model's material prediction onto Barcelona's bin system
(contenidors + Punts Verds) and decides when the app should say
"I'm not sure" instead of guessing.
"""

CONFIDENCE_THRESHOLD = 55.0  # below this, we tell the user we're not sure

NOT_SURE_MESSAGE = (
    "I'm not entirely sure about this one. When in doubt, put it in the "
    "trash (grey bin), or check Barcelona's official Cercador de residus "
    "(ajuntament.barcelona.cat/cercador-de-residus/ca) before tossing it."
)

# One entry per label the model can predict (see recycling-model/config.json).
# Bin colors and categories are from the city's own guidance; a tip phrased
# as "generally"/"most systems" is general recycling practice we haven't
# separately confirmed is a written Barcelona-specific rule.
GUIDE = {
    "cardboard": {
        "bin": "Blue bin — paper & cardboard",
        "catalan": "Contenidor blau",
        "color": "#2f6fed",
        "tip": (
            "Flatten the box first. Heavily greasy or food-soaked cardboard "
            "(like a well-used pizza box) is iffy for paper recycling in "
            "most systems, since the oil contaminates the pulp — if you're "
            "not sure about a specific item, check Barcelona's Cercador de "
            "residus (ajuntament.barcelona.cat/cercador-de-residus/ca)."
        ),
    },
    "paper": {
        "bin": "Blue bin — paper & cardboard",
        "catalan": "Contenidor blau",
        "color": "#2f6fed",
        "tip": (
            "Clean, dry paper only. Napkins or paper towels that touched "
            "food go in the grey bin."
        ),
    },
    "glass": {
        "bin": "Green bin — glass",
        "catalan": "Contenidor verd / iglú verd",
        "color": "#1f9d55",
        "tip": (
            "Only bottles and jars. Broken drinking glasses, mirrors, "
            "ceramics and lightbulbs don't belong here — take those to "
            "a Green Point (Punt Verd)."
        ),
    },
    "metal": {
        "bin": "Yellow bin — containers",
        "catalan": "Contenidor groc",
        "color": "#c98a00",
        "tip": (
            "Cans, tins and aluminium foil. Barcelona's own guidance says "
            "you don't need to clean containers before binning them. Small "
            "appliances or batteries go to a Green Point instead."
        ),
    },
    "plastic": {
        "bin": "Yellow bin — containers",
        "catalan": "Contenidor groc",
        "color": "#c98a00",
        "tip": (
            "Bottles, tubs, trays and film all count in Barcelona. You "
            "don't need to clean it first — just take the caps off "
            "bottles. Empty cosmetics packaging goes here too."
        ),
    },
    "trash": {
        "bin": "Grey bin — general waste",
        "catalan": "Contenidor gris / rebuig",
        "color": "#6b7280",
        "tip": (
            "This is for anything that can't be recycled. If it's "
            "electronics, batteries, textiles or oil, a Green Point (Punt "
            "Verd) is the better home for it."
        ),
    },
}


def build_result(raw: dict) -> dict:
    """Turn a raw material prediction into the Barcelona bin guidance the page shows."""
    material = raw["material"]
    confidence = raw["confidence"]
    unsure = confidence < CONFIDENCE_THRESHOLD
    info = GUIDE.get(material, GUIDE["trash"])

    return {
        "material": material,
        "confidence": confidence,
        "unsure": unsure,
        "message": NOT_SURE_MESSAGE if unsure else None,
        "bin": info["bin"],
        "catalan": info["catalan"],
        "color": info["color"],
        "tip": info["tip"],
        "all_scores": raw["all_scores"],
    }
