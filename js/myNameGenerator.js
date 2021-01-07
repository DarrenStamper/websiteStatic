'use strict';

import { randInt } from "../js/_global.js";

const SMALL = 1;
const MEDIUM = 2;
const LARGE = 3;

var length = MEDIUM;

var adjectives = ["autumnal", "scrotundal", "moist", "optimised", "ambivalent", "obfuscated", "palindromic", "gentrified", "panic", "prismic", "oblique", "miscreant", "oblong",
                  "pragmatic", "oblate", "scroticular", "aforementioned", "peruvian", "corpulent", "recrudescent", "jovial", "ableist", "olfactory", "crinkle cut", "oval",
                  "secular", "anphylactic", "salty", "cictral", "nonplussed"];

var nouns = ["croquette", "enema", "compiler", "prism", "oblong", "quandry", "secretion", "miscreant", "flesh fountain", "gentrification", "hot tub club", "oblongata", "flexbox",
             "fulcrum", "frustrum", "panic enema", "tangent", "inquiry", "bezemer", "sphincter", "spherinder", "cloaca", "spheroid", "klein bottle", "reticulum", "gauze", "plug",
             "bumper", "orifice", "contraband", "exhilation", "anal phabet", "siemen demon", "cronjob", "skillet", "anus cakes", "cleet", "gonk", "conk", "kernel", "surprise",
             "crab", "crab cycle", "new years nugget", "scrotalcardium", "lilibab", "guiseppe"];

var myName = "";

window.onload = function() {

    //keybpard event
    window.onkeydown = function (event) { if (event.keyCode == 13 || event.keyCode == 32) generateMyName(); };

    //button event
    document.getElementById("button").addEventListener("click", generateMyName);
}

function generateMyName() {

    if (length == LARGE) {

        var a = randInt(0, adjectives.length);
        var b = randInt(0, adjectives.length);
        while (a == b) b = randInt(0, adjectives.length);

        myName = adjectives[a] + " " + adjectives[b] + " " + nouns[randInt(0, nouns.length)];
    }

    else if (length == MEDIUM) {
        myName = adjectives[randInt(0, adjectives.length)] + " " + nouns[randInt(0, nouns.length)];
    }

    else if (length == SMALL) {
        myName = nouns[randInt(0, nouns.length)];
    }

    document.getElementById("myName").innerHTML = myName;
}
