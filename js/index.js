'use strict';

import { includeHTML } from "./global.js";

window.onload = function () {
    
    //load common html
    includeHTML();

    //display webpage
    document.getElementsByTagName("body")[0].style.opacity = "1";
}
