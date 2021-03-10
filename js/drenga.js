'use strict';

import { loadNavbar, navbarDropdown, xhttpRequest_get, randInt } from "./global.js";

let ruleset_list_nameList = ["legacy", "casual", "retards"];
let ruleset_list = [null, null, null];

let ruleset_passive = null;
var ruleset_passive_minTime = 90; //default: 90
var ruleset_passive_maxTime = 180; //default 180

//default settings
var ruleset_ruleMode = 1; //random, numbered
var ruleset_list_index = 0;
var ruleset_passive_active = false;

//game state
var menuOpen = false;
var passiveRuleVisible = false;
var bricksMoved = 0;
var ruleset_passive_timerSet = false;

//script variables
var addressPrefix = "json/drenga/rules_";
var addressSuffix = ".json"

window.onload = function () {

    //load navbar
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("drenga").className = "active";
    });

    //input event

    window.onkeydown = input;

    var numpad = document.getElementsByClassName("numpad")[0];
    for (var c = 0; c < numpad.children.length; c++) {
        if (c != 10){
            numpad.children[c].addEventListener("click", input);
        }
    }

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
        xhttpRequest_get(addressPrefix + ruleset_list_nameList[i] + addressSuffix, addRules);
    }

    //load passive ruleset
    xhttpRequest_get(addressPrefix + "passive" + addressSuffix, addRules);

    //set active settings

    if (ruleset_ruleMode == 0) {
        document.getElementById("random").classList = "active";
    }
    else {
        document.getElementById("numbered").classList = "active";
        if (window.innerWidth < 800){
            document.getElementsByClassName("drenga-grid")[0].className = "drenga-grid drenga-grid-numpad-enabled";
            document.getElementsByClassName("numpad")[0].className = "numpad numpad-enabled";
        }
    }

    document.getElementById(ruleset_list_nameList[ruleset_list_index]).classList = "active";

    if (ruleset_passive_active) document.getElementById("passiveRules").classList = "active";
}

function addRules(xhttp) {

    var json = JSON.parse(xhttp.response);
    var jsonRuleset = json["Ruleset List"];

    var ruleset = [];

    //get ruleset
    for (var key in jsonRuleset) {
        if (jsonRuleset.hasOwnProperty(key)) {

            //same name, same description
            if (typeof jsonRuleset[key] == "string") ruleset.push({ title: key, description: jsonRuleset[key] });

            //same name, multiple descriptions
            else if (typeof jsonRuleset[key] == "object") {
                for (var description = 0; description < jsonRuleset[key].length; description++) ruleset.push({ title: key, description: jsonRuleset[key][description] });
            }
        }
    }

    //store ruleset
    var ruleset_name = json["Ruleset Name"];
    if (ruleset_name == "passive") ruleset_passive = ruleset;
    else  for (var i = 0; i < ruleset_list_nameList.length; i++) if (ruleset_list_nameList[i] == ruleset_name) ruleset_list[i] = ruleset;
}

function input(event) {

    var key;

    if (event.target.nodeName == "BODY") key = event.key;

    else if (event.target.nodeName == "BUTTON") key = event.target.value;
    
    //prevent backspace navigating to previous website
    if (key == "Backspace") event.preventDefault();

    if (menuOpen == false && passiveRuleVisible == false) {

        //numbered
        if (ruleset_ruleMode == 1) {

            var input = document.getElementsByClassName("drenga-input")[0];

            //enter key
            if (key == "Enter" && input.value != "") {

                input.placeholder = "";
                var ruleIndex = Number.parseInt(input.value) - 1;
                setRule(ruleIndex);
                input.value = "";
            }

            //backspace
            else if (key == "Backspace") {
                if(event.target.nodeName == "BODY") event.preventDefault(); /* Is this neccessary */
                if (input.value.length < 2) input.value = "";
                else input.value = input.value.charAt(0);
            }

            //character limit
            else if (input.value.length == 2);

            //numbers, numlock numbers
            else if (parseInt(key) < 0 && parseInt(key) > 9);

            //leading zeros
            else if (input.value == "" && key == "0");

            //range
            else if (Number.parseInt(input.value + key) <= ruleset_list[ruleset_list_index].length) input.value += key;
        }

        //random
        else if (ruleset_ruleMode == 0) {

            //enter, r, spacebar
            if (key == "Enter" || key == "r" || key == " ") {
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
    if (ruleset_ruleMode == 0) document.getElementsByClassName("drenga-input")[0].placeholder = "Random";
    else if (ruleset_ruleMode == 1) document.getElementsByClassName("drenga-input")[0].placeholder = "Start typing...";
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
        ruleset_ruleMode = 0;
        document.getElementsByClassName("drenga-input")[0].placeholder = "Random";
        document.getElementsByClassName("drenga-grid")[0].className = "drenga-grid";
        document.getElementsByClassName("numpad")[0].className = "numpad";
    }
    else if (event.currentTarget.id == "numbered") {
        buttonRandom.classList = "";
        buttonNumbered.classList = "active";
        ruleset_ruleMode = 1;
        document.getElementsByClassName("drenga-input")[0].placeholder = "Start typing...";
        if (window.innerWidth < 800){
            document.getElementsByClassName("drenga-grid")[0].className = "drenga-grid drenga-grid-numpad-enabled";
            document.getElementsByClassName("numpad")[0].className = "numpad numpad-enabled";
        }
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

            //prevents button spam generating loads of timeouts, however if turned off, 
            //timeout keeps going, so if turned on prior to timeout completion, rule could
            //pop up earlier than min time
            if (ruleset_passive_timerSet == false) {
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
        if (menuOpen == false)
        {
            document.getElementsByClassName("drenga-passiveRulesPopUp-background")[0].style.display = "grid";
            document.getElementsByClassName("drenga-passiveRulesPopUp-title")[0].innerHTML = ruleset_passive[ruleIndex].title;
            document.getElementsByClassName("drenga-passiveRulesPopUp-description")[0].innerHTML = ruleset_passive[ruleIndex].description;
            passiveRuleVisible = true;
        }

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
        passiveRuleVisible = false;
    }
}
