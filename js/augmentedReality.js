'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";

function $(val) { return document.getElementById(val); }

window.onload = async function () {
    
    //load navbar
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("augmentedReality").className = "active";
    });
}