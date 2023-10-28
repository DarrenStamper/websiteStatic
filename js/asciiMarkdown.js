'use strict';

var width_numOfCharacters = 100;

function format_table(text) {

    // for each line
    var lines = text.split('\r\n');
    // extract cell data
    // for each row
    //   find longest string
    // rebuild table with evenly sized columns
}

function render_heading1(text) {

    var whiteSpace = width_numOfCharacters - 2 - text.length;
    var whiteSpaceLeft, whiteSpaceRight;
    if (whiteSpace%2) { whiteSpaceLeft = Math.floor(whiteSpace/2); whiteSpaceRight = whiteSpaceLeft+1; }
    else whiteSpaceLeft = whiteSpaceRight = whiteSpace/2;

    var string = "";

    string += "*".repeat(width_numOfCharacters) + "\r\n";
    string += "*" + " ".repeat(width_numOfCharacters-2) + "*" + "\r\n";
    string += "*" + " ".repeat(whiteSpaceLeft) + text + " ".repeat(whiteSpaceRight) + "*" + "\r\n";
    string += "*" + " ".repeat(width_numOfCharacters-2) + "*" + "\r\n";
    string += "*".repeat(width_numOfCharacters);

    return string;
}

function render_heading2(text) {

    var string = "";

    string += "=".repeat(width_numOfCharacters) + "\r\n";
    string += text + "\r\n";
    string += "=".repeat(width_numOfCharacters) + "\r\n";

    return string;
}

function render_heading3(text) {

    var string = "";

    string += "-".repeat(width_numOfCharacters) + "\r\n";
    string += text + "\r\n";

    return string;
}

function render_heading4(text) {

    var string = "";

    string += text + "\r\n";
    string += "-".repeat(text.length) + "\r\n";

    return string;
}

window.onload = function() {

    var textTextareaElement = document.getElementById("testTextarea");

    textTextareaElement.value = render_heading1("Heading1"); 
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += render_heading2("Heading2");
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += render_heading3("Heading3");
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += "\r\n"; 
    textTextareaElement.value += render_heading4("Heading4");
    textTextareaElement.value += "\r\n";
    textTextareaElement.value += "\r\n"; 
}