'use strict';

import { includeHTML, xhttpRequest_get, randInt } from "./global.js";

var jsonData; //adjectives, nouns, standAloneNames, titles, fileExtensions

var chanceList = [];

var outputName = "";

window.onload = function() {

    //load common html
    includeHTML();

    //load data
    xhttpRequest_get("json/myNameGenerator/myNameGenerator.json", loadData);
}

function loadData(xhttp) {

    jsonData = JSON.parse(xhttp.response);

    var total = jsonData.adjectives.length + jsonData.nouns.length + jsonData.standAloneNames.length;

    chanceList.push([jsonData.adjectives.length / total, "adjectives"]);
    chanceList.push([jsonData.nouns.length / total, "nouns"]);
    chanceList.push([jsonData.standAloneNames.length / total, "standAloneNames"]);

    chanceList.sort((a, b) => (a[0] > b[0]) ? 1 : -1);

    for (var i = 1; i < 3; i++)
        chanceList[i][0] += chanceList[i - 1][0];

    chanceList.push([0.1, "titles"]);
    chanceList.push([0.1, "fileExtensions"]);

    //keyboard event
    window.onkeydown = function (event) { if (event.keyCode == 13 || event.keyCode == 32) generateMyName(); };

    //button event
    document.getElementById("button").addEventListener("click", generateMyName);
}

function generateMyName() {

    outputName = "";

    //randomly select name type
    var wordTypeChance = Math.random();
    var wordTypeIndex = 0;
    for (; wordTypeIndex < 3; wordTypeIndex++)
        if (wordTypeChance < chanceList[wordTypeIndex][0])
            break;

    //randonly select name word
    switch (chanceList[wordTypeIndex][1]) {
        case "adjectives":
            outputName += jsonData["adjectives"][randInt(0, jsonData["adjectives"].length)];
            outputName +=  " " + jsonData["nouns"][randInt(0, jsonData["nouns"].length)]; 
            break;
        case "nouns":
            outputName += jsonData["nouns"][randInt(0, jsonData["nouns"].length)];
            break;
        case "standAloneNames":
            outputName += jsonData["standAloneNames"][randInt(0, jsonData["standAloneNames"].length)];
    }

    //chance to add title
    if (Math.random() < chanceList[3][0]) outputName = jsonData["titles"][randInt(0, jsonData["titles"].length)] + " " + outputName;

    //chance to add fileExtension
    if (Math.random() < chanceList[4][0]) outputName += jsonData["fileExtensions"][randInt(0, jsonData["fileExtensions"].length)];

    //output name
    document.getElementById("myName").innerHTML = outputName;
}
