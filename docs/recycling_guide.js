// recycling_guide.js
// Maps the model's material prediction onto Barcelona's bin system
// (contenidors + Punts Verds). Mirrors recycling_guide.py from the
// FastAPI version of this app.

export const CONFIDENCE_THRESHOLD = 55.0;

export const NOT_SURE_MESSAGE =
  "I'm not entirely sure about this one. When in doubt, put it in the " +
  "trash (grey bin), or look it up on the Barcelona recycling site " +
  "before tossing it.";

export const GUIDE = {
  cardboard: {
    bin: "Blue bin — paper & cardboard",
    catalan: "Contenidor blau",
    color: "#2f6fed",
    tip:
      "Flatten the box first. If it's greasy or food-stained (like a " +
      "used pizza box), it can't go here — put it in the grey bin instead.",
  },
  paper: {
    bin: "Blue bin — paper & cardboard",
    catalan: "Contenidor blau",
    color: "#2f6fed",
    tip:
      "Clean, dry paper only. Napkins or paper towels that touched food " +
      "go in the grey bin.",
  },
  glass: {
    bin: "Green bin — glass",
    catalan: "Contenidor verd / iglú verd",
    color: "#1f9d55",
    tip:
      "Only bottles and jars. Broken drinking glasses, mirrors, ceramics " +
      "and lightbulbs don't belong here — take those to a Green Point (Punt Verd).",
  },
  metal: {
    bin: "Yellow bin — containers",
    catalan: "Contenidor groc",
    color: "#c98a00",
    tip:
      "Cans, tins and aluminium foil, ideally rinsed. Small appliances " +
      "or batteries go to a Green Point instead.",
  },
  plastic: {
    bin: "Yellow bin — containers",
    catalan: "Contenidor groc",
    color: "#c98a00",
    tip:
      "Bottles, tubs, trays and film all count in Barcelona. Give it a " +
      "quick rinse if it held food or cosmetics — empty cosmetics " +
      "packaging goes here too.",
  },
  trash: {
    bin: "Grey bin — general waste",
    catalan: "Contenidor gris / rebuig",
    color: "#6b7280",
    tip:
      "This is for anything that can't be recycled. If it's electronics, " +
      "batteries, textiles or oil, a Green Point (Punt Verd) is the " +
      "better home for it.",
  },
};

/** Turn a raw {material, confidence} prediction into the bin guidance the page shows. */
export function buildResult({ material, confidence, allScores }) {
  const unsure = confidence < CONFIDENCE_THRESHOLD;
  const info = GUIDE[material] ?? GUIDE.trash;

  return {
    material,
    confidence,
    unsure,
    message: unsure ? NOT_SURE_MESSAGE : null,
    bin: info.bin,
    catalan: info.catalan,
    color: info.color,
    tip: info.tip,
    allScores,
  };
}
