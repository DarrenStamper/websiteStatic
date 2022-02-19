'use strict';

import { loadNavbar, navbarDropdown, $ } from "./global.js";

const DISABLE = true;
const ENABLE = false;

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

const ROOM_ID = 0;
const ROOM_NAME = 1;

const TASK_ID = 0;
const TASK_ROOM_ID = 1;
const TASK_NAME = 2;
const TASK_TIME = 3;
const TASK_INTERVAL = 4;
const TASK_LAST_DONE = 5;
const TASK_DUE = 6;

const SUB_TASK_ID = 0;
const SUB_TASK_ROOM_ID = 1;
const SUB_TASK_TASK_ID = 2;
const SUB_TASK_NAME = 2;
const SUB_TASK_TIME = 3;
const SUB_TASK_INTERVAL = 4;
const SUB_TASK_LAST_DONE = 5;
const SUB_TASK_DUE = 6;

const NAME_INPUT = 0;
const TIME_INPUT = 1;
const INTERVAL_INPUT = 2;
const LAST_DONE_INPUT = 3;
const DUE_INPUT = 4;

const SELECTED_TASK_TYPE = 0;
const SELECTED_TASK_ID = 1;

var model = {

    fileStatus: NO_FILE_LOADED,

    filename: null,
    lastOpened: null,

    rooms: {
        "attributes": ["id","name"],
        "data": []
    },
    tasks: {
        "attributes": ["id","roomId","name","time","interval","lastDone","due"],
        "data": []
    },
    subTasks: {
        "attributes": ["id","roomId","taskId","name","time","interval","lastDone","due"],
        "data": []
    },

    buildFromJson(){

    },

    new(filename) {
        this.filename = filename;
        this.lastOpened = Date.now();

        this.rooms = {
            "attributes": ["id","name"],
            "data": []
        };
        this.tasks = {
            "attributes": ["id","roomId","name","time","interval","lastDone","due"],
            "data": []
        };
        this.subTasks = {
            "attributes": ["id","roomId","taskId","name","time","interval","lastDone","due"],
            "data": []
        };

        this.setFileStatus(NEW_FILE_UNSAVED_CHANGES);
    },

    addRoom(roomName) {
        var id;
        if (this.rooms.data.length === 0) id = 0;
        else id = this.rooms.data[this.rooms.data.lastIndexOf][ROOM_ID]++;
        this.rooms.data.push([id,roomName]);

        return id;
    },

    addTask(roomId) {
        var taskId;
        if (this.tasks.data.length === 0) taskId = 0;
        else taskId = this.tasks.data[this.tasks.data.lastIndexOf][TASK_ID]++;
        this.tasks.data.push([taskId,roomId,null,null,null,null,null]);
        return taskId;
    },

    addSubTask(roomId,parentTaskId){
        var subTaskId;
        if (this.subTasks.data.length === 0) subTaskId = 0;
        else subTaskId = this.subTasks.data[this.subTasks.data.lastIndexOf][SUB_TASK_ID]++;
        this.subTasks.data.push([subTaskId,roomId,parentTaskId,null,null,null,null,null]);
        return subTaskId;
    },

    roomExists(name) {
        this.rooms.data.forEach(entry => {
            if(entry.name === name) return true;
        });
        return false;
    },

    //getter setter

    getAllModelDataAsJsonString() {
        var data = {};
        data["filename"] = this.filename;
        data["lastOpened"] = this.lastOpened;
        data["rooms"] = this.rooms;
        data["tasks"] = this.tasks;
        data["subTasks"] = this.subTasks;
        data["description"] = this.descriptions;

        return JSON.stringify(data, null, 2);
    },

    setAllModelDataFromJsonString(string) {
        var data = JSON.parse(string);

        this.filename = data.filename;
        this.lastOpened = data.lastOpened;
        this.rooms = data.rooms;
        this.tasks = data.tasks;
        this.subTasks = data.subTasks;
        this.description = data.descriptions;

        this.setFileStatus(FILE_LOADED);
        view.showFileData();
    },

    getFileStatus() { return this.fileStatus; },

    setFileStatus(fileStatus) {
        if (fileStatus === UNSAVED_CHANGES && this.fileStatus === NEW_FILE_UNSAVED_CHANGES) return;
        this.fileStatus = fileStatus;
    },

    getFilename(){ return this.filename; },

    setFilename(filename) { this.filename = filename; },

    getLastOpened() { return this.lastOpened; },

    getRoomNameList() {
        var list = [];
        this.rooms.data.forEach(entry =>{
            list.push(entry.name);
        })
        return list;
    },

    getRoomAsObject(roomId) {
        var roomObject = {
            id: roomId,
            name: undefined,
            tasks: []
        }

        this.rooms.data.forEach(room => {
            if (room[ROOM_ID] === roomId) {
                roomObject.name = room[ROOM_NAME];
            }
        });

        this.tasks.data.forEach(task => {
            if (task[TASK_ROOM_ID] === roomId) {
                var t = {
                    id: undefined,
                    name: undefined,
                    time: undefined,
                    interval: undefined,
                    lastDone: undefined,
                    due: undefined,
                    subTasks: []
                };

                t.id = task[TASK_ID];
                t.name = task[TASK_NAME];
                t.time = task[TASK_TIME];
                t.interval = task[TASK_INTERVAL];
                t.lastDone = task[TASK_LAST_DONE];
                t.due = task[TASK_DUE];

                this.subTasks.data.forEach(subTask => {
                    if (subTask[SUB_TASK_TASK_ID] === task.id) {
                        var st = {
                            id: undefined,
                            name: undefined,
                            time: undefined,
                            interval: undefined,
                            lastDone: undefined,
                            due: undefined,
                        }

                        st.id = subTask[SUB_TASK_ID];
                        st.name = subTask[SUB_TASK_NAME];
                        st.time = subTask[SUB_TASK_TIME];
                        st.interval = subTask[SUB_TASK_INTERVAL];
                        st.lastDone = subTask[SUB_TASK_LAST_DONE];
                        st.due = subTask[SUB_TASK_DUE];
                    }
                });

                roomObject.tasks.push(t);
            }
        });

        return roomObject;
    },

    //data structure functions

    addressOf() {
        //binary tree search on ordered index lists
    }
}

var view = {

    defaultStyle: "",
    inputChangeStyle: "inputChange-1",
    inputDisabledStyle: "inputDisabled-1",
    inputDisabledStyle_2: "inputDisabled-2",
    buttonDisabledStyle: "buttonDisabled-1",
    selectDisabledStyle: "selectDisabled-1",
    textareaDisabledStyle: "textareaDisabled-1",
    tableRowSelectedStyle: "var(--colour-2)",

    selectedRoomId: null,

    lastSelectedTaskId: null,
    lastSelectedSubTaskId: null,

    textInputOnChange(event, applyButton) {
        event.target.parentElement.className = view.inputChangeStyle;
        view.enableOrDisableListOfInputsById([applyButton],ENABLE,view.defaultStyle);
    },

    async newFile(){
        var fileStatus = model.getFileStatus();

        if (fileStatus === NEW_FILE_UNSAVED_CHANGES || fileStatus === UNSAVED_CHANGES) {
            var option = await view.customConfirmPromise("The current file has unsaved changes.");
            if (option === false) return;
        }
        try
        {
            var filename = await view.customPromptPromise("Please enter a file name.");
            model.new(filename);

            $("filename").value = model.getFilename();
            view.showFileStatus(fileStatus);
            $("lastOpened").value = model.getLastOpened();
            $("roomButtons").value = "";
            $("taskList").innerHTML = "";
            // $("taskList").innerHTML = '\
            //     <div class="task">\
            //         <div><input type="text" autocomplete="off" disabled></div>\
            //         <div><input type="text" autocomplete="off" disabled></div>\
            //         <div><input type="text" autocomplete="off" disabled></div>\
            //         <div><input type="text" autocomplete="off" disabled></div>\
            //         <div><input type="text" autocomplete="off" disabled></div>\
            //         <input type="radio" name="taskSelect" value="0">\
            //         <div class="taskButtons">\
            //             <button>Apply Changes</button>\
            //             <button>Delete Task</button>\
            //             <button>Add Subtask</button>\
            //             <div></div>\
            //         </div>\
            //     </div>';
            view.enableOrDisableListOfInputsById(["filename"], ENABLE, this.defaultStyle);
        }
        catch(e) { console.log(e); }
    },

    loadFile(event){
        var fileReference = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) { 
            model.setModelDataFromJson(event.target.result);

        }
        reader.readAsText(fileReference);
    },

    async saveFile(){
        var fileStatus = model.getFileStatus();

        if (fileStatus === NO_FILE_LOADED) {
            await customAlertPromise("Cannot save file, no file loaded.");
        }
        else {
            var data = model.getModelDataAsJsonString();
            var filename = model.getFilename();

            var element = document.createElement("a");
            element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
            element.setAttribute("download", filename + ".json");
            element.style.display = "none";
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
    
            view.showFileStatus(SAVED_CHANGES);
        }
    },

    filenameApply(){ 
        model.setFilename($("filename").value);
        $("filename").parentElement.className = view.defaultStyle;
        view.enableOrDisableListOfInputsById(["filenameApply"],DISABLE,view.buttonDisabledStyle);
    },

    async addRoom(){
        try
        {
            var name = await view.customPromptPromise("Please enter new room name.");    
            var id = model.addRoom(name);
            model.addTask(id);

            var button = document.createElement("button");
            button.value = id;
            button.innerHTML = name;
            $("roomButtons").appendChild(button);
        }
        catch(e) { console.log(e); }
    },

    selectRoom(event){
        var roomId = parseInt(event.target.value);
        if (roomId === view.selectRoomId) return;
        view.selectedRoomId = roomId;

        var roomObject = model.getRoomAsObject(roomId);

        var taskListElement = document.createElement("div");
        roomObject.tasks.forEach(task => {

            var name = task.name;
            var time = task.time;
            var interval = task.interval;
            var lastDone = task.lastDone;
            var due = task.due;

            if (name === null) name = "";
            if (time === null) time = "";
            if (interval === null) interval = "";
            if (lastDone === null) lastDone = "";
            if (due === null) due = "";

            var taskElement = document.createElement("div");
            taskElement.className = "task";
            taskElement.id = "task-" + task.id;
            taskElement.innerHTML = '\
                <div><input type="text" class="inputDisabled-2" autocomplete="off" disabled></div>\
                <div><input type="text" class="inputDisabled-2" autocomplete="off" disabled></div>\
                <div><input type="text" class="inputDisabled-2" autocomplete="off" disabled></div>\
                <textarea class="readOnlySmall" spellcheck="false" autocomplete="off" disabled></textarea>\
                <textarea class="readOnlySmall" spellcheck="false" autocomplete="off" disabled></textarea>\
                <input type="radio" name="taskSelect">';

                taskElement.children[NAME_INPUT].firstChild.innerHTML = name;
                taskElement.children[TIME_INPUT].firstChild.innerHTML = time;
                taskElement.children[INTERVAL_INPUT].firstChild.innerHTML = lastDone;
                taskElement.children[LAST_DONE_INPUT].innerHTML = interval;
                taskElement.children[DUE_INPUT].innerHTML = due;
            
                taskListElement.appendChild(taskElement);
        });

        $("taskList").innerHTML = taskListElement.innerHTML;
    },

    selectTask(event){

        var selectedTaskElementIdSplit = event.target.parentElement.id.split("-");

        //task
        if (selectedTaskElementIdSplit[SELECTED_TASK_TYPE] === "task") {
            var selectedTaskId = parseInt(selectedTaskElementIdSplit[SELECTED_TASK_ID]);
            if (selectedTaskId === view.lastSelectedTaskId) return;

            view.deselectLastTaskOrLastSubTask();

            view.selectTaskElementById("task-"+selectedTaskId);
            view.lastSelectedTaskId = selectedTaskId;

            var taskButtonsElement = document.createElement("div");
            taskButtonsElement.className = "taskButtons";
            taskButtonsElement.appendChild(view.createButton("Apply",view.buttonDisabledStyle,"taskApply",view.taskApply));
            taskButtonsElement.appendChild(view.createButton("Add Task",null,"taskAdd",view.taskAdd));
            taskButtonsElement.appendChild(view.createButton("Delete Task",null,"taskDelete",view.taskDelete));
            taskButtonsElement.appendChild(view.createButton("Add Sub Task",null,"taskAddSubTask",view.taskAddSubTask));

            var taskElement = event.target.parentElement;

            //no subTaskList element
            if (taskElement.children.length === 6) taskElement.appendChild(taskButtonsElement);
            
            //subTaskList element
            else taskElement.insertBefore(taskButtonsElement, taskElement.lastElementChild);
            
        }

        //subTask
        else if (selectedTaskElementIdSplit[SELECTED_TASK_TYPE] === "subTask") {
            var selectedSubTaskId = parseInt(selectedSubTaskElementIdSplit[SELECTED_TASK_ID]);
            if (selectedSubTaskId === view.lastSelectedSubTaskId) return;

            view.deselectLastTaskOrLastSubTask();

            view.selectTaskElementById("subTask-"+selectedSubTaskId);
            view.lastSelectedSubTaskId = selectedSubTaskId;

            var subTaskButtonsElement = document.createElement("div");
            subTaskButtonsElement.className = "taskButtons";
            subTaskButtonsElement.appendChild(view.createButton("Apply",view.buttonDisabledStyle,"subTaskApply",view.subTaskApply));
            subTaskButtonsElement.appendChild(view.createButton("Add Sub Task",null,"subTaskAdd",view.subTaskAdd));
            subTaskButtonsElement.appendChild(view.createButton("Delete Sub Task",null,"subTaskDelete",view.subTaskDelete));
            subTaskButtonsElement.appendChild(document.createElement("div"));

            var subTaskElement = event.target.parentElement;

            //no subTaskList element
            if (subTaskElement.children.length === 6) subTaskElement.appendChild(subTaskButtonsElement);
            
            //subTaskList element
            else subTaskElement.insertBefore(subTaskButtonsElement, subTaskElement.lastElementChild);
        }
    },

    taskApply(event) {
        console.log("taskApply");
        var taskElement = event.parent;
    },

    taskAdd(event) {

    },

    taskDelete(event) {

    },

    taskAddSubTask(event) {

    },

    subTaskApply(event) {

    },

    subTaskAdd(event) {

    },

    subTaskDelete(event) {

    },

    //helper functions

    deselectLastTaskOrLastSubTask() {

        var taskElementId;
        var taskButtonsElementId;

        if (view.lastSelectedTaskId !== null) {
            taskElementId = "task-"+view.lastSelectedTaskId;
            taskButtonsElementId = "taskButtons";
            view.lastSelectedtaskId = null;
        }
        else if (view.lastSelectedSubTaskId !== null) {
            taskElementId = "subTask-"+view.lastSelectedSubTaskId;
            taskButtonsElementId = "subTaskButtons";
            view.lastSelectedSubTaskId = null;
        }
        else return;
        
        var taskElement = $(taskElementId);
        view.enableOrDisableListOfInputsByElement(
            [ taskElement.children[NAME_INPUT], taskElement.children[TIME_INPUT], taskElement.children[INTERVAL_INPUT] ],
            DISABLE,
            view.inputDisabledStyle_2
        );
        document.getElementsByClassName(taskButtonsElementId)[0].remove();
    },

    selectTaskElementById(taskElementId) {
        var taskElement = $(taskElementId);
        view.enableOrDisableListOfInputsByElement(
            [ 
                taskElement.children[NAME_INPUT].firstElementChild, 
                taskElement.children[TIME_INPUT].firstElementChild, 
                taskElement.children[INTERVAL_INPUT].firstElementChild ],
            ENABLE,
            view.defaultStyle
        );
    },

    //generic helper functions

    createButton(name, className, id, callbackFunction) {
        var button = document.createElement("button");
        if (className !== null) button.className = className;
        if (id !== null) button.id = id;
        if (name !== null) button.innerHTML = name;
        if (callbackFunction !== null) button.addEventListener("click", callbackFunction);
        return button;
    },

    enableOrDisableListOfInputsById(inputIdList, disabled, inputStyle) {
        for (var i=0; i<inputIdList.length; i++) {
            $(inputIdList[i]).disabled = disabled;
            $(inputIdList[i]).className = inputStyle;
        }
    },

    enableOrDisableListOfInputsByElement(inputList, disabled, inputStyle) {
        for (var i=0; i<inputList.length; i++) {
            inputList[i].disabled = disabled;
            inputList[i].className = inputStyle;
        }
    },

    showFileStatus(fileSystem) {
        if (fileSystem === FILE_LOADED) { $("fileStatus").textContent = "File Loaded"; }
        else if (fileSystem === NEW_FILE_UNSAVED_CHANGES) { $("fileStatus").textContent = "New File, Unsaved Changes"; }
        else if (fileSystem === UNSAVED_CHANGES) { $("fileStatus").textContent = "Unsaved Changes"; }
        else if (fileSystem === SAVED_CHANGES) { $("fileStatus").textContent = "Saved Changes"; }
    },

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
    }
}

window.onload = async function () {
    
    //load navbar
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
    });

    //file

    if (window.File && window.FileReader && window.FileList && window.Blob);
    else alert('The File APIs are not fully supported in this browser.');

    $("fileInput").addEventListener("change", view.loadFile);
    $("newFile").addEventListener("click", view.newFile);
    $("saveFile").addEventListener("click", view.saveFile);

    $("filename").addEventListener("keyup", event => {
        view.textInputOnChange(event, "filenameApply")
    });
    $("filenameApply").addEventListener("click", view.filenameApply);

    $("addRoom").addEventListener("click", view.addRoom);

    $("roomButtons").addEventListener("click", view.selectRoom);

    $("taskList").addEventListener("click", event => {
        if (event.target.type === "radio") view.selectTask(event);
    });

    $("taskList").addEventListener("keyup", event => {
        view.textInputOnChange(event, "taskApply");
    });
}