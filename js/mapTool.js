'use strict';

import { $, loadNavbar, log, navbarDropdown } from "./global.js";

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

var inputChangeStyle = "inputChange-1";
var buttonDisabledStyle = "buttonDisabled-1";
var tableRowSelectedStyle = "var(--colour-2)";

var fileStatus = NO_FILE_LOADED;

var data;

var selectedRouteId = null;

var map;

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
            data["currentHomeId"] = parseInt(selectTableRowById("home-"+data["currentHomeId"], e.target.parentElement.id).split("-")[1]);
            var lat = data["homeList"][data["currentHomeId"]].latitude;
            var lon = data["homeList"][data["currentHomeId"]].longitude;
            map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
        }
    });
    $("deleteHome").addEventListener("click", deleteHome);
    $("addNewHome").addEventListener("click", addNewHome);

    document.querySelector("#routeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            selectedRouteId = parseInt(selectTableRowById("route-"+selectedRouteId, e.target.parentElement.id).split("-")[1]);
        }
    });
    $("addRoute").addEventListener("click", addRoute);

    map = new ol.Map({
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
    window.map = map;
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
        currentHomeIdList: [],
        currentHomeId: null,
        routeList: [
            {
                name: null,
                homeId: -1,
                typeId: -1,
                distance: -1,
                description: "",
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

function setFileStatus(fs) {
    if (fileStatus === NO_FILE_LOADED) { enableInputs(); }
    fileStatus = fs;
    if (fs === FILE_LOADED) { $("fileStatus").textContent = "File Loaded"; }
    else if (fs === NEW_FILE_UNSAVED_CHANGES) { $("fileStatus").textContent = "New File, Unsaved Changes"; }
    if (fs === UNSAVED_CHANGES) { $("fileStatus").textContent = "Unsaved Changes"; }
    if (fs === SAVED_CHANGES) { $("fileStatus").textContent = "Saved Changes"; }
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

function clearFields() {
    var currentHomeTable = document.querySelector("#currentHomeList div table");
    for(var i=0; i<currentHomeTable.childElementCount; i++){ currentHomeTable.deleteRow(i); }

    var routeTable = document.querySelector("#routeList div table");
    for(var i=0; i<routeTable; i++) { routeTable.deleteRow(i); }
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
        $("fileName").value = data["fileName"];

        clearFields();
        setFileStatus(NEW_FILE_UNSAVED_CHANGES);
    }
    catch(e) {}
}

function loadFile(e) {
    var fileReference = e.target.files[0];
    $("fileInputText").innerHTML = fileReference.name;

    var reader = new FileReader();
    reader.onload = function(e) {

        clearFields();

        data = JSON.parse(e.target.result);

        $("fileName").value = data["fileName"];

        var currentHomeTable = document.querySelector("#currentHomeList div table");
        for(var i=0; i<data["currentHomeIdList"].length; i++){
            var homeId = data["currentHomeIdList"][i];
            var home = data["homeList"][homeId];
            addTableRow(
                currentHomeTable,
                "home-"+homeId,
                [home.name, home.latitude, home.longitude]
            );
        }
        var newSelectedRowId = null;
        if (data["currentHomeId"] !== null) newSelectedRowId = "home-" + data["currentHomeId"];
        selectTableRowById(null, newSelectedRowId);

        if(data["currentHomeId"] !== null) {
            $("deleteHome").disabled = false;
            $("deleteHome").className = "";
            var lat = data.homeList[data["currentHomeId"]].latitude;
            var lon = data.homeList[data["currentHomeId"]].longitude;
            map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
        }
    }
    reader.readAsText(fileReference);

    setFileStatus(FILE_LOADED);
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

        setFileStatus(SAVED_CHANGES);
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

function addTableRow(table, rowId, rowDataList) {
    var tr = document.createElement("TR");
    tr.id = rowId;
    for(var i=0; i<rowDataList.length; i++){
        var td = document.createElement("TD");
        var textNode = document.createTextNode(rowDataList[i]);
        td.appendChild(textNode);
        tr.appendChild(td);
    }
    table.appendChild(tr);
}

function selectTableRowById(oldSelectedRowId, newSelectedRowId) {
    if (newSelectedRowId === oldSelectedRowId) { return oldSelectedRowId; }
    if (oldSelectedRowId !== null) {
        var tr = document.getElementById(oldSelectedRowId);
        for (var i = 0; i < tr.children.length; i++) {
            tr.children[i].style.backgroundColor = "";
        }
    }
    if (newSelectedRowId === null) { return null; }
    var tr = document.getElementById(newSelectedRowId);
    for (var i = 0; i < tr.children.length; i++) {
        tr.children[i].style.backgroundColor = tableRowSelectedStyle;
    }
    return newSelectedRowId;
}

function deleteHome() {
    document.getElementById("home-"+data.currentHomeId).remove();
    for(var i=0; i<data.currentHomeIdList.length; i++) {
        if (data.currentHomeIdList[i] === data.currentHomeId) {
            data.currentHomeIdList.splice(i,1);
        }
    }
    if (data.homeList[data.currentHomeId].routeIdList.length === 0) {
        data.homeList.splice(data.currentHomeId,1);
    }
    data.currentHomeId = null;
    if (data.currentHomeIdList.length>0) {
        data.currentHomeId = data.currentHomeIdList[0];
        selectTableRowById(null,"home-"+data.currentHomeId);
    }
    else {
        $("deleteHome").disabled = true;
        $("deleteHome").className = buttonDisabledStyle;
    }
}

function readdHome() {

}

async function addNewHome(e) {
    try {
        var newHomeDetails = await multiPromptPromise("Please enter new origin.", ["name","latitude","longitude"]);

        data["homeList"].push({
            name: newHomeDetails[0],
            latitude: newHomeDetails[1],
            longitude: newHomeDetails[2],
            routeIdList: []
        });
        var newHomeId = data["homeList"].length-1;
        data["currentHomeIdList"].push(newHomeId);

        addTableRow(
            document.querySelector("#currentHomeList div table"),
            "home-"+newHomeId,
            [newHomeDetails[0],newHomeDetails[1],newHomeDetails[2]]  
        );

        var oldSelectedRowId = null;
        if (data["currentHomeId"] !== null) oldSelectedRowId = "home-"+data["currentHomeId"];
        data["currentHomeId"] = parseInt(selectTableRowById(oldSelectedRowId, "home-"+newHomeId).split("-")[1]);

        $("deleteHome").disabled = false;
        $("deleteHome").className = "";
    }
    catch(e){}
}

function deleteRoute() {

}

async function addRoute() {
    try {
        var newRouteName = await customPromptPromise("Please enter new route name.");

        data["routeList"].push({
            name: newRouteName,
            typeId: -1,
            homeId: -1,
            distance: 0
        });
        newRouteId = data["routeList"].length-1;

        addTableRow(
            document.querySelector("#routeList div table"),
            "home-"+newRouteId,
            [newRouteName,"None","None",0]
        );

        var oldSelectedRowId = null;
        if(selectedRouteId !== null) oldSelectedRowId = "route-"+selectedRouteId;
        selectedRouteId = parseInt(selectTableRowById(oldSelectedRowId, "route-"+newRouteId).split("-")[1]);

        $("deleteRoute").disabled = false;
        $("deleteRoute").className = "";
    }
    catch(e){}
}