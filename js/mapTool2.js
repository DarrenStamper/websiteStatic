'use strict';

import { $, loadNavbar, navbarDropdown } from "./global.js";

var DISABLE = true;
var ENABLE = false;

var NO_FILE_LOADED = 0;
var FILE_LOADED = 1;
var NEW_FILE_UNSAVED_CHANGES = 2;
var UNSAVED_CHANGES = 3;
var SAVED_CHANGES = 4;

var ID = 0;

var TYPE_NAME = 1;
var TYPE_NUM_OF_ROUTES = 2;

var ORIGIN_NAME = 1;
var ORIGIN_LATITUDE = 2;
var ORIGIN_LONGITUDE = 3;
var ORIGIN_NUM_OF_ROUTES = 4;

var ROUTE_TYPE_ID = 1;
var ROUTE_ORIGIN_ID = 2;
var ROUTE_NAME = 3;
var ROUTE_DESCRIPTION = 4;
var ROUTE_DISTANCE = 5;

class List {
    rows = [];
    selected = null;

    constructor(rows,selected) {
        this.rows = rows;
        this.selected = selected;
    }

    rows_get() { return this.rows; }

    rows_getAllValuesForAttribute(attribute) { return this.rows.map(row => row[attribute]); }

    rows_getLength() { return this.rows.length; }

    rows_getRow(attribute, value) { for (const row in this.rows) if (row[attribute] === value) return row; }

    rows_getRowValue(attribute, value, returnAttribute) { for (const row in this.rows) if (row[attribute] === value) return row[returnAttribute]; }

    rows_setAllValuesForAttributeWhere(whereAttribute,whereValue,attribute,value) { this.rows.forEach(row => { if(row[whereAttribute] === whereValue) row[attribute] === value; }); }

    selected_delete() {
        var id = this.selected.id;
        this.rows.splice(id,1);
        this.selected = null;
    }

    selected_get() { return this.selected; }

    selected_getValue(attribute) { return this.selected[attribute]; }

    selected_set(id) { this.selected = this.rows.find(row => row.id); }

    selected_setValue(attribute,value) { this.selected[attribute] = value; }
}

class Types extends List {

    constructor(rows,selected) { super(rows,selected); }

    rows_FromListOfStringList(rows) {
        rows.forEach(row => this.rows.push({
            id: parseInt(row[ID]),
            name: row[TYPE_NAME],
            numOfRoutes: parseInt(row[TYPE_NUM_OF_ROUTES])
        }));
    }

    rows_addRowAndCreateId(name,numOfRoutes) {
        var numOfRows = this.rows.length;
        var id = 0;
        if (numOfRows > 0) id = this.rows[listLength-1].id++;

        this.rows.push({
            id: id,
            name: name,
            numOfRoutes: numOfRoutes
        });
    }

    rows_toListOfStringList() {
        var list = [];
        this.rows.forEach (row => list.push([row.id, row.name, row.numOfRoutes]));
        return list;
    }

    selected_delete() {
        var id = this.selected.id;
        this.rows.splice(id,1);
        this.list_setAllValuesForAttributeWhere("typeId",id,"typeId",-1);
        this.selected = null;
    }
}

class Origins extends List {

    constructor(rows,selected) { super(rows,selected); }

    rows_FromListOfStringList(rows) {
        rows.forEach(row => this.rows.push({
            id: parseInt(row[ID]),
            name: row[ORIGIN_NAME],
            latitude: parseFloat(row[ORIGIN_LATITUDE]),
            longitude: parseFloat(row[ORIGIN_LONGITUDE]),
            numOfRoutes: parseInt(row[TYPE_NUM_OF_ROUTES])
        }));
    }

    rows_addRowAndCreateId(name, latitude, longitude, numOfRoutes) {

        var numOfRows = this.rows.length;
        var id = 0;
        if (numOfRows > 0) id = this.rows[listLength-1].id++;

        this.rows.push({
            id: id,
            name: name,
            latitude: latitude,
            longitude: longitude,
            numOfRoutes: numOfRoutes
        });
    }

