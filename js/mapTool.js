'use strict';

import { loadNavbar, navbarDropdown } from "./global.js";

function $(val) { return document.getElementById(val); }

window.onload = async function () {
    
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("mapTool").className = "active";
    });

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }

    $("load").addEventListener("change", load)

    var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([37.41, 8.82]),
          zoom: 4
        })
      });
}

function load(e){
    console.log("load");
}