'use strict';

import { $, loadNavbar, navbarDropdown } from "./global.js";

//system

var DISABLE = true;
var ENABLE = false;

//model

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

const ATTRIBUTES = "attributes";
const TYPES = "types";
const ORIGINS = "origins";
const ROUTES = "routes";
const TRIPS = "trips";
const LAYERS = "layers";

const ID = 0;

const TYPE_NAME = 1;
const TYPE_NUM_OF_ROUTES = 2;

const ORIGIN_NAME = 1;
const ORIGIN_LATITUDE = 2;
const ORIGIN_LONGITUDE = 3;
const ORIGIN_NUM_OF_ROUTES = 4;

const ROUTE_TYPE_ID = 1;
const ROUTE_ORIGIN_ID = 2;
const ROUTE_NAME = 3;
const ROUTE_DESCRIPTION = 4;
const ROUTE_DISTANCE = 5;

var model = {

    attributes: {

        description: "save data file for the mapTool web applet",

        fileStatus: null,
        filename: null,
        lastOpened: null,

        fileStatus_get() { return this.fileStatus; },

        status_set(fileStatus) {
            if (fileStatus === UNSAVED_CHANGES && this.fileStatus === NEW_FILE_UNSAVED_CHANGES) return;
            this.fileStatus = fileStatus;
        },
    
        name_get() { return this.filename; },
        
        name_set(filename) { this.filename = filename; },
    
        lastOpened_get() { return this.lastOpened; },
        
        lastOpened_set(lastOpened) { return this.lastOpened; },
    },

    types: {
        attributes: ["id","name","numOfRoutes"],
        rows: [],
        selected: null
    },

    origins: {
        attributes: ["id","name","latitude","longitude","numOfRoutes"],
        rows: [],
        selected: null
    },

    routes: {
        attributes: ["id","typeId","originId","name","description","distance"],
        rows: [],
        selected: null
    },

    trips: {
        attributes: [],
        rows: [],
        selected: null
    },

    layers: {
        attributes: [],
        rows: [],
        selected: null
    },

    //constructors

    new(filename) {

        this.attributes.status_set(NEW_FILE_UNSAVED_CHANGES);
        this.attributes.name_set(filename);
        this.attributes.lastOpened = Date.now();

        this.rows_set(TYPES,[]);
        this.selected_set(TYPES,null);

        this.rows_set(ORIGINS,[]);
        this.selected_set(ORIGINS,null);

        this.rows_set(ROUTES,[]);
        this.selected_set(ROUTES,null);

        this.rows_set(TRIPS,[]);
        this.selected_set(TRIPS,null);

        this.rows_set(LAYERS,[]);
        this.selected_set(LAYERS,null);
    },

    fromJsonString(jsonString) {

        var jsonObject = JSON.parse(jsonString);

        this.attributes.status_set(FILE_LOADED);
        this.attributes.name_set(jsonObject.attributes.filename);
        this.attributes.lastOpened_set(jsonObject.attributes.lastOpened);

        this.list_set(TYPES,jsonObject.types.list);
        this.selected_set(TYPES,null);

        this.list_set(ORIGINS,jsonObject.origins.list);
        this.selected_set(ORIGINS,null);

        this.list_set(ROUTES,jsonObject.routes.list);
        this.selected_set(ROUTES,null);

        this.list_set(TRIPS,jsonObject.trips.list);
        this.selected_set(TRIPS,null);

        this.list_set(LAYERS,jsonObject.layers.list);
        this.selected_set(LAYERS,null);
    },

    //get set

    list_get(listName) { return this[listName].list; },

    list_getRow(listName,attribute,value) {
        for (const row in this[listName].rows) {
            if (this[listName].rows[row][attribute] === value) {
                return this[listName].rows[row]; }}
    },

    list_getValue(listName,atribute,value,returnAttribute) {
        for (const row in this[listName].rows) {
            if (this[listName].rows[row][attribute] === value) {
                return this[listName].rows[row][returnAttribute];
            }
        }
    },

    list_set(listName,data) { this[listName].list = data; },

    attributes_get(listName) { return this[listName].attributes; },

    selected_get(listName) { return this[listName].selected; },

    selected_set(listName,id) { 
        var selectedLocation = this.locationOf_linear(this[listName].rows,ID,id);
        this[listName].selected = this[listName].list[selectedLocation];
    },

    //functions

    getAllValuesForAttribute(listName, attribute) { return this[listName].rows.map(row => row[attribute]); },

    //helper functions

    locationOf_binary() {},

    locationOf_linear(rows,attribute,value) {
        for (var row=0; row<rows.length; row++) {
            if (rows[row][attribute] === value) return row; }
        return null;
    },

    //to

    toJsonString() {

        var jsonData = {};

        data["attributes"]["description"] = this.attributes.description;
        data["attributes"]["filename"] = this.attributes.filename;
        data["attributes"]["lastOpened"] = this.attributes.lastOpened;

        data["types"] = this.types.attributes;
        data["types"] = this.types.rows;

        data["origins"] = this.origins.attributes;
        data["origins"] = this.types.rows;

        data["routes"] = this.routes.attributes;
        data["routes"] = this.types.rows;

        data["trips"] = this.trips.attributes;
        data["trips"] = this.types.rows;

        data["layers"] = this.layers.attributes;
        data["layers"] = this.types.rows;

        var jsonString = JSON.stringify(
            jsonData,
            (k,v)=> {
                if (v instanceof Array) {
                    for (const i of v) if (i instanceof Array) return v;
                    return JSON.stringify(v);
                }
                return v;
            },
            2
        ).replace(/\"\[/g,"[")
         .replace(/\]\"/g,"]")
         .replace(/\\\"/g,"\"");

        return jsonString;
    },

}

var view = {

    defaultStyle: "",
    inputChangeStyle: "inputChange-1",
    inputDisabledStyle: "inputDisabled-1",
    buttonDisabledStyle: "buttonDisabled-1",
    selectDisabledStyle: "selectDisabled-1",
    textareaDisabledStyle: "textareaDisabled-1",
    tableRowSelectedStyle: "var(--colour-2)",

    file: {

        inputElement: $("fileInput"),
        inputTextElement: $("fileInputText"),
        newElement: $("fileNew"),
        saveElement: $("fileSave"),
        statusElement: $("fileStatus"),
        nameElement: $("filename"),
        nameApplyElement: $("filenameApply"),

        inputText_set(fileInputText) { this.inputTextElement.innerHTML = fileInputText; },

        status_set(fileStatus) {
            if (fileStatus === NO_FILE_LOADED) { this.statusElement.textContent = "No File Loaded"; }
            else if (fileStatus === FILE_LOADED) { this.statusElement.textContent = "File Loaded"; }
            else if (fileStatus === NEW_FILE_UNSAVED_CHANGES) { this.statusElement.textContent = "New File, Unsaved Changes"; }
            else if (fileStatus === UNSAVED_CHANGES) { this.statusElement.textContent = "Unsaved Changes"; }
            else if (fileStatus === SAVED_CHANGES) { this.statusElement.textContent = "Saved Changes"; } 
        },

        name_get() { return this.nameElement.value; },
        name_set(filename) { this.nameElement.value = filename; },

        name_enable(bool) { view.enableOrDisableListOfInputsByElement([this.nameElement],bool,view.defaultStyle); },

        name_onChange() {
            this.nameElement.parentElement.className = view.inputChangeStyle;
            view.enableOrDisableListOfInputsByElement([this.nameApplyElement],ENABLE,defaultStyle);
        },

        name_apply() {
            this.nameElement.parentElement.className = "";
            view.enableOrDisableListOfInputsByElement(this.nameApplyElement,DISABLE,inputDisabledStyle);
        },

        lastOpened_set(lastOpened) { this.lastOpened.value = lastOpened; },

    },

    types: {

        typeListElement: $("#typesList"),
        typeListDataElement: document.querySelector("#typesList div table"),
        typeDeleteElement: $("typeDelete"),
        typeEditElement: $("typeEdit"),
        typeAddElement: $("typeAdd"),

        disable() {

        },

        enable() {

        },

        clear() {
            view.table_clearTablesByIdList([this.typeListElement.id]);
            view.enableOrDisableListOfInputsByElement([this.typeDeleteElement,this.typeEditElement],DISABLE,view.buttonDisabledStyle);
            view.enableOrDisableListOfInputsByElement([this.typeAddElement],ENABLE,view.defaultStyle);
        },

        populate(types) {
            types.forEach(type => {
                view.addTableRow(
                    this.typeListDataElement,
                    "type-"+i,
                    [type[TYPE_NAME],type[TYPE_NUM_OF_ROUTES]]
                );
            });
        },

        delete() {

        },

        edit() {

        },

        update() {

        },

        add() {

        },

        select(oldSelectedTypeId,newSelectedTypeId) {
            view.table_selectRowByElementId("type-"+oldSelectedTypeId,"type-"+newSelectedTypeId);
        }
    },

    origins: {

        originListElement: $("#originsList"),
        originListDataElement: document.querySelector("#originsList div table"),
        originDeleteElement: $("originDelete"),
        originEditElement: $("originEdit"),
        originAddElement: $("originAdd"),

        disable() {

        },

        enable() {

        },

        clear() {
            view.table_clearTablesByIdList([this.originListElement.id]);
            view.enableOrDisableListOfInputsByElement([this.originDeleteElement,this.originEditElement],DISABLE,view.buttonDisabledStyle);
            view.enableOrDisableListOfInputsByElement([this.originAddElement],ENABLE,view.defaultStyle);
        },

        populate(origins) {
            origins.forEach(origin => {
                view.addTableRow(
                    this.originListDataElement,
                    "type-"+origin[ID],
                    [origin[ORIGIN_NAME],origin[ORIGIN_LATITUDE],origin[ORIGIN_LONGITUDE],origin[ORIGIN_NUM_OF_ROUTES]]
                );
            });
        },

        delete() {

        },

        edit() {

        },

        update() {

        },

        add() {

        },

        select() {

        }
    },

    routes: {

        routeFilterTypeElement: $("filterType"),
        routeFilterOriginElement: $("filterOrigin"),
        routeFilterDescendingOrderElement: $("filterDescendingOrder"),
        routeFilterApplyElement: $("filterApply"),

        routeListElement: $("routesList"),
        routeListDataElement: document.querySelector("routesList div table"),
        routeDeleteElement: $("routeDelete"),
        routeAddElement: $("routeAdd"),

        routeTypeElement: $("routeType"),
        routeOriginElement: $("routeOrigin"),
        routeNameElement: $("routeName"),
        routeDescriptionElement: $("routeDescription"),
        routeDetailsApplyElement: $("routeDetailsApply"),

        disable() {

        },

        enable() {

        },

        clear() {
            view.dropdowns_clearDropdownsByElementIdList([this.routeFilterTypeElement,this.routeFilterOriginElement],2);
            this.routeFilterDescendingOrderElement.selectedIndex = 0;
            
            view.table_clearTablesByIdList([this.originListElement.id]);

            this.routeTypeElement.selectedIndex = 0;
            this.routeOriginElement.selectedIndex = 0;
            this.routeNameElement.value = "";
            this.routeDescriptionElement.value = "";
            view.enableOrDisableListOfInputsByElement([this.routeTypeElement,this.routeOriginElement],DISABLE,view.selectDisabledStyle);
            view.enableOrDisableListOfInputsByElement([this.routeNameElement],DISABLE,view.inputDisabledStyle);
            view.enableOrDisableListOfInputsByElement([this.routeDescriptionElement],DISABLE,view.textareaDisabledStyle);
        },

        populate(routes, typeNames, typeIds, originNames, originIds) {

            view.addDropdownOptions(this.routeFilterTypeElement, typeNames, typeIds);
            view,addDropdownOptions(this.routeFilterOriginElement, originNames, originIds);

            routes.forEach(route => {
                addTableRow(
                    this.routeListDataElement,
                    "route-"+route[ID],
                    [route[ROUTE_TYPE_ID],route[ROUTE_ORIGIN_ID],route[ROUTE_NAME],route[ROUTE_DISTANCE]]
                );
            });

            view.addDropdownOptions(this.routeTypeElement, typeNames, typeIds);
            view,addDropdownOptions(this.routeOriginElement, originNames, originIds);
        },

        delete() {

        },

        edit() {

        },

        update() {

        },

        add() {

        },

        select() {

        }
    },

    trips: {

        disable() {

        },

        enable() {

        },

        clear() {

        },

        populate() {

        },

        delete() {

        },

        edit() {

        },

        update() {

        },

        add() {

        },

        select() {

        }
    },

    layers: {

        disable() {

        },

        enable() {

        },

        clear() {

        },

        populate() {

        },

        delete() {

        },

        edit() {

        },

        update() {

        },

        add() {

        },

        select() {

        }
    },

    //helper functions

    customAlertPromise(message) {
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
    },
    
    customConfirmPromise(message) {
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
    },
    
    customPromptPromise(message) {
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
    },

    dropdowns_clearDropdownsByElementIdList(idList, startIndex) {
        for (var i=0; i<idList.length; i++) {
            var numOfChildren = $(idList[i]).childElementCount;
            for (var j=startIndex; j<numOfChildren; j++) {
                $(idList[i]).children[startIndex].remove();
            }
        }
    },

    enableOrDisableListOfInputsByElement(inputList, disabled, inputStyle) {
        for (var i=0; i<inputList.length; i++) {
            inputList[i].disabled = disabled;
            inputList[i].className = inputStyle;
        }
    },

    enableOrDisableListOfInputsByElementId(inputIdList, disabled, inputStyle) {
        for (var i=0; i<inputIdList.length; i++) {
            $(inputIdList[i]).disabled = disabled;
            $(inputIdList[i]).className = inputStyle;
        }
    },

    multiPromptPromise(message, inputList, inputValueList) {
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
    },

    save(filename,data) {
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
        element.setAttribute("download", filename + ".json");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    },

    table_selectRowByElementId(oldSelectedRowId, newSelectedRowId) {
        if (oldSelectedRowId !== null) {
            var tr = document.getElementById(oldSelectedRowId);
            for (var i = 0; i < tr.children.length; i++) {
                tr.children[i].style.backgroundColor = "";
            }
        }
        if (newSelectedRowId === null) { 
            var tr = document.getElementById(newSelectedRowId);
            for (var i = 0; i < tr.children.length; i++) {
                tr.children[i].style.backgroundColor = view.tableRowSelectedStyle;
            } 
        }
    },

    table_clearTablesByIdList(idList) {
        for (var i=0; i<idList.length; i++) {
            var table = document.querySelector("#" + idList[i] + " div table");
            var numOfRows = table.childElementCount;
            for (var j=0; j<numOfRows; j++) { table.deleteRow(0); }
        }
    }
}

var controller = {

    file: {

        load() {
            var fileReference = e.target.files[0];
        
            var reader = new FileReader();
            reader.onload = function(e) {
        
                model.loadFromJsonString(e.target.result);
    
                data = JSON.parse(e.target.result);
    
                view.file.inputText_set( data.name_get() );
                view.file.status_set( data.fileStatus_get() );
                view.file.name_set( data.name_get() );
                view.file.lastOpened_set( data.lastOpened_get() );
    
                view.types.clear();
                view.origins.clear();
                view.routes.clear();
                view.trips.clear();
                view.layers.clear();
        
                view.types.populate( data.types_getAll() );
                view.origins.populate( data.origins_getAll() );
                view.routes.populate( 
                    data.routes_getAll(),
                    data.types_getAllValuesForAttribute(ID),
                    data.types_getAllValuesForAttribute(TYPE_NAME),
                    data.origins_getAllValuesForAttribute(ID),
                    data.origins_getAllValuesForAttribute(ORIGIN_NAME)
                );
                view.trips.populate( data.trips_getAll() );
                view.layers.populate( data.layers_getAll() );
            }
            reader.readAsText(fileReference);
        
            setFileStatus(FILE_LOADED);
        },
    
        save() {
    
            if (model.fileStatus_get === NO_FILE_LOADED) {
                await view.customAlertPromise("Cannot save file, no file loaded.");
            }
            else {
                var data = model.saveAsJsonString();
                view.save(data,model.name_get());
        
                model.status_set(SAVED_CHANGES);
                view.file.status_set(SAVED_CHANGES);
            }
        },
    
        new() {
            var fileStatus = model.fileStatus_get();
            if (fileStatus === NEW_FILE_UNSAVED_CHANGES || fileStatus === UNSAVED_CHANGES) {
                var confirm = await view.customConfirmPromise("The current file has unsaved changes.");
                if (confirm === false) return;
            }
        
            try
            {
                var filename = await view.customPromptPromise("Please enter a file name.");
        
                model.new(filename);
    
                view.file.status_set( model.fileStatus_get() );
                view.file.name_set( model.name_get() );
                view.file.lastOpened_set( model.lastOpened_get() );
        
                view.types.clear();
                view.origins.clear();
                view.routes.clear();
                view.trips.clear();
                view.layers.clear();
    
                model.status_set(NEW_FILE_UNSAVED_CHANGES);
                view.file.status_set(NEW_FILE_UNSAVED_CHANGES);
            }
            catch(e) { console.log(e); }
        },
    
        name_apply() {
            var filename = view.file.name_get();
            model.name_set(filename);
            view.file.name_apply();
    
            model.status_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    },

    type: {
        select() {
            if (this.target.tagName === "TD") {
                var oldSelectedTypeId = model.types_getSelectedTypeId();
                var newSelectedTypeId = this.target.parentElement.id.split("-")[1];
                view.types.select(oldSelectedTypeId,newSelectedTypeId);
                model.types_setSelectedTypeId(newSelectedTypeId);
            }
        },
    
        delete() {
    
            var confirm = true;
            if (model.getValue(TYPES,ID,))
    
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
    
            model.status_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    
        edit() {
    
            model.status_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    
        add() {
            
            model.status_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    }
}

window.onload = async () => {

    //check browser functionality

    if (window.File && window.FileReader && window.FileList && window.Blob);
    else alert('The File APIs are not fully supported in this browser.');

    //build html

    loadNavbar().then(() => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("mapTool").className = "active";
    });

    //set event listeners

    view.file.inputElement.addEventListener("change",controller.file.load);
    view.file.saveElement.addEventListener("click",controller.file.save);
    view.file.newElement.addEventListener("click",controller.file.new);
    view.file.nameElement.addEventListener("keyup",view.file.name_onChange);
    view.file.nameApplyElement.addEventListener("click",view.name_apply);

    view.type.typeListDataElement.addEventListener("click",view.type_select);
    view.type.typeDeleteElement.addEventListener("click",view.type_delete);
    view.type.typeEditElement.addEventListener("click",view.type_edit);
    view.type.typeAddElement.addEventListener("click",view.type_add);
}

















async function deleteType() {

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


function setFileStatus(fs) {
    if (fs === UNSAVED_CHANGES && fileStatus === NEW_FILE_UNSAVED_CHANGES) return;
    fileStatus = fs;
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

function routeChange(e) {
    e.target.parentElement.className = inputChangeStyle;
    enableOrDisableListOfInputs(["updateDetails"],false,"");
}

function clearRouteDetails() {

}

function home(id) {
    var lat = data.homeList[id].latitude;
    var lon = data.homeList[id].longitude;
    map.getView().setCenter(ol.proj.fromLonLat([lon, lat]));
}