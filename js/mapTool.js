'use strict';

import { $, loadNavbar, log, navbarDropdown } from "./global.js";

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

const POPULATE = 0;
const ADD = 1;
const REMOVE = 2;

var inputChangeStyle = "inputChange-1";
var inputDisabledStyle = "inputDisabled-1";
var buttonDisabledStyle = "buttonDisabled-1";
var selectDisabledStyle = "selectDisabled-1";
var textareaDisabledStyle = "textareaDisabled-1";
var tableRowSelectedStyle = "var(--colour-2)";

var fileStatus = NO_FILE_LOADED;

var data;

var selectedHomeId = null;
var selectedTypeId = null;
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

    $("fileName").addEventListener("keyup", e => {
        e.target.parentElement.className = inputChangeStyle;
        enableOrDisableListOfInputs(["update"],false,"");
    });
    $("update").addEventListener("click", () => {
        data["fileName"] = $("fileName").value;
        $("fileName").parentElement.className = "";
        enableOrDisableListOfInputs(["update"],true,inputDisabledStyle);
    });

    document.querySelector("#homeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            var oldSelectedRowId = null;
            if (selectedHomeId !== null) oldSelectedRowId = "home-"+selectedHomeId;
            selectedHomeId = parseInt(selectTableRowById(oldSelectedRowId, e.target.parentElement.id).split("-")[1]);
            enableOrDisableListOfInputs(["deleteHome","editHome"],false,"");
        }
    });
    $("deleteHome").addEventListener("click", deleteHome);
    $("editHome").addEventListener("click", editHome);
    $("addHome").addEventListener("click", addHome);

    //type list

    document.querySelector("#typeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            var oldSelectedRowId = null;
            if (selectedTypeId !== null) oldSelectedRowId = "type-"+selectedTypeId;
            selectedTypeId = parseInt(selectTableRowById(oldSelectedRowId, e.target.parentElement.id).split("-")[1]);
            enableOrDisableListOfInputs(["deleteType","editType"],false,"");
        }
    });

    $("deleteType").addEventListener("click", deleteType);
    $("editType").addEventListener("click", editType);
    $("addType").addEventListener("click", addType);

    //route filter

    $("filterType").addEventListener("change",filterChange);
    $("filterHome").addEventListener("change",filterChange);
    $("filterDescendingOrder").addEventListener("change",filterChange);
    $("filterApply").addEventListener("click",filterApply);

    //route list

    document.querySelector("#routeList div").addEventListener("click", e => {
        if (e.target.tagName === "TD") {
            selectedRouteId = parseInt(selectTableRowById("route-"+selectedRouteId, e.target.parentElement.id).split("-")[1]);
        }
    });
    $("addRoute").addEventListener("click", addRoute);

    //route details

    $("routeType").addEventListener("change",routeChange);
    $("routeHome").addEventListener("change",routeChange);
    $("routeName").addEventListener("keyup",routeChange);
    $("routeDescription").addEventListener("keyup",routeChange);
    $("updateDetails").addEventListener("click",routeApply);

    //map

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
    //window.map = map;
}

//pop up functions

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

//file functions

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
        clearTables();
        clearListOfDropdowns(["filterType","filterHome","routeType","routeHome"],2);
        clearRouteDetails();
        enableOrDisableListOfInputs(["deleteHome","editHome","deleteType","editType"],true,buttonDisabledStyle);
        enableOrDisableListOfInputs(["routeType","routeHome"],true,selectDisabledStyle);
        enableOrDisableListOfInputs(["routeName"],true,inputDisabledStyle);
        enableOrDisableListOfInputs(["routeDescription"],true,textareaDisabledStyle);

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
        clearTables();
        clearListOfDropdowns(["filterType","filterHome","routeType","routeHome"],2);
        clearRouteDetails();
        enableOrDisableListOfInputs(["deleteHome","editHome","deleteType","editType"],true,buttonDisabledStyle);
        enableOrDisableListOfInputs(["routeType","routeHome"],true,selectDisabledStyle);
        enableOrDisableListOfInputs(["routeName"],true,inputDisabledStyle);
        enableOrDisableListOfInputs(["routeDescription"],true,textareaDisabledStyle);

        data = JSON.parse(e.target.result);

        $("fileName").value = data["fileName"];

        //home list
        for (var i=0; i<data.homeList.length; i++) {
            addTableRow(
                document.querySelector("#homeList div table"),
                "home-"+i,
                [data.homeList[i].name,data.homeList[i].latitude,data.homeList[i].longitude,data.homeList[i].routeIdList.length]
            );
        }

        //type list

        for (var i=0; i<data.typeList.length; i++) {
            addTableRow(
                document.querySelector("#typeList div table"),
                "type-"+i,
                [data.typeList[i].name,data.typeList[i].routeIdList.length]
            );
        }

        //dropdowns

        var textList = [];
        var valueList = [];
        for (var i=0; i<data.homeList.length; i++) {
            textList.push(data.homeList[i].name);
            valueList.push(i);
        }
        addDropdownOptions($("filterHome"),textList,valueList);
        addDropdownOptions($("routeHome"),textList,valueList);

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

