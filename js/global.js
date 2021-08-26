'use strict';

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

/* The dollar sign is commonly used as a shortcut to the function document.getElementById()
   because this function is fairly verbose and used frequently. There is nothing about $
   that requires it to be used this way, however. But it has been the convention, although
   there is nothing in the language to enforce it. 

   https://www.thoughtco.com/and-in-javascript-2037515
*/
function $(x) {return document.getElementById(x);}

//load common html
function includeHTML() {

    //to use this function add following div element to code, changing where appropriate
    //<div w3-include-html="html/navbar.html"></div>

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

//include navbar
function loadNavbar() {
    console.log("¯\\_(ツ)_/¯");
    return new Promise((resolve) => {
   
        const xhttp = new XMLHttpRequest();
    
        xhttp.onreadystatechange = function () {
            if (this.readyState == 4) {
                var navbar = document.getElementById("navbar");
                if (this.status == 200) { 
                    navbar.innerHTML = this.responseText;
                    resolve();
                }
                if (this.status == 404) { navbar.innerHTML = "Page not found."; }
            }
        }
        xhttp.open("GET", "html/navbar.html");
        xhttp.send();
    });
}

//activity log
function log(val) {
    $("log").textContent += val + "\n";
    //this feels dirty...
    requestAnimationFrame(() => { // fires before next repaint
        requestAnimationFrame(() => { // fires before the _next_ next repaint which is effectively _after_ the next repaint
            $("log").scrollTop = 99999999;
        });
    });
}

//responsive navbar
function navbarDropdown() {
    var x = document.getElementById("navbar");
    if (x.className === "collapsed") { x.className = "expanded"; }
    else { x.className = "collapsed"; }
}

function randInt(min, max) { //inclusive, exclusive
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

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

export { $, includeHTML, loadNavbar, log, navbarDropdown, randInt, xhttpRequest_get };