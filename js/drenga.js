'use strict';

import { xhttprequest_get, randInt } from "../js/_global.js";

let ruleset_list_nameList = ["legacy", "casual", "retards"];
let ruleset_list = [];

let ruleset_passive = [];
var ruleset_passive_minTime = 90;
var ruleset_passive_maxTime = 180;

//default settings
var ruleset_ruleMode = 1; //random, numbered
var ruleset_list_index = 0;
var ruleset_passive_active = false;

//game state
var menuOpen = false;
var bricksMoved = 0;
var ruleset_passive_timerSet = false;

//script variables
var addressPrefix = "/Home/DrengaRules?ruleset=";

window.onload = function () {

    //input event
    window.onkeydown = input;

    //reset event
    document.getElementsByClassName("drenga-reset-icon")[0].addEventListener("click", function () { reset(); });

    //menu open events
    document.getElementsByClassName("drenga-settings-icon")[0].addEventListener("click", function () {
        document.getElementsByClassName("drenga-settings-background")[0].style.display = "grid";
        menuOpen = true;
    });
    document.getElementsByClassName("drenga-info-icon")[0].addEventListener("click", function () {
        document.getElementsByClassName("drenga-info-background")[0].style.display = "grid";
        menuOpen = true;
    });

    //menu button events

    document.getElementById("random").addEventListener("click", function () { setMode(event); });
    document.getElementById("numbered").addEventListener("click", function () { setMode(event); });

    for (var i = 0; i < ruleset_list_nameList.length; i++) {
        document.getElementById(ruleset_list_nameList[i]).addEventListener("click", function () { setRuleset(event); });
    }

    document.getElementById("passiveRules").addEventListener("click", function () { passiveRules_set(event); });

    //menu close events
    window.onclick = function () { closeMenu(event); };

    //load rulesets
    for (var i = 0; i < ruleset_list_nameList.length; i++) {
        var ruleset = xhttpRequest_get(addressPrefix + ruleset_list_nameList[i], addRules);
        ruleset_list.push(ruleset);
    }

    //load passive ruleset
    ruleset_passive = xhhtpRequest_get(addressPrefix + "passive", addRules);

    //set active settings

    if (ruleMode == 0) document.getElementById("random").classList = "active";
    else document.getElementById("numbered").classList = "active";

    document.getElementById(ruleset_list_nameList[ruleset_list_index]).classList = "active";

    if (ruleset_passive_active) document.getElementById("passiveRules").classList = "active";
}

function addRules(xhttp, passiveRules) {

    var json = JSON.parse(xhttp.response);

    var ruleset = [];

    for (var key in json) {
        if (json.hasOwnProperty(key)) {

            //same name, same description
            if (typeof json[key] == "string") ruleset.push({ title: key, description: json[key] });

            //same name, multiple descriptions
            else if (typeof json[key] == "object") {
                for (var description = 0; description < json[key].length; description++) ruleset.push({ title: key, description: json[key][description] });
            }
        }
    }

    return ruleset;
}

function input(event) {

    //prevent visiting previous webpage
    if (event.keyCode === 8) event.preventDefault();

    if (menuOpen == false) {

        //numbered
        if (ruleset_ruleMode == 1) {

            var input = document.getElementsByClassName("drenga-input")[0];

            //enter key
            if (event.keyCode === 13 && input.value != "") {

                input.placeholder = "";
                var ruleIndex = Number.parseInt(input.value) - 1;
                setRule(ruleIndex);
                input.value = "";
            }

            //backspace
            else if (event.keyCode === 8) {
                event.preventDefault();
                if (input.value.length < 2) input.value = "";
                else input.value = input.value.charAt(0);
            }

            //character limit
            else if (input.value.length == 2);

            //numbers, numlock numbers
            else if ( ((47 < event.keyCode && event.keyCode < 58) || (95 < event.keyCode && event.keyCode < 107)) == false );

            //leading zeros
            else if (input.value == "" && event.key == "0");

            //range
            else if (Number.parseInt(input.value + event.key) <= ruleset_list[ruleset_list_index].length) input.value += event.key;
        }

        //random
        else if (ruleset_ruleMode == 0) {

            //enter, r, spacebar
            if (event.keyCode == 13 || event.keyCode == 82 || event.keyCode == 32) {
                var ruleIndex = randInt(0, ruleset_list[ruleset_list_index].length);
                setRule(ruleIndex);
            }
        }
    }
}

function setRule(ruleIndex) {

    var input = document.getElementsByClassName("drenga-input")[0];

    bricksMoved++;
    document.getElementsByClassName("drenga-bricks-moved")[0].innerHTML = bricksMoved;

    var rule = ruleset_list[ruleset_list_index][ruleIndex];

    var title = rule.title;
    var description = rule.description;

    document.getElementsByTagName("h1")[0].innerHTML = title;
    document.getElementsByTagName("h2")[0].innerHTML = description;
}

function reset() {
    document.getElementsByTagName("h1")[0].innerHTML = "Drenga!";
    document.getElementsByTagName("h2")[0].innerHTML = "";
    if (ruleMode == 0) document.getElementsByClassName("drenga-input")[0].placeholder = "Random";
    else if (ruleMode == 1) document.getElementsByClassName("drenga-input")[0].placeholder = "Start typing...";
    document.getElementsByClassName("drenga-input")[0].value = "";
    document.getElementsByClassName("drenga-bricks-moved")[0].innerHTML = "0";
    bricksMoved = 0;
}

function setMode(event) {

    var buttonRandom = document.getElementById("random");
    var buttonNumbered = document.getElementById("numbered");

    if (event.currentTarget.id == "random") {
        buttonRandom.classList = "active";
        buttonNumbered.classList = "";
        ruleMode = 0;
        document.getElementsByClassName("drenga-input")[0].placeholder = "Random";
    }
    else if (event.currentTarget.id == "numbered") {
        buttonRandom.classList = "";
        buttonNumbered.classList = "active";
        ruleMode = 1;
        document.getElementsByClassName("drenga-input")[0].placeholder = "Start typing...";
    }
}

function setRuleset(event) {

    //skip active ruleset click
    if (event.currentTarget.id != ruleset_list_nameList[ruleset_list_index]) {

        for (var i = 0; i < ruleset_list_nameList.length; i++) {

            //set active if target
            if (event.currentTarget.id == ruleset_list_nameList[i]) {
                document.getElementById(ruleset_list_nameList[i]).classList = "active";
                ruleset_list_index = i;
            }

            //unset
            else {
                document.getElementById(ruleset_list_nameList[i]).classList = "";
            }
        }
        reset();
    }
}

function passiveRules_set(event) {

    if (event.currentTarget.id == "passiveRules") {
        var buttonPassiveRules = document.getElementById("passiveRules");

        if (ruleset_passive_active == false) {
            buttonPassiveRules.classList = "active";
            ruleset_passive_active = true;

            if (ruleset_passive_timerSet) {
                ruleset_passive_timerSet = false;
                var milliseconds = randInt(ruleset_passive_minTime, ruleset_passive_maxTime) * 1000;
                setTimeout(passiveRules_show, milliseconds);
            }

        }
        else {
            buttonPassiveRules.classList = "";
            ruleset_passive_active = false;
        }
    }
}

function passiveRules_show() {

    ruleset_passive_timerSet = false;

    //if option unchanged since timeout set
    if (ruleset_passive_active) {

        //get rule
        var ruleIndex = randInt(0, ruleset_passive.length);

        //display
        document.getElementsByClassName("drenga-passiveRulesPopUp-background")[0].style.display = "grid";
        document.getElementsByClassName("drenga-passiveRulesPopUp-title")[0].innerHTML = ruleset_passive[ruleIndex].title;
        document.getElementsByClassName("drenga-passiveRulesPopUp-description")[0].innerHTML = ruleset_passive[ruleIndex].description;

        //next
        ruleset_passive_timerSet = true;
        var milliseconds = randInt(ruleset_passive_minTime, ruleset_passive_maxTime) * 1000;
        setTimeout(passiveRules_show, milliseconds);
    }
}

function closeMenu(event) {

    //event capture [descend tree] selects first node for clickable adjacent event nodes, will use event chaining to trigger click events that would otherwise never get clicked
    if (event.target == document.getElementsByClassName("drenga-settings-background")[0]) {
        document.getElementsByClassName("drenga-info-background")[0].click();
    }
    else if (event.target == document.getElementsByClassName("drenga-info-background")[0]) {
        document.getElementsByClassName("drenga-passiveRulesPopUp-background")[0].click();
    }
    else if (event.target == document.getElementsByClassName("drenga-passiveRulesPopUp-background")[0]) {
        document.getElementsByClassName("drenga-settings-background")[0].style.display = "none";
        document.getElementsByClassName("drenga-info-background")[0].style.display = "none";
        document.getElementsByClassName("drenga-passiveRulesPopUp-background")[0].style.display = "none"; 
        menuOpen = false;
    }
}