function createNewDataObject() {
    data = {
        fileName: null,
        typeList: [
            // {
            //     name: null,
            //     routeIdList: []
            // }            
        ],
        homeList: [
            // {
            //     name: null,
            //     latitude: null,
            //     longitude: null
            //     routeIdList: []
            // }
        ],
        routeList: [
            // {
            //     name: null,
            //     homeId: -1,
            //     typeId: -1,
            //     distance: -1,
            //     description: "",
            //     geometry: {
            //         style: null,
            //         vertices: [
            //             {
            //                 latitude: null,
            //                 longitude: null,
            //             }
            //         ]
            //     }
            // }
        ]
    }
}

function setFileStatus(fs) {
    if (fileStatus === NO_FILE_LOADED) {
        enableOrDisableListOfInputs(["fileName","addHome","addType","addRoute","filterType","filterHome","filterDescendingOrder","filterApply"],false,"");
    }
    fileStatus = fs;
    if (fs === FILE_LOADED) { $("fileStatus").textContent = "File Loaded"; }
    else if (fs === NEW_FILE_UNSAVED_CHANGES) { $("fileStatus").textContent = "New File, Unsaved Changes"; }
    if (fs === UNSAVED_CHANGES) { $("fileStatus").textContent = "Unsaved Changes"; }
    if (fs === SAVED_CHANGES) { $("fileStatus").textContent = "Saved Changes"; }
}

//input functions

function enableOrDisableListOfInputs(inputList, disabled, inputStyle) {
    for (var i=0; i<inputList.length; i++) {
        $(inputList[i]).disabled = disabled;
        $(inputList[i]).className = inputStyle;
    }
}

//input drop down functions

function clearListOfDropdowns(dropdownIdList, startIndex) {
    for (var i=0; i<dropdownIdList.length; i++) {
        var numOfChildren = $(dropdownIdList[i]).childElementCount;
        for (var j=startIndex; j<numOfChildren; j++) {
            $(dropdownIdList[i]).children[startIndex].remove();
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

//input table functions

function clearTables() {
    var homeTable = document.querySelector("#homeList div table");
    var numOfRows = homeTable.childElementCount;
    for(var i=0; i<numOfRows; i++){ homeTable.deleteRow(0); }

    var typeTable = document.querySelector("#typeList div table");
    numOfRows = typeTable.childElementCount;
    for(var i=0; i<numOfRows; i++){ typeTable.deleteRow(0); }

    var routeTable = document.querySelector("#routeList div table");
    numOfRows = routeTable.childElementCount;
    for(var i=0; i<numOfRows; i++) { routeTable.deleteRow(0); }
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

//home functions

async function deleteHome() {

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

async function editHome() {
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

async function addHome(e) {
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

//type functions

async function deleteType() {
    var confirm = true;
    if (data.typeList[selectedTypeId].routeIdList.length > 0) {
        confirm = await customConfirmPromise("This will delete this type from all associated routes.");
    }

    if (confirm === true) {
        document.getElementById("type-"+selectedTypeId).remove();
        for (var i=0; i < data.typeList[selectedTypeId].routeIdList.length; i++){
            var selectedTypeRouteId = data.typeList[selectedTypeId].routeIdList[i];
            data.routeList[selectedTypeRouteId].typeId = -1;
        }
        data.typeList.splice(selectedTypeId, 1);
        selectedTypeId = null;

        //update route list table
    }
}

async function editType() {
    try {
        var updatedTypeName = await customPromptPromise("Please enter updated type name.");
        data.typeList[selectedTypeId].name = updatedTypeName;

        var tableRow = document.getElementById("type-"+selectedTypeId);
        tableRow.children[0].innerText = updatedTypeName;

        //update type list
        //update route list table
    }
    catch(e){}
}

async function addType() {
    try {
        var newTypeName = await customPromptPromise("Please enter new type name.");
        data.typeList.push({
            name: newTypeName,
            routeIdList: []
        });
        var newTypeId = data.typeList.length-1;

        addTableRow(
            document.querySelector("#typeList div table"),
            "type-"+newTypeId,
            [newTypeName, 0]  
        );

        //update type list
    }
    catch(e){}
}

//filter functions

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

//route functions

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

//route detail functions

function routeChange(e) {
    e.target.parentElement.className = inputChangeStyle;
    enableOrDisableListOfInputs(["updateDetails"],false,"");
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

function clearRouteDetails() {
    $("routeType").selectedIndex = 0;
    $("routeHome").selectedIndex = 0;
    $("routeName").value = "";
    $("routeDescription").value = "";
}

//map tool functions

function home(id) {
    var lat = data.homeList[id].latitude;
    var lon = data.homeList[id].longitude;
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
}

