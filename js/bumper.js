'use strict';

/* The Intersection Observer API lets code register a callback function that is executed
   whenever an element they wish to monitor enters or exits another element (or the 
   viewport). Historically, detecting visibility of an element, or the relative visibility
   of two elements in relation to each other, has been a difficult task. Intersection
   information is needed for:
   > Lazy-loading of images or other content as a page is scrolled
   > infinite scrolling
   > Reporting of visibility of advertisements in order to calculate ad revenues
   > Deciding whether or not to perform tasks or animation processes based on
     whether or not the user will see the result.

   https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
*/

import { loadNavbar, navbarDropdown } from "./global.js";

/* An Immediately-invoked Function Expression (IIFE for friends) is a way to execute
   functions immediately, as soon as they are created. IIFEs are very useful because
   they don’t pollute the global object, and they are a simple way to isolate variables
   declarations. We basically have a function defined inside parentheses, and then we
   append () to execute that function: (function)(). Those wrapping parentheses are
   actually what make our function, internally, be considered an expression. Otherwise,
   the function declaration would be invalid, because we didn’t specify any name.
*/
(() => {
    /* The DOMContentLoaded event fires when the initial HTML document has been completely
       loaded and parsed, without waiting for stylesheets, images, and subframes to finish
       loading.
    */
    window.addEventListener('DOMContentLoaded', async function (event) {
        console.log('DOM fully loaded and parsed');
        
        //load navbar
        loadNavbar().then( () => {
            document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
            document.getElementById("bumper").className = "active";
        });
    });
})()
  

// window.onload = async function () {
    
//     //load navbar
//     loadNavbar().then( () => {
//         document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
//         document.getElementById("bumper").className = "active";
//     });
// }