'use strict';

import { includeHTML, responsiveNavbar } from "./global.js";

window.onload = function () {
    
    //load common html
    includeHTML();

    //display webpage
    document.getElementsByTagName("body")[0].style.opacity = "1";
}

//can't directly reference module function from html
function cunt() {
    console.log("Fuck this shit cunt.");
    responsiveNavbar();
}