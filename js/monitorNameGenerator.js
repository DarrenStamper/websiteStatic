/*
 * Once upon a time there was a novel website called Monitor Name Generator, I liked it very much. However, I thought to myself, given the infuriating temperamental nature of so many things on the web
 * it occured to me that it may not be available in 15 years time, so I figured I'd download the source code as a back up. Then one day like the spaz I am I deleted the source code from my computer
 * and after discovering the website was no longer available some time later, I had to make my own.
 *
 * vocabulary source
 * - tone, feelings, emotions: https://grammar.yourdictionary.com/parts-of-speech/adjectives/list-of-adjectives-to-describe-tone-feelings-emotions.html
 * -                     math: https://www.enchantedlearning.com/wordlist/math.shtml
 * -                  physics: https://myvocabulary.com/word-list/physics-science--vocabulary/
 */

'use strict';

import { loadNavbar, navbarDropdown, randInt } from "./global.js";

//adjective
var tone = ["agreeable", "animated", "bright", "clever", "encouraging", "fresh", "gentle", "hopeful", "kind", "loving", "open", "pleased", "supportive", "sympathetic", "warm", "annoyed", "bitter", "disgruntled", "disgusted", "evil", "guilty", "hostile", "hurtful", "nasty", "obnoxious", "oppressive", "overbearing", "resentful", "sarcastic", "sardonic", "ambivalent", "anxious", "bashful", "candid", "cautious", "horrified", "intelligent", "mysterious", "pragmatic", "political", "quizzical", "religious", "secretive", "secular", "strong"];
var feelings = ["amazed", "attractive", "beautiful", "bold", "brave", "cheerful", "comfortable", "delightful", "excited", "festive", "free", "jolly", "optimistic", "proud", "wonderful", "aggravated", "awful", "chilly", "depressed", "dirty", "dreadful", "heavy", "irritated", "pessimistic", "tearful", "tense", "terrible", "tired", "ugly", "weak", "anxious", "awestruck", "bashful", "cautious", "composed", "easygoing", "horrified", "intelligent", "mysterious", "political", "quizzical", "religious", "secretive", "secular", "shy"];
var emotions = ["appreciative", "blissful", "contented", "ecstatic", "elated", "glad", "happy", "joyful", "jubilant", "merry", "respectful", "sweet", "serene", "upbeat", "vivacious", "angry", "disenchanted", "distressed", "glum", "gloomy", "grumpy", "grouchy", "miserable", "mad", "moody", "nervous", "sad", "sadistic", "selfish", "sour", "accepting", "calm", "confident", "cool", "earnest", "easy", "evenhanded", "indifferent", "neutral", "nonpartisan", "passive", "reserved", "satisfied", "surprised", "tranquil"];

//term
var maths = ["addend", "Addition", "angle", "answer", "area", "average", "axis", "cardinal", "circle", "circumference", "compass", "cosine", "curve", "cylinder", "decimal", "degree", "denominator", "diameter", "difference", "divide", "division", "divisor", "ellipse", "equal", "equation", "exponent", "expression", "factor", "factorial", "focus", "formula", "fraction", "geometry", "graph", "hundredth", "hyperbola", "hypotenuse", "identity", "inequality", "intersection", "inverse", "irrational", "linear", "median", "multiplicad",
                 "numerator", "octagon", "ordinal", "origin", "oval", "parabola", "perimeter", "plane", "polygon", "polyhedron", "polynomial", "prime", "product", "proof", "quadratic", "quotient", "radian", "rational", "rhombus", "series", "slope", "sphere", "subtrahend", "symmetry", "tangent", "thousand", "torus", "trapezoid", "triangle", "twelve", "union", "unit", "variable", "vertex", "volume"];
var physics = ["acceleration", "action", "adhesion", "affect", "alteration", "amplitude", "aptitude", "aspect", "axis", "balance", "boson", "capacity", "chaos", "component", "component", "compression", "constant", "conversion", "distortion", "disturbance", "dynamics", "effect", "emission", "energy", "engine", "entropy", "equilibrium", "equivalent", "expansion", "external", "factor", "flow", "focus", "force", "form", "frequency", "friction", "fulcrum", "fundamental", "gravitation", "gyroscope", "harness", "impact", "impulse",
                    "inertia", "influence", "inquiry", "interation", "inverse", "investigation", "isotope", "kaon", "level", "lift", "lumen", "machinery", "magnet", "magnetism", "magnitude", "mass", "matter", "measure", "molecule", "motion", "navigation", "negative", "nucleus", "oscillation", "overload", "parallax", "parity", "particle", "performance", "phenomenon", "pitch", "plasma", "position", "prediction", "pressure", "principle", "propagation", "proportion", "quandry", "quantity", "quark", "repulsion", "resistance", "resonance",
                    "rotation", "scalar", "semiconductor", "sublimation", "shift", "sound", "spectrum", "strain", "structure", "substance", "suspension", "system", "tension", "theoretical", "torque", "trajectory", "transformation", "transistor", "transistion", "unit", "variable", "variation", "vector", "volume"];

var number;
var adjective;
var term;

var monitorName;

window.onload = function() {

    //load navbar
    loadNavbar().then( () => document.getElementById("navbarIcon").addEventListener("click", navbarDropdown) );

    //button event
    document.getElementById("button").addEventListener("click", generateMonitorName);
}

function generateMonitorName() {

    var button = document.getElementById("button");

    number = randInt(100, 1000);

    //adjective
    switch (randInt(0, 3)) {
        case 0:
            adjective = tone[randInt(0,tone.length)];
            break;
        case 1:
            adjective = feelings[randInt(0,feelings.length)];
            break;
        case 2:
            adjective = emotions[randInt(0,emotions.length)];
            break;
    }

    //term
    switch (randInt(0,2)) {
        case 0:
            term = maths[randInt(0, maths.length)];
            break;
        case 1:
            term = physics[randInt(0, maths.length)];
    }

    monitorName = number + " " + adjective + " " + term;

    document.getElementById("monitorName").innerHTML = monitorName;
}