    rows_toListOfStringList() {
        var list = [];
        this.rows.forEach (row => list.push([row.id, row.name, row.latitude, row.longitude, row.numOfRoutes]));
        return list;
    }

    selected_delete() {
        var id = this.selected.id;
        this.rows.splice(id,1);
        this.list_setAllValuesForAttributeWhere("originId",id,"originId",-1);
        this.selected = null;
    }
}

class Routes extends List {

    constructor(rows,selected) { super(rows,selected); }

    rows_FromListOfStringList(rows) {
        rows.forEach(row => this.rows.push({
            id: parseInt(row[ID]),
            typeId: parseInt(row[ROUTE_TYPE_ID]),
            originId: parseInt(row[ROUTE_ORIGIN_ID]),
            name: row[ROUTE_NAME],
            description: row[ROUTE_DESCRIPTION],
            distance: parseFloat(row[ROUTE_DISTANCE])
        }));
    }

    rows_addRowAndCreateId(typeId, originId, name, description, distance) {

        var numOfRows = this.rows.length;
        var id = 0;
        if (numOfRows > 0) id = this.rows[listLength-1].id++;

        this.rows.push({
            id: id,
            typeId: typeId,
            originId: originId,
            name: name,
            description: description,
            distance: distance
        });
    }

    rows_toListOfStringList() {
        var list = [];
        this.rows.forEach(row => list.push([row.id, row.typeId, row.originId, row.name, row.description, row.distance]));
        return list;
    }
}

class Trips extends List {

    constructor(rows,selected) { super(rows,selected); }
}

class Layers extends List {

    constructor(rows,selected) { super(rows,selected); }
}

var model = {

    rowFormat: "array",

    fileStatus: null,
    filename: null,
    lastOpened: null,

    types: null,
    origins: null,
    routes: null,
    trips: null,
    layers: null,

    fileStatus_set(fileStatus) {
        if (this.fileStatus === NEW_FILE_UNSAVED_CHANGES && fileStatus === UNSAVED_CHANGES) return;
        else this.fileStatus = fileStatus;
    },

    new(filename) {

        this.attributes.fileStatus = NEW_FILE_UNSAVED_CHANGES;
        this.attributes.filename = filename;
        this.attributes.lastOpened = Date.now();
        this.attributes.rowFormat = "array";

        this.types = new Types([],null);
        this.origins = new Origins([],null);
        this.routes = new Routes([],null);
        this.trips = new Trips([],null);
        this.layers = new Layers([],null);
    },

    fromJsonString(jsonString) {

        var jsonObject = JSON.parse(jsonString);

        this.attributes.fileStatus = FILE_LOADED;
        this.attributes.filename = jsonObject.attributes.filename;
        this.attributes.lastOpened = jsonObject.attributes.lastOpened;
        this.attributes.rowFormat = jsonObject.attribute.rowFormat;

        if (this.attributes.rowFormat === "array") {
            this.types = new Types([],null);
            this.origins = new Origins([],null);
            this.routes = new Routes([],null);
            this.trips = new Trips([],null);
            this.layers = new Layers([],null);

            this.types.rows_setFromListOfStringList(jsonObject.types.rows);
            this.origins.rows_setFromListOfStringList(jsonObject.origins.rows);
            this.routes.rows_setFromListOfStringList(jsonObject.routes.rows);
            this.trips.rows_setFromListOfStringList(jsonObject.trips.rows);
            this.layers.rows_setFromListOfStringList(jsonObject.layers.rows);
        }

        else if (this.attributes.rowFormat === "object") {
            this.types = new Types(this.jsonObject.types.rows,null);
            this.origins = new Origins(this.jsonObject.origins.rows,null);
            this.routes = new Routes(this.jsonObject.routes.rows,null);
            this.trips = new Trips(this.jsonObject.trips.rows,null);
            this.layers = new Layers(this.jsonObject.layers.rows,null);
        }
    },

    toJsonString() {

        var jsonData = {};

        jsonData.attributes.description = "json save data file for mapTool2 web app";
        jsonData.attributes.filename = this.attributes.filename;
        jsonData.attributes.lastOpened = this.attributes.lastOpened;
        jsonData.attributes.rowFormat = this.attributes.rowFormat;

        if (this.attributes.rowFormat === "array") {
            
            jsonData.types.attributes = ["id","name","numOfRoutes"];
            jsonData.types.rows = this.types.rows_toListOfStringList();

            jsonData.origins.attributes = ["id","name","latitude","longitude","numOfRoutes"];
            jsonData.origins.rows = this.origins.rows_toListOfStringList();

            jsonData.routes.attributes = ["id","typeId","originId","name","description","distance"];
            jsonData.routes.rows = this.routes.rows_toListOfStringList();

            jsonData.trips.attributes = [];
            jsonData.trips.rows = this.trips.rows_toListOfStringList();

            jsonData.layers.attributes = [];
            jsonData.layers.rows = this.layers.rows_toListOfStringList();
        }

        else if (this.attributes.rowFormat === "object") {

            jsonData.types = this.types.rows;
            jsonData.origins = this.origins.rows;
            jsonData.routes = this.routes.rows;
            jsonData.trips = this.trips.rows;
            jsonData.layers = this.layers.rows;
        }

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
    }

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

        selectedId: null,

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

        delete(id) {  },

        edit() {

        },

        update() {

        },

        add(name) {
            addTableRow(
                document.querySelector("#typesList div table"),
                "type-"+id,
                [name, 0]  
            );
        },

        select(oldSelectedId, event) {

            if (event.target.tagName === "TD") {
                var newSelectedId = event.target.parentElement.id.split("-")[1];
                view.types.select(oldSelectedId,newSelectedTypeId);
                view.table_selectRowByElementId("type-"+oldSelectedId,"type-"+newSelectedId);
                return newSelectedId;
            }
        }
    },

    origins: {

        originListElement: $("#originsList"),
        originListDataElement: document.querySelector("#originsList div table"),
        originDeleteElement: $("originDelete"),
        originEditElement: $("originEdit"),
        originAddElement: $("originAdd"),

        selectedId: null,

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

        delete(id) { 
            document.getElementById("origin-"+id).remove();
            view.enableOrDisableListOfInputs(["deleteHome","editHome"],true, buttonDisabledStyle);
        },

        edit() {

        },

        update(id,name,latitude,longitude) {
            var tableRow = document.getElementById("home-"+id);
            tableRow.children[0].innerText = name;
            tableRow.children[1].innerText = latitude;
            tableRow.children[2].innerText = longitude;
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

        selectedId: null,

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

        selectedId: null,

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

        selectedId: null,

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

    files: {

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
                    data.types_list_getAllValuesForAttribute(ID),
                    data.types_list_getAllValuesForAttribute(TYPE_NAME),
                    data.origins_list_getAllValuesForAttribute(ID),
                    data.origins_list_getAllValuesForAttribute(ORIGIN_NAME)
                );
                view.trips.populate( data.trips_getAll() );
                view.layers.populate( data.layers_getAll() );
            }
            reader.readAsText(fileReference);
        
            model.fileStatus_set(FILE_LOADED);
            view.file.status_set(FILE_LOADED);
        },
    
        async save() {
    
            if (model.fileStatus === NO_FILE_LOADED) {
                await view.customAlertPromise("Cannot save file, no file loaded.");
            }
            else {
                var data = model.toJsonString();
                view.save(data,model.filename);
        
                model.fileStatus_set(SAVED_CHANGES);
                view.file.status_set(SAVED_CHANGES);
            }
        },
    
        new() {
            var fileStatus = model.fileStatus;
            if (fileStatus === NEW_FILE_UNSAVED_CHANGES || fileStatus === UNSAVED_CHANGES) {
                var confirm = await view.customConfirmPromise("The current file has unsaved changes.");
                if (confirm === false) return;
            }
        
            try
            {
                var filename = await view.customPromptPromise("Please enter a file name.");
        
                model.new(filename);
    
                view.file.status_set( model.fileStatus );
                view.file.name_set( model.filename );
                view.file.lastOpened_set( model.lastOpened );
        
                view.types.clear();
                view.origins.clear();
                view.routes.clear();
                view.trips.clear();
                view.layers.clear();
    
                model.fileStatus_set(NEW_FILE_UNSAVED_CHANGES);
                view.file.status_set(NEW_FILE_UNSAVED_CHANGES);
            }
            catch(e) { console.log(e); }
        },
    
        name_onChange() { view.file.name_onChange(); },

        name_apply() {
            model.filename = view.file.name_get();
            view.file.name_apply();
    
            model.fileStatus_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    },

    types: {
        select() {
            var oldSelectedId = model.types.selected.id;
            var newSelectedId = view.types.select(oldSelectedId, this);
            model.types.selected_set(newSelectedId);
        },
    
        delete() {

            if (model.types.selected.routes > 0) {
                var confirm = await view.customConfirmPromise("This will delete this type from all associated routes.");
                if (!confirm) return;
            }

            model.routes.rows_setAllValuesForAttributeWhere("typeId",model.types.selected.id,"typeId",-1);

            view.type.delete(model.types.selected.id)
            
            model.routes.selected_delete();

            //update route view - list, selected route
    
            model.fileStatus_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    
        edit() {
            try {
                var name = await view.customPromptPromise("Please enter updated type name.");
                model.selected_setValue(name);
        


                var tableRow = document.getElementById("type-"+model.selected_getValue(listName,ID));
                tableRow.children[0].innerText = name;
        
                //update route list table
        
                model.file.status_set(UNSAVED_CHANGES);
                view.file.status_set(UNSAVED_CHANGES);
            }
            catch(e){}
        },
    
        async add() {
            
            try {
                var name = await view.customPromptPromise("Please enter new type name.");

                model.list_addRow(TYPES,{
                    name: name,
                    routes: 0
                });

                view.types.add(name);
        
                model.status_set(UNSAVED_CHANGES);
                view.file.status_set(UNSAVED_CHANGES);
            }
            catch(e){}
        },
    
    },

    origins: {

        async add() {
            try {
                var newHomeDetails = await view.multiPromptPromise("Please enter new home details.", ["name","latitude","longitude"],null);
        
                model.list_addRow({
                    name: newHomeDetails[0],
                    latitude: 
                });

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
        },

        async delete() {

            if (model.selected_getValue(ORIGINS,ORIGIN_NUM_OF_ROUTES) > 0) {
                var confirm = await view.customPromptPromise("This home has routes assigned. Deleting it will remove the home from those routes.");
                if (confirm === false) { return; }
            }
            
            view.origins.delete( model.origins.selected[ID] );

            model.origins.selected_delete();

            model.status_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },

        async edit() {
            try {
                var updatedOriginDetails = await multiPromptPromise(
                    "Please enter updated home details.", 
                    ["name","latitude","longitude"],
                    [mode.origins.selected[ORIGIN_NAME], mode.origins.selected[ORIGIN_LATITUDE], mode.origins.selected[ORIGIN_LONGITUDE]]
                );

                model.selected_setValue(ORIGINS,ORIGIN_NAME,updatedOriginDetails[0]);
                model.selected_setValue(ORIGINS,ORIGIN_LATITUDE,updatedOriginDetails[1]);
                model.selected_setValue(ORIGINS,ORIGIN_LONGITUDE,updatedOriginDetails[2]);

                view.origins.update( model.origins.selected[ID], updatedOriginDetails[0], updatedOriginDetails[1], updatedOriginDetails[2] );

                model.status_set(UNSAVED_CHANGES);
                view.file.status_set(UNSAVED_CHANGES);
            }
            catch(e){}
        }
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

    view.file.inputElement.addEventListener("change",controller.files.load);
    view.file.saveElement.addEventListener("click",controller.files.save);
    view.file.newElement.addEventListener("click",controller.files.new);
    view.file.nameElement.addEventListener("keyup",controller.files.name_onChange);
    view.file.nameApplyElement.addEventListener("click",controller.files.name_apply);

    view.types.typeListDataElement.addEventListener("click",controller.types.select);
    view.types.typeDeleteElement.addEventListener("click",controller.types.delete);
    view.types.typeEditElement.addEventListener("click",controller.types.edit);
    view.types.typeAddElement.addEventListener("click",controller.types.add);
}

//*********************************************************************************************************************************************************************************

async function addOrigin(e) {

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