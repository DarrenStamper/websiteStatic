'use strict';

/*
    Index of functions:

    > GENERIC

      > $(id)
      > xhttpRequest_get(url, callback)

    > VIEW

      > includeHTML()
      > loadNavbar()
      > log()
      > navbarDropdown()
      > randInt()
*/

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

var color0 = "rgb(000,000,000)";
var color1 = "rgb(030,030,030)";
var color2 = "rgb(037,037,037)";
var color3 = "rgb(060,060,060)";
var color4 = "rgb(071,071,071)";
var color5 = "rgb(000,128,000)";

var addressPrefix = "";

//GENERIC

/**
 * Shorthand alias for document.getElementById
 * @link [The Javascript Dollar Sign Function](https://osric.com/chris/accidental-developer/2008/04/the-javascript-dollar-sign-function/)
 * 
 * @param {String} id
 * @returns {HTMLElement} Element for given id
 */
function $(id) { return document.getElementById(id); }

export { $ };

/**
 * Generic XMLHttpRequest that gets resource from given url and passes it as parameter to given callback function
 * 
 * @param {String} url 
 * @param {String} callback 
 */
function xhttpRequest_get(url, callback) {

    const xhttp = new XMLHttpRequest();

    // success
    xhttp.addEventListener("load", (event) => callback(xhttp) );

    // failure
    xhttp.addEventListener("error", (event) => alert('Oops! Something went wrong.') );

    // create request
    xhttp.open("GET", url);

    // send
    xhttp.send();
}

export { xhttpRequest_get };

//VIEW

/**
 * Navbar object
 */
var navbar = {   
    
    linkActiveStyle: "active",

    elementId: "navbar",
    iconElementId: "navbarIcon",

    element: null,
    iconElement: null,

    load() { 

        return new Promise((resolve) => {

            const xhttp = new XMLHttpRequest();
    
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    var navbar = document.getElementById("navbar");
                    if (this.status == 200) {
                        navbar.innerHTML = this.responseText;
                        resolve();
                    }
                    if (this.status == 404) navbar.innerHTML = "Page not found.";
                }
            }
            xhttp.open("GET", "html/navbar.html");
            xhttp.send();
        });
    },

    initialise(activeLinkId) {
        this.element = document.getElementById(this.elementId);
        this.iconElement = document.getElementById(this.iconElementId);

        //dropdown on click
        this.iconElement.addEventListener('click', () => this.dropdown() );

        document.getElementById(activeLinkId).className = this.linkActiveStyle;
    },

    dropdown() {
        if (this.element.className === "collapsed") this.element.className = "expanded";
        else this.element.className = "collapsed";
    }
};

export { navbar };

/**
 * dialog box
 */
var dialog = {

    alertContainerElementId: 'alertContainer',
    alertElementId: 'alert',

    confirmContainerElementId: 'confirmContainer',
    confirmElementId: 'confirm',

    promptContainerElementId: 'promptContainer',
    promptElementId: 'prompt',

    multiPromptContainerElementId: 'multiPromptContainer',
    multiPromptElementId: 'multiPrompt',

    alertContainerElement: null,
    alertElement: null,
    confirmContainerElement: null,
    confirmElement: null,
    promptContainerElement: null,
    promptElement: null,
    multiPromptContainerElement: null,
    multiPromptElement: null,

    initialise() {
        this.alertContainerElement = document.getElementById(this.alertContainerElementId);
        this.alertElement = document.getElementById(this.alertElementId);

        this.confirmContainerElement = document.getElementById(this.confirmContainerElementId);
        this.confirmElement = document.getElementById(this.confirmElementId);

        this.promptContainerElement = document.getElementById(this.promptContainerElementId);
        this.promptElement = document.getElementById(this.promptElementId);

        this.multiPromptContainerElement = document.getElementById(this.multiPromptContainerElementId);
        this.multiPromptElement = document.getElementById(this.multiPromptElementId);
    },

    alert(message) {
        this.alertElement.querySelector(".message").innerHTML = message;
        this.alertContainerElement.style.display = "grid";
    
        return new Promise( resolve => {
            alertElement.addEventListener("click", function click(e) {
                if (e.target.tagName === "BUTTON") {
                    this.alertElement.removeEventListener("click", click);
                    this.alertContainerElement.style.display = "";
                    resolve();
                }
            }.bind(this));
        });
    },
    
    confirm(message) {  
        this.confirmElement.querySelector(".message").innerHTML = message;
        this.confirmContainerElement.style.display = "grid";
    
        return new Promise( resolve => {
            this.confirmElement.addEventListener("click", function click (e) { //click bubbles up
                if (e.target.tagName === "BUTTON") {
                    this.confirmElement.removeEventListener("click", click);
                    this.confirmContainerElement.style.display = "";
                    if (e.target.className === "cancel") resolve(false);
                    else if (e.target.className === "ok") resolve(true);
                }
            }.bind(this));
        });
    },
    
    prompt(message) {    
        this.promptElement.querySelector(".message").innerHTML = message;
        this.promptContainerElement.style.display = "grid";
    
        return new Promise( (resolve, reject) => {
            this.promptElement.addEventListener("click", function click (e) {
                if (e.target.tagName === "BUTTON") {
                    this.promptElement.removeEventListener("click", click);
                    this.promptContainerElement.style.display = "";
                    if (e.target.className === "cancel") resolve(false);
                    else if (e.target.className === "ok") resolve(this.promptElement.querySelector("input").value);
                    this.promptElement.querySelector("input").value = "";
                }
            }.bind(this));
        });
    },

    multiPrompt(message, inputList, inputValueList) {
    
        while(this.multiPromptElement.children[1].nodeName !== "BUTTON") {
            this.multiPromptElement.children[1].remove();
        }
    
        var insertIndex = 1;
        for(var i=0; i<inputList.length; i++){
            var label = document.createElement("LABEL");
            var textNode = document.createTextNode(inputList[i] + ":");
            label.appendChild(textNode);
            this.multiPromptElement.insertBefore(label, this.multiPromptElement.children[insertIndex]);
            insertIndex++;
    
            var input = document.createElement("INPUT");
            input.id = inputList[i];
            input.type = "text";
            if(inputValueList !== null) input.value = inputValueList[i];
            this.multiPromptElement.insertBefore(input, this.multiPromptElement.children[insertIndex]);
            insertIndex++;
        }
    
        var inputElementList = [];
        for (var i=0; i<inputList.length; i++) {
            inputElementList[i] = document.getElementById(inputList[i]);
        }
    
        this.multiPromptElement.querySelector(".message").innerHTML = message;
        this.multiPromptContainerElement.style.display = "grid";
    
        return new Promise( (resolve, reject) => {
            this.multiPromptElement.addEventListener("click", function click (e) {
                if (e.target.tagName === "BUTTON") {
                    this.multiPromptElement.removeEventListener("click", click);
                    this.multiPromptContainerElement.style.display = "";
                    if (e.target.className === "cancel") resolve(false);
                    else if (e.target.className === "ok") {
                        var inputValues = [];
                        for (var i=0; i<inputElementList.length; i++) {
                            inputValues[i] = inputElementList[i].value;
                        }
                        resolve(inputValues);
                    }
                    this.multiPromptContainerElement.value = "";
                }
            }.bind(this));
        });
    }
};

export { dialog };

/**
 * Loads the content of html include files into elements with the custom attribute: w3-include-html="html/someHtml.html"
 * 
 * - For each element in document
 *   - If element has attribute: w3-include-html
 *   - create xmlHttpRequest with attribute value
 *   - set content of element to contents of response
 *   - remove attribute from element
 * 
 */
function includeHTML() { //load common html

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

export { includeHTML };

/**
 *  Loads id="navbar" html element from "html/navbar.html"
 *  - creates XMLHttpRequest retreving navbar.html
 *  - sets navbar element innerHtml to navbar.html content
 */
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

export { loadNavbar };

/**
 * Appends string to id="log" element
 * - Adds string to log element
 * - repaint window
 * - scroll to bottom of log to display latest entry
 * 
 * @param {string} str 
 */
function log(str) { //activity log
    document.getElementById("log").textContent += str + "\n";
    //this feels dirty...
    requestAnimationFrame(() => { // fires before next repaint
        requestAnimationFrame(() => { // fires before the _next_ next repaint which is effectively _after_ the next repaint
            document.getElementById("log").scrollTop = 99999999;
        });
    });
}

export { log };

/**
 * Switches id="navbar" between collapsed and expanded
 */
function navbarDropdown() { //responsive navbar
    var x = document.getElementById("navbar");
    if (x.className === "collapsed") { x.className = "expanded"; }
    else { x.className = "collapsed"; }
}

export { navbarDropdown };

/**
 * Returns random int within range: min [inclusive] - max [exclusive]
 * 
 * @param {number} min inclusive
 * @param {number} max exclusive
 * @returns {number} random int within range: min [inclusive] - max [exclusive]
 */
function randInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export { randInt };