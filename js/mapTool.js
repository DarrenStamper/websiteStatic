'use strict';

import { $, loadNavbar, log, navbarDropdown } from "./global.js";

const NO_FILE_LOADED = 0;
const NEW_FILE_UNSAVED_CHANGES = 1;
const UNSAVED_CHANGES = 2;
const SAVED_CHANGES = 3;

const IDLE = 0;
const LOAD_FILE = 1;
const SAVE_FILE = 2;
const NEW_FILE = 3;
const HOME_ENTER = 4;

var inputChangeStyle = "inputChange-1";
var buttonDisabledStyle = "buttonDisabled-1";
var tableRowSelectedStyle = "var(--colour-2)";

var fileStatus = NO_FILE_LOADED;

var data;

var selectedRouteId = null;

window.onload = async function () {

    loadNavbar().then(() => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("mapTool").className = "active";
    });

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob);
    else alert('The File APIs are not fully supported in this browser.');

    $("fileInput").addEventListener("change", loadFile);
    $("saveFile").addEventListener("click", saveFile);
    $("newFile").addEventListener("click", newFile);

    $("attributes").addEventListener("keyup", attributeChange);
    $("update").addEventListener("click", update);

    document.querySelector("#currentHomeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            data["currentHomeId"] = selectTableRowById(data["currentHomeId"], e.target.parentElement.id);
        }
    });
    $("addNewHome").addEventListener("click", addNewHome);

    document.querySelector("#routeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            selectedRouteId = selectTableRowById(selectedRouteId, e.target.parentElement.id);
        }
    });
    $("addRoute").addEventListener("click", addRoute);

    var map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([-122.420807, 37.791901]), //read the function name, it's LON then LAT
            zoom: 19
        })
    });
}

function customAlertPromise(message) {
    var customAlertContainer = $("customAlertContainer");
    var customAlert = $("customAlert");

    customAlert.querySelector(".message").innerHTML = message;
    customAlertContainer.style.display = "grid";

    return new Promise(function(resolve) {
        customAlert.addEventListener("click", function click(e) {
            if (e.target.tagName === "BUTTON") {
                customAlert.removeEventListener("click", click);
                customAlertContainer.style.display = "";
                resolve();
            }
        });
    });
}

function customConfirmPromise(message) {
    var customConfirmContainer = $("customConfirmContainer");
    var customConfirm = $("customConfirm");

    customConfirm.querySelector(".message").innerHTML = message;
    customConfirmContainer.style.display = "grid";

    return new Promise(function(resolve) {
        customConfirm.addEventListener("click", function click (e) { //click bubbles up
            if (e.target.tagName === "BUTTON") {
                customConfirm.removeEventListener("click", click);
                customConfirmContainer.style.display = "";
                if (e.target.className === "cancel") resolve(false);
                else if (e.target.className === "ok") resolve(true);
            }
        });
    });
}

function customPromptPromise(message) {
    var customPromptContainer = $("customPromptContainer");
    var customPrompt = $("customPrompt");
    var customPromptInput = customPrompt.querySelector("input");

    customPrompt.querySelector(".message").innerHTML = message;
    customPromptContainer.style.display = "grid";

    return new Promise(function(resolve, reject) {
        customPrompt.addEventListener("click", function click (e) {
            if (e.target.tagName === "BUTTON") {
                customPrompt.removeEventListener("click", click);
                customPromptContainer.style.display = "";
                if (e.target.className === "cancel") reject();
                else if (e.target.className === "ok") resolve(customPromptInput.value);
                customPromptInput.value = "";
            }
        });
    });
}

function multiPromptPromise(message, inputList) {
    var multiPromptContainer = $("multiPromptContainer");
    var multiPrompt = $("multiPrompt");

    while(multiPrompt.children[1].nodeName !== "BUTTON") {
        multiPrompt.children[1].remove();
    }

    var insertIndex = 1;
    for(var i=0; i<inputList.length; i++){
        var label = document.createElement("LABEL");
        var textNode = document.createTextNode(inputList[i] + ":");
        label.appendChild(textNode);
        multiPrompt.insertBefore(label, multiPrompt.children[insertIndex]);
        insertIndex++;

        var input = document.createElement("INPUT");
        input.setAttribute("id", inputList[i]);
        input.setAttribute("type", "text");
        multiPrompt.insertBefore(input, multiPrompt.children[insertIndex]);
        insertIndex++;
    }

    var inputElementList = [];
    for (var i=0; i<inputList.length; i++) {
        inputElementList[i] = $(inputList[i]);
    }

    multiPrompt.querySelector(".message").innerHTML = message;
    multiPromptContainer.style.display = "grid";

    return new Promise(function(resolve, reject) {
        multiPrompt.addEventListener("click", function click (e) {
            if (e.target.tagName === "BUTTON") {
                multiPrompt.removeEventListener("click", click);
                multiPromptContainer.style.display = "";
                if (e.target.className === "cancel") reject();
                else if (e.target.className === "ok") {
                    var inputValues = [];
                    for (var i=0; i<inputElementList.length; i++) {
                        inputValues[i] = inputElementList[i].value;
                    }
                    resolve(inputValues);
                }
                multiPromptContainer.value = "";
            }
        });
    });
}

function createNewDataObject() {
    data = {
        fileName: null,
        currentHomeList: [],
        currentHomeId: null,
        routeList: [
            {
                originId: null,
                typeId: null,
                name: null,
                distance: null,
                description: null,
                geometry: {
                    style: null,
                    vertices: [
                        {
                            latitude: null,
                            longitude: null,
                        }
                    ]
                }
            }
        ],
        homeList: [
            // {
            //     name: null,
            //     latitude: null,
            //     longitude: null
            //     routeIdList: []
            // }
        ],
        typeList: [
            // {
            //     name: null,
            //     routeIdList: []
            // }            
        ]
    }
}

function enableInputs() {
    $("fileName").disabled = false;
    $("fileName").className = "";

    $("update").disabled = false;
    $("update").className = "";

    $("readdHome").disabled = false;
    $("readdHome").className = "";
    $("addNewHome").disabled = false;
    $("addNewHome").className = "";

    $("addRoute").disabled = false;
    $("addRoute").className = "";
}

async function newFile() {

    if (fileStatus === NEW_FILE_UNSAVED_CHANGES || fileStatus === UNSAVED_CHANGES) {
        var userOption = await customConfirmPromise("The current file has unsaved changes.");
        if (userOption === false) return;
    }

    try
    {
        var fn = await customPromptPromise("Please enter a file name.");

        createNewDataObject();
        data["fileName"] = fn;
        $("fileStatus").textContent = "New File, Unsaved Changes";
        $("fileName").value = data["fileName"];

        if (fileStatus === NO_FILE_LOADED) { enableInputs(); }
        fileStatus = NEW_FILE_UNSAVED_CHANGES;
    }
    catch(e) {}
}

function loadFile(e) {
    var fileReference = e.target.files[0];
    $("fileUploadText").innerHTML = fileReference.name;
    console.log("name: ", fileReference.name);
    console.log("type: ", fileReference.type);
    console.log("size: ", fileReference.size);
    console.log("last modified:", fileReference.lastModifiedDate);

    var reader = new FileReader();

    reader.onload = function(e) {
        console.log(e.target.result);
        var jsonFile = JSON.parse(e.target.result);
    }

    reader.readAsText(fileReference);
    if (fileStatus === NO_FILE_LOADED) { enableInputs(); }
}

async function saveFile() {
    if (fileStatus === NO_FILE_LOADED) {
        await customAlertPromise("Cannot save file, no file loaded.");
    }
    else {
        var dataString = JSON.stringify(data, null, 2);

        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(dataString));
        element.setAttribute("download", data["fileName"] + ".json");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        fileStatus = SAVED_CHANGES;
    }
}

function attributeChange(e) {
    e.target.parentElement.className = inputChangeStyle;
    $("update").className = "";
}

function update() {
    console.log("clicked");
    if ($("fileName").parentElement.className !== "") {
        $("fileName").parentElement.className = "";
        data["fileName"] = $("fileName").value;
        log("File name set to: " + data["fileName"]);
    }

    $("update").className = buttonDisabledStyle;
}

function selectTableRowById(oldSelectedRowId, newSelectedRowId) {
    if (newSelectedRowId === oldSelectedRowId) { return oldSelectedRowId; }
    if (oldSelectedRowId !== null) {
        var tr = document.getElementById(oldSelectedRowId);
        for (var i = 0; i < tr.children.length; i++) {
            tr.children[i].style.backgroundColor = "";
        }
    }
    var tr = document.getElementById(newSelectedRowId);
    for (var i = 0; i < tr.children.length; i++) {
        tr.children[i].style.backgroundColor = tableRowSelectedStyle;
    }
    return newSelectedRowId;
}

function deleteHome() {

}

function readdHome() {

}

async function addNewHome(e) {
    try {
        var homeDetails = await multiPromptPromise("Please enter new origin.", ["name","latitude","longitude"]);
        console.log(homeDetails);

        data["homeList"].push({
            name: homeDetails[0],
            latitude: homeDetails[1],
            longitude: homeDetails[2],
            routeIdList: []
        });
        var newHomeId = data["homeList"].length-1;

        var tr = document.createElement("TR");
        tr.id="home-"+newHomeId;
        for (var i=0; i<homeDetails.length; i++) {
            var td = document.createElement("TD");
            var textNode = document.createTextNode(homeDetails[i]);
            td.appendChild(textNode);
            tr.appendChild(td);
        }
        document.querySelector("#currentHomeList div table").appendChild(tr);
        data["currentHomeId"] = selectTableRowById(data["currentHomeId"], tr.id);
    }
    catch(e){}
}

function deleteRoute() {

}

function addRoute() {
    var route = document.createElement("LI");
    var textNode = document.createTextNode("");
}