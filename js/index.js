'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";

//constants

var parameters = {

    timeout: 1800,

    responsive: {
        0: 3,       //minPixels, numOfSlides
        500: 4,
        600: 5,
        700: 7
    }
}

var carouselElement = document.getElementsByClassName('carousel')[0]
var slidesElement = document.getElementsByClassName('slides')[0]

//variables

var slideCount;
var slideWidth;
var slideOffsetMax;

window.onload = async function () {
    
    //load navbar
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("index").className = "active";
    });

    //clone last slide and put left of first slide        
    var lastSlide = slidesElement.lastElementChild.cloneNode(true);
    slidesElement.insertBefore(lastSlide, slidesElement.firstElementChild);

    window.addEventListener( 'resize', carousel_resize );
    carousel_resize();

    //begin
    setTimeout( carousel_nextSlide, parameters.timeout);
}

//functions

function carousel_resize() {
    
    //slide count
    for ( const [key, value] of Object.entries(parameters.responsive) ) {
        if ( carouselElement.offsetWidth > key ) { slideCount = value; }
    }

    //slide width
    slideWidth = carouselElement.offsetWidth / slideCount;
    for (var i=0; i<slidesElement.children.length; i++) {
        slidesElement.children[i].style.width = slideWidth + "px";
    }

    //slide offset
    for (var i=0; i<slidesElement.children.length; i++) {
        slidesElement.children[i].style.left = (i-1)*slideWidth + "px";
    }

    //slides height
    var slidesHeight = 0;
    for (var i=0; i<slidesElement.children.length; i++) {
        if (slidesElement.children[i].offsetHeight > slidesHeight) {
            slidesHeight = slidesElement.children[i].offsetHeight;
        }
    }
    slidesElement.style.height = slidesHeight + "px";
}

function carousel_nextSlide() {

    //decrement slide offset
    for (var i=0; i<slidesElement.children.length; i++) {
        slidesElement.children[i].style.left = (i-2)*slideWidth +"px";
    }

    slidesElement.removeChild(slidesElement.firstElementChild);
    var firstSlide = slidesElement.firstElementChild.cloneNode(true);
    firstSlide.style.left = slideWidth*(slidesElement.children.length-1) + "px";
    slidesElement.appendChild(firstSlide);

    setTimeout( carousel_nextSlide, parameters.timeout);
}