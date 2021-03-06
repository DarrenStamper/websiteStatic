﻿'use strict';

/*
  greys
    30, 30, 30
    37, 37, 37
    60, 60, 60
    71, 71, 71

  greens
    000, 128, 000
    000, 229, 000
    127, 255, 127
*/

//colors

var color0 = "rgb(000,000,000)";
var color1 = "rgb(030,030,030)";
var color2 = "rgb(037,037,037)";
var color3 = "rgb(060,060,060)";
var color4 = "rgb(071,071,071)";
var color5 = "rgb(000,128,000)";

var addressPrefix = "";

//load common html
function includeHTML() {
    var z, i, elmnt, fileName, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        fileName = elmnt.getAttribute("w3-include-html");
        if (fileName) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", addressPrefix + fileName, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

//responsive navbar

function responsiveNavbar() {
    var x = document.getElementById("navbar");
    if (x.className === "navbarMinimised") {
        x.className += "navbarExpanded";
    } else {
        x.className = "navbarMinimised";
    }
}

//get
function xhttpRequest_get(url, callback) {

    const xhttp = new XMLHttpRequest();

    // success
    xhttp.addEventListener("load", function (event) {
        callback(xhttp);
    });

    // failure
    xhttp.addEventListener("error", function (event) {
        alert('Oops! Something went wrong.');
    });

    // create request
    xhttp.open("GET", url);

    // send
    xhttp.send();
}

//random int
function randInt(min, max) { //inclusive, exclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export { includeHTML, responsiveNavbar, xhttpRequest_get, randInt };