'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";

window.onload = async function () {
    
    //load navbar
    loadNavbar().then( () => document.getElementById("navbarIcon").addEventListener("click", navbarDropdown) );
}