'use strict';

import { $, loadNavbar, log, navbarDropdown } from "./global.js";

var DISABLE = true;
var ENABLE = false;

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

var defaultStyle = "";
var inputChangeStyle = "inputChange-1";
var inputDisabledStyle = "inputDisabled-1";
var buttonDisabledStyle = "buttonDisabled-1";
var selectDisabledStyle = "selectDisabled-1";
var textareaDisabledStyle = "textareaDisabled-1";
var tableRowSelectedStyle = "var(--colour-2)";

var fileStatus = NO_FILE_LOADED;

var data;

var selectedTypeId = null;
var selectedOriginId = null;
var selectedRoutesId = null;
var selectedTripsId = null;

var map;

window.onload = async function () {
    loadNavbar().then(() => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("mapTool").className = "active";
    });

    //file

    if (window.File && window.FileReader && window.FileList && window.Blob);
    else alert('The File APIs are not fully supported in this browser.');

    $("fileInput").addEventListener("change", loadFile);
    $("saveFile").addEventListener("click", saveFile);
    $("newFile").addEventListener("click", newFile);

    //attributes

    $("fileName").addEventListener("keyup", e => {
        e.target.parentElement.className = inputChangeStyle;
        enableOrDisableListOfInputs(["update"],ENABLE,defaultStyle);
    });
    $("fileNameUpdate").addEventListener("click", () => {
        data["fileName"] = $("fileName").value;
        $("fileName").parentElement.className = "";
        enableOrDisableListOfInputs(["update"],DISABLE,inputDisabledStyle);
    });

    //types

    document.querySelector("#typesList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            var oldSelectedRowId = null;
            if (selectedTypeId !== null) oldSelectedRowId = "type-"+selectedTypeId;
            selectedTypeId = parseInt(selectTableRowById(oldSelectedRowId, e.target.parentElement.id).split("-")[1]);
            enableOrDisableListOfInputs(["deleteType","editType"],ENABLE,defaultStyle);
        }
    });
    $("deleteType").addEventListener("click", deleteType);
    $("editType").addEventListener("click", editType);
    $("addType").addEventListener("click", addType);
}

//user input event

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


        //reset form
        clearTables(["typesList","originsList","routeList"]);
        clearDropdowns(["filterType","filterOrigin","routeType","routeOrigin"],2);
        clearRouteDetails();
        enableOrDisableListOfInputs(["deleteOrigin","editOrigin","deleteType","editType"],DISABLE,buttonDisabledStyle);
        enableOrDisableListOfInputs(["routeType","routeOrigin"],DISABLE,selectDisabledStyle);
        enableOrDisableListOfInputs(["routeName"],DISABLE,inputDisabledStyle);
        enableOrDisableListOfInputs(["routeDescription"],DISABLE,textareaDisabledStyle);

        setFileStatus(NEW_FILE_UNSAVED_CHANGES);
    }
    catch(e) { console.log(e); }
}

function loadFile(e) {
    var fileReference = e.target.files[0];
    $("fileInputText").innerHTML = fileReference.name;

    var reader = new FileReader();
    reader.onload = function(e) {

        //reset form
        clearTables(["typesList","originsList","routeList"]);
        clearDropdowns(["filterType","filterOrigin","routeType","routeOrigin"],2);
        clearRouteDetails();
        enableOrDisableListOfInputs(["deleteOrigin","editOrigin","deleteType","editType"],DISABLE,buttonDisabledStyle);
        enableOrDisableListOfInputs(["routeType","routeOrigin"],DISABLE,selectDisabledStyle);
        enableOrDisableListOfInputs(["routeName"],DISABLE,inputDisabledStyle);
        enableOrDisableListOfInputs(["routeDescription"],DISABLE,textareaDisabledStyle);

        data = JSON.parse(e.target.result);

        $("fileName").value = data["fileName"];
        $("lastOpened").value = data["lastOpened"];

        //types

        for (var i=0; i<data.typeList.length; i++) {
            addTableRow(
                document.querySelector("#typesList div table"),
                "type-"+i,
                [data.typeList[i].name,data.typeList[i].routeIdList.length]
            );
        }

        //origins
        for (var i=0; i<data.homeList.length; i++) {
            addTableRow(
                document.querySelector("#originsList div table"),
                "home-"+i,
                [data.homeList[i].name,data.homeList[i].latitude,data.homeList[i].longitude,data.homeList[i].routeIdList.length]
            );
        }

        //dropdowns

        var textList = [];
        var valueList = [];
        for (var i=0; i<data.origins.length; i++) {
            textList.push(data.origins[i].name);
            valueList.push(i);
        }
        addDropdownOptions($("filterOrigin"),textList,valueList);
        addDropdownOptions($("routeOrigin"),textList,valueList);

        textList = [];
        valueList = [];
        for (var i=0; i<data.typeList.length; i++) {
            textList.push(data.typeList[i].name);
            valueList.push(i);
        }
        addDropdownOptions($("filterType"),textList,valueList);
        addDropdownOptions($("routeType"),textList,valueList);

        //load homes

        // var homeTable = document.querySelector("#currentHomeList div table");
        // for(var i=0; i<data["currentHomeIdList"].length; i++){
        //     var homeId = data["currentHomeIdList"][i];
        //     var home = data["homeList"][homeId];
        //     addTableRow(
        //         homeTable,
        //         "home-"+homeId,
        //         [home.name, home.latitude, home.longitude]
        //     );
        // }
        // var newSelectedRowId = null;
        // if (data["currentHomeId"] !== null) newSelectedRowId = "home-" + data["currentHomeId"];
        // selectTableRowById(null, newSelectedRowId);

        // if(data["currentHomeId"] !== null) {
        //     $("deleteHome").disabled = false;
        //     $("deleteHome").className = "";
        //     var lat = data.homeList[data["currentHomeId"]].latitude;
        //     var lon = data.homeList[data["currentHomeId"]].longitude;
        //     map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
        // }
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

async function deleteType() {
    var confirm = true;
    if (data.types[selectedTypeId].routes > 0) {
        confirm = await customConfirmPromise("This will delete this type from all associated routes.");
    }

    if (confirm === true) {
        document.getElementById("type-"+selectedTypeId).remove();
        for (var i=0; i<data.routes.length; i++) {
            if (data.routes[i].typeId === selectedTypeId) data.routes[i].typeId = -1;
        }
        data.types.splice(selectedTypeId, 1);
        selectedTypeId = null;

        //update route list table
    }
}

async function editType() {
    try {
        var name = await customPromptPromise("Please enter updated type name.");
        data.types[selectedTypeId].name = name;

        var tableRow = document.getElementById("type-"+selectedTypeId);
        tableRow.children[0].innerText = name;

        //update route list table

        setFileStatus(UNSAVED_CHANGES);
    }
    catch(e){}
}

async function addType() {
    try {
        var name = await customPromptPromise("Please enter new type name.");

        var id = 0;
        if (data.types.length > 0) { id = data.types[data.types.length-1].id++; }

        data.types.push({
            id: id,
            name: name,
            routes: 0
        });

        addTableRow(
            document.querySelector("#typesList div table"),
            "type-"+id,
            [name, 0]  
        );

        setFileStatus(UNSAVED_CHANGES);
    }
    catch(e){}
}

async function deleteOrigin() {

    if (data.homeList[selectedHomeId].routeIdList.length > 0) {
        var confirm = await customPromptPromise("This home has routes assigned. Deleting it will remove the home from those routes.");
        if (confirm === false) { return; }
    }
    
    document.getElementById("home-"+selectedHomeId).remove();

    for (var i=0; i<data.homeList[selectedHomeId].routeIdList.length; i++) {
        var routeId = data.homeList[selectedHomeId].routeIdList[i];
        data.routeList[routeId].homeId = -1;
    }

    data.homeList.splice(selectedHomeId,1);

    selectedHomeId = null;
    enableOrDisableListOfInputs(["deleteHome","editHome"],true, buttonDisabledStyle);

    // for(var i=0; i<data.currentHomeIdList.length; i++) {
    //     if (data.currentHomeIdList[i] === data.currentHomeId) {
    //         data.currentHomeIdList.splice(i,1);
    //     }
    // }
    // if (data.homeList[data.currentHomeId].routeIdList.length === 0) {
    //     data.homeList.splice(data.currentHomeId,1);
    // }
    // data.currentHomeId = null;
    // if (data.currentHomeIdList.length>0) {
    //     data.currentHomeId = data.currentHomeIdList[0];
    //     selectTableRowById(null,"home-"+data.currentHomeId);
    // }
    // else {
    //     $("deleteHome").disabled = true;
    //     $("deleteHome").className = buttonDisabledStyle;
    // }
}

async function editOrigin() {
    try {
        var home = data.homeList[selectedHomeId];
        var updatedHomeDetails = await multiPromptPromise(
            "Please enter updated home details.", ["name","latitude","longitude"],
            [home.name,home.latitude,home.longitude]
        );
        data.homeList[selectedHomeId].name = updatedHomeDetails[0];
        data.homeList[selectedHomeId].latitude = updatedHomeDetails[1];
        data.homeList[selectedHomeId].longitude = updatedHomeDetails[2];

        var tableRow = document.getElementById("home-"+selectedHomeId);
        tableRow.children[0].innerText = updatedHomeDetails[0];
        tableRow.children[1].innerText = updatedHomeDetails[1];
        tableRow.children[2].innerText = updatedHomeDetails[2];
    }
    catch(e){}
}

async function addOrigin(e) {
    try {
        var newHomeDetails = await multiPromptPromise("Please enter new home details.", ["name","latitude","longitude"],null);

        data["homeList"].push({
            name: newHomeDetails[0],
            latitude: newHomeDetails[1],
            longitude: newHomeDetails[2],
            routeIdList: []
        });
        var newHomeId = data["homeList"].length-1;
        // data["currentHomeIdList"].push(newHomeId);

        addTableRow(
            document.querySelector("#homeList div table"),
            "home-"+newHomeId,
            [newHomeDetails[0],newHomeDetails[1],newHomeDetails[2],0]  
        );

        // var oldSelectedRowId = null;
        // if (data["currentHomeId"] !== null) oldSelectedRowId = "home-"+data["currentHomeId"];
        // data["currentHomeId"] = parseInt(selectTableRowById(oldSelectedRowId, "home-"+newHomeId).split("-")[1]);

        // $("deleteHome").disabled = false;
        // $("deleteHome").className = "";
    }
    catch(e){}
}

function filterChange(e) {
    e.target.parentElement.className = inputChangeStyle;
    enableOrDisableListOfInputs(["filterApply"],false,"");
}

function filterApply() {
    $("filterType").parentElement.className = "";
    $("filterHome").parentElement.className = "";
    $("filterDescendingOrder").parentElement.className = "";
    enableOrDisableListOfInputs(["filterApply"],true,buttonDisabledStyle);
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
        var newRouteId = data["routeList"].length-1;

        addTableRow(
            document.querySelector("#routeList div table"),
            "route-"+newRouteId,
            ["None","None",newRouteName,0]
        );

        $("routeName").value = newRouteName;

        var oldSelectedRowId = null;
        if(selectedRouteId !== null) oldSelectedRowId = "route-"+selectedRouteId;
        selectedRouteId = parseInt(selectTableRowById(oldSelectedRowId, "route-"+newRouteId).split("-")[1]);

        enableOrDisableListOfInputs(["deleteRoute","routeType","routeHome","routeName","routeDescription"],false,"");
    }
    catch(e){}
}

function routeApply() {
    
    var typeId = parseInt($("routeType").children[$("routeType").selectedIndex].value);
    var homeId = parseInt($("routeHome").children[$("routeHome").selectedIndex].value);

    data.routeList[selectedRouteId].typeId = typeId;
    data.routeList[selectedRouteId].homeID = homeId;
    data.routeList[selectedRouteId].name = $("routeName").value;
    data.routeList[selectedRouteId].description = $("routeDescription").value;

    var tableRow = $("route-"+selectedRouteId);
    if(typeId===-1) tableRow.children[0].innerText = "None";
    else tableRow.children[0].innerText = data.typeList[typeId].name;
    if(homeId===-1) tableRow.children[1].innerText = "None";
    else tableRow.children[1].innerText = data.homeList[homeId].name;
    tableRow.children[2].innerText = $("routeName").value;

    if(homeId!==-1){ home(homeId); }

    $("routeType").parentElement.className = "";
    $("routeHome").parentElement.className = "";
    $("routeName").parentElement.className = "";
    $("routeDescription").parentElement.className = "";
    enableOrDisableListOfInputs(["updateDetails"],true,buttonDisabledStyle);
}



function createNewDataObject() {
    data = {
        "filename": null,
        "lastOpened": null,
        "description": null,
        "trips": [],
        "routes": [],
        "features": [],
        "layers": [],
        "types": [],
        "origins": []
    }
}

function setFileStatus(fs) {
    if (fs === UNSAVED_CHANGES && fileStatus === NEW_FILE_UNSAVED_CHANGES) return;
    fileStatus = fs;
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

function multiPromptPromise(message, inputList, inputValueList) {
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
        input.id = inputList[i];
        input.type = "text";
        if(inputValueList !== null) input.value = inputValueList[i];
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

function displayFileStatus() {
    if (fs === FILE_LOADED) { $("fileStatus").textContent = "File Loaded"; }
    else if (fs === NEW_FILE_UNSAVED_CHANGES) { $("fileStatus").textContent = "New File, Unsaved Changes"; }
    else if (fs === UNSAVED_CHANGES) { $("fileStatus").textContent = "Unsaved Changes"; }
    else if (fs === SAVED_CHANGES) { $("fileStatus").textContent = "Saved Changes"; }
}

function enableOrDisableListOfInputs(inputList, disabled, inputStyle) {
    for (var i=0; i<inputList.length; i++) {
        $(inputList[i]).disabled = disabled;
        $(inputList[i]).className = inputStyle;
    }
}

function clearDropdowns(idList, startIndex) {
    for (var i=0; i<idList.length; i++) {
        var numOfChildren = $(idList[i]).childElementCount;
        for (var j=startIndex; j<numOfChildren; j++) {
            $(idList[i]).children[startIndex].remove();
        }
    }
}

function addDropdownOptions(dropdown, textList, valueList) {
    for (var i=0; i<textList.length; i++) {
        var option = document.createElement("OPTION");
        option.text = textList[i];
        option.value=valueList[i];
        dropdown.add(option);
    }
}

function removeDropdownOptionsByValue(dropdown, valueList) {
    for (var i=0; i<valueList.length; i++) {
        for (var j=0; j<dropdown.childElementCount; j++) {
            if (dropdown.children[j].value === valueList[i]) {
                dropdown.children[j].remove();
                break;
            }
        }
    }
}

function clearTables(idList) {
    for (var i=0; i<idList.length; i++) {
        var table = document.querySelector("#" + idList[i] + " div table");
        var numOfRows = table.childElementCount;
        for (var j=0; j<numOfRows; j++) { table.deleteRow(0); }
    }
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

function routeChange(e) {
    e.target.parentElement.className = inputChangeStyle;
    enableOrDisableListOfInputs(["updateDetails"],false,"");
}

function clearRouteDetails() {
    $("routeType").selectedIndex = 0;
    $("routeOrigin").selectedIndex = 0;
    $("routeName").value = "";
    $("routeDescription").value = "";
}

function home(id) {
    var lat = data.homeList[id].latitude;
    var lon = data.homeList[id].longitude;
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
}