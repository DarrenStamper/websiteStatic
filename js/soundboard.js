'use strict';

import { $, loadNavbar, navbarDropdown } from "./global.js";

var model = {

    soundNames: [
        "audio/soundboard/hurghhhh.aac"
    ],

    soundObjects: {},

    soundNames_get() { return this.soundNames; },

    soundObjects_get(soundName) {
        var soundObject;
        if (this.soundObjects.hasOwnProperty(soundName)) { return this.soundObjects[soundName]; }
        else {
            this.soundObjects[soundName] = new Audio(soundName);
            return this.soundObjects[soundName];
        }
    }
}

var view = {

    soundboard: {

        soundboardElement: $("soundboard")
    }

}

window.onload = async function () {
    
    //build html

    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        //document.getElementById("soundboard").className = "active";
    });

    var sounds = model.soundNames_get();
    sounds.forEach(sound => {
        var buttonElement = document.createElement("button");
        buttonElement.value = sound;
        buttonElement.innerHTML = sound.split(".")[0];
        $("soundboard").appendChild(buttonElement);
    });

    //set event listeners

    view.soundboard.soundboardElement.addEventListener("click", event => {
        var sound = model.soundObjects_get(event.target.value);
        sound.play();
    });
}