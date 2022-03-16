'use strict';

import { loadNavbar, navbarDropdown, $ } from "./global.js";

const DISABLE = true;
const ENABLE = false;

//ui

const NAME_INPUT = 0;
const TIME_INPUT = 1;
const INTERVAL_INPUT = 2;
const LAST_DONE_INPUT = 3;
const DUE_INPUT = 4;
const RADIO_INPUT = 5;

const TASK_DELETE_BUTTON = 3;
const TASK_ADD_SUB_TASK_BUTTON = 4;

const SELECTED_TASK_TYPE = 0;
const SELECTED_TASK_ID = 1;

const DESELECTED_TASK_LIST_LENGTH = 6;
const SELECTED_TASK_LIST_LENGTH = 7;
const SELECTED_TASK_BUTTONS_ELEMENT = 6;

//model

const NO_FILE_LOADED = 0;
const FILE_LOADED = 1;
const NEW_FILE_UNSAVED_CHANGES = 2;
const UNSAVED_CHANGES = 3;
const SAVED_CHANGES = 4;

const DUE_UPDATE_METHOD_AUTOMATIC = 0;
const DUE_UPDATE_METHOD_MANUAL = 1;

const DISPLAY_FORMAT_ROOM_PANEL = 0;
const DISPLAY_FORMAT_TABLE = 1;
const DISPLAY_FORMAT_CONSOLE = 2;

const ROOM_ID = 0;
const ROOM_NAME = 1;

const GROUP_ID = 0;
const GROUP_ID_OTHER = 0;
const GROUP_ROOM_ID = 1;
const GROUP_NAME = 2;
const GROUP_PARENT_TASK_ID = 3;

const TASK_ID = 0;
const TASK_ROOM_ID = 1;
const TASK_GROUP_ID = 2;
const TASK_NAME = 3;
const TASK_TIME = 4;
const TASK_INTERVAL = 5;
const TASK_LAST_DONE = 6;
const TASK_DUE = 7;

var model = {

    fileStatus: NO_FILE_LOADED,

    description: "save data file for the cleaningRota web applet",

    filename: null,
    lastOpened: null,

    dueUpdateMethod: DUE_UPDATE_METHOD_AUTOMATIC,
    displayFormat: DISPLAY_FORMAT_ROOM_PANEL,

    rooms: {
        "attributes": ["id","name"],
        "data": []
    },
    groups: {
        "attributes": ["id","roomId","groupName","parentTaskId"],
        "data": []
    },
    tasks: {
        "attributes": ["id","roomId","groupId","name","time","interval","lastDone","due"],
        "data": []
    },

    buildFromJson(){

    },

    new(filename) {

        this.filename = filename;
        this.lastOpened = Date.now();

        this.dueUpdateMethod = DUE_UPDATE_METHOD_AUTOMATIC,
        this.displayFormat = DISPLAY_FORMAT_ROOM_PANEL,

        this.rooms = {
            "attributes": ["id","name"],
            "data": []
        };
        this.groups = {
            "attributes": ["id","roomId","groupName","parentTaskId"],
            "data": []
        };
        this.tasks = {
            "attributes": ["id","roomId","groupId","name","time","interval","lastDone","due"],
            "data": []
        };

        this.setFileStatus(NEW_FILE_UNSAVED_CHANGES);
    },

    addRoom(roomName) {
        var id;
        if (this.rooms.data.length === 0) id = 0;
        else  {
            id = this.rooms.data[this.rooms.data.length-1][ROOM_ID];
            id++;
        }
        this.rooms.data.push([id,roomName]);

        this.addGroup(id,"other",null);

        return id;
    },

    deleteRoom(roomId) {
        this.rooms.data = this.rooms.data.filter(room => room[ROOM_ID] !== roomId);
        this.groups.data = this.groups.data.filter(group => group[GROUP_ROOM_ID] !== roomId);
        this.tasks.data = this.tasks.data.filter(task => task[TASK_GROUP_ID] !== roomId);
    },

    renameRoom(roomId, roomName) {
        for (const e in this.rooms.data) {
            if (this.rooms.data[e][ROOM_ID] === roomId) {
                this.rooms.data[e][ROOM_NAME] = roomName;
                break;
            }
        }
    },

    addGroup(roomId, groupName, parentTaskId) {
        var id;
        if (this.groups.data.length === 0) id = 0;
        else {
            id = this.groups.data[this.groups.data.length-1][GROUP_ID];
            id++;
        }
        this.groups.data.push([id,roomId,groupName,parentTaskId]);
        return id;
    },

    addTask(roomId, groupId) {

        var taskId;
        if (this.tasks.data.length === 0) taskId = 0;
        else {
            taskId = this.tasks.data[this.tasks.data.length-1][TASK_ID];
            taskId++;
        }

        if (groupId === null) {
            for (const e in this.groups.data) {
                if (this.groups.data[e][GROUP_ROOM_ID] === roomId) {
                    if (this.groups.data[e][GROUP_NAME] === "other") {
                        groupId = this.groups.data[e][GROUP_ID];
                    }
                }
            }
        }

        this.tasks.data.push([taskId,roomId,groupId,null,null,null,null,null]);

        return taskId;
    },

    addSubTask(taskId) {

        var taskLocation = this.locationOf(this.tasks.data,TASK_ID,taskId);

        var roomId = this.tasks.data[taskLocation][TASK_ROOM_ID];
        var groupId = this.tasks.data[taskLocation][TASK_GROUP_ID];
        var taskName = this.tasks.data[taskLocation][TASK_NAME];

        var groupLocation = this.locationOf(this.groups.data,GROUP_ID,groupId);

        if (this.groups.data[groupLocation][GROUP_NAME] === "other") {
            groupId = this.addGroup(roomId,taskName,taskId);
            this.tasks.data[taskLocation][TASK_GROUP_ID] = groupId;
        }

        var subTaskId = this.addTask(roomId,groupId);
        return subTaskId;
    },

    deleteTask(taskId) {

        var taskLocation;
        for (var t=0; t<this.tasks.data.length; t++) {
            if (this.tasks.data[t][TASK_ID] === taskId) {
                taskLocation = t;
                break;
            }
        }

        var groupId = this.tasks.data[taskLocation][TASK_GROUP_ID];

        this.tasks.data.splice(taskLocation,1);

        var groupLocation;
        for (var g=0; g<this.groups.data.length; g++) {
            if (this.groups.data[g][GROUP_ID] === groupId) {
                groupLocation = g;
                break;
            }
        }

        if (this.groups.data[groupLocation][GROUP_NAME] === "other") return;

        //parent task - remove group and children
        if (this.groups.data[groupLocation][GROUP_PARENT_TASK_ID] === taskId) {
            this.tasks.data = this.tasks.data.filter(task => task.groupId !== groupId);
            this.groups.data.splice(groupLocation,1);
        }

        //subtask - turn empty parent into normal task
        else {
            var subTaskCount = 0;
            this.tasks.data.forEach(task => {
                if (task.groupId === groupId) subTaskCount++;
            });
            if (subTaskCount === 1) {
                var roomId = this.tasks.data[taskLocation][TASK_ROOM_ID];
                for (const e in this.groups.data) {
                    if (this.groups.data[e][GROUP_ROOM_ID] === roomId) {
                        if (this.groups.data[e][GROUP_NAME] === "other") {
                            this.tasks.data[taskLocation][TASK_GROUP_ID] = this.groups.data[e][GROUP_ID];
                            break;
                        }
                    }
                }
                this.groups.data.splice(groupLocation,1);
            }
        }

    },

    updateDueDates() {
        this.tasks.data.forEach(task => { this.setTaskDue(task[TASK_ID]); });
    },

    //getter setter

    getAllModelDataAsJsonString() {

        var data = {};

        data["description"] = this.description;
        data["filename"] = this.filename;
        data["lastOpened"] = this.lastOpened;
        data["dueUpdateMethod"] = this.dueUpdateMethod;
        data["displayFormat"] = this.displayFormat;
        data["rooms"] = this.rooms;
        data["groups"] = this.groups;
        data["tasks"] = this.tasks;

        var jsonString = JSON.stringify(
            data,
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

    setAllModelDataFromJsonString(string) {

        var data = JSON.parse(string);

        this.filename = data.filename;
        this.lastOpened = data.lastOpened;
        this.dueUpdateMethod = data.dueUpdateMethod;
        this.displayFormat = data.displayFormat;
        this.rooms = data.rooms;
        this.groups = data.groups;
        this.tasks = data.tasks;

        this.setFileStatus(FILE_LOADED);
    },

    getFileStatus() { return this.fileStatus; },

    setFileStatus(fileStatus) {
        if (fileStatus === UNSAVED_CHANGES && this.fileStatus === NEW_FILE_UNSAVED_CHANGES) return;
        this.fileStatus = fileStatus;
    },

    getFilename(){ return this.filename; },

    setFilename(filename) { this.filename = filename; },

    getLastOpened() { return this.lastOpened; },

    getDueUpdateMethod() { return this.dueUpdateMethod; },

    getRoomNumberOf() { return this.rooms.data.length; },

    getRoomList() { return this.rooms.data; },

    getRoomNameList() {
        var list = [];
        this.rooms.data.forEach(entry =>{
            list.push(entry[ROOM_NAME]);
        })
        return list;
    },

    getRoomAsObject(roomId) {

        var roomObject = {
            id: roomId,
            name: undefined,
            groups: []
        }

        this.rooms.data.forEach(room => {
            if (room[ROOM_ID] === roomId) {
                roomObject.name = room[ROOM_NAME];
            }
        });

        this.groups.data.forEach(group => {
            if (group[GROUP_ROOM_ID] === roomId) {
                roomObject.groups.push({
                    id: group[GROUP_ID],
                    name: group[GROUP_NAME],
                    parentTaskId: group[GROUP_PARENT_TASK_ID],
                    tasks: []
                });
            }
        });

        this.tasks.data.forEach(task => {
            if (task[TASK_ROOM_ID] === roomId) {

                roomObject.groups.forEach(group => {
                    if (group.id === task[TASK_GROUP_ID]) {
                        group.tasks.push({
                            id: task[TASK_ID],
                            name: task[TASK_NAME],
                            time: task[TASK_TIME],
                            interval: task[TASK_INTERVAL],
                            lastDone: task[TASK_LAST_DONE],
                            due: task[TASK_DUE]
                        });
                    }
                });
            }
        });

        return roomObject;
    },

    setRoomName(roomId, roomName) {
        for(const e in this.rooms.data) {
            if (this.rooms.data[e][ROOM_ID] === roomId) {
                console.log("match");
                this.rooms.data[e][ROOM_NAME] = roomName;
                break;
            }
        }
    },

    getGroupId(taskId) {
        var groupId;
        this.tasks.data.forEach(task => {
            if (task[TASK_ID] === taskId) {
                groupId = task[TASK_GROUP_ID];
            }
        });
        return groupId;
    },

    setTaskDetails(id, name, time, interval) {
        for(var t=0; t<this.tasks.data.length; t++) {
            if (id === this.tasks.data[t][TASK_ID]) {
                this.tasks.data[t][TASK_NAME] = name;
                this.tasks.data[t][TASK_TIME] = time;
                this.tasks.data[t][TASK_INTERVAL] = interval;
                break;
            }
        }
    },

    setTaskLastDone(id) {
        var lastDone;
        this.tasks.data.forEach(task => {
            if (task[TASK_ID] === id) {
                lastDone = Date.now();
                task[TASK_LAST_DONE] = lastDone;
            }
        });
        return lastDone;
    },

    setTaskDue(id) {
        var due = null;
        this.tasks.data.forEach(task => {
            if (task[TASK_ID] === id) {
                if (task[TASK_INTERVAL] !== null && task[TASK_LAST_DONE] !== null) {
                    var intervalSeconds = task[TASK_INTERVAL] * 86400000;
                    var dueDate = task[TASK_LAST_DONE] + intervalSeconds;
                    due = (dueDate - Date.now()) / 86400000;
                    task[TASK_DUE] = due;
                }
            }
        });
        return due;
    },

    //data structure functions

    locationOf(data,attribute,value) {
        for (var e=0; e<data.length; e++) {
            if (data[e][attribute] === value) return e; }
        return null;
    },

    locationOfLinear(){

    },

    locationOfBinary(){

    },

    valueOfWhereAttribute(){

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

    textInputOnChange(event, applyButton) {
        event.target.parentElement.className = view.inputChangeStyle;
        if (applyButton !== null) {
            view.enableOrDisableListOfInputsById([applyButton],ENABLE,view.defaultStyle);
        }
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

            view.showModelData();
        }
        catch(e) { console.log(e); }
    },

    loadFile(event){
        var fileReference = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) { 
            model.setAllModelDataFromJsonString(event.target.result);
            if (model.getDueUpdateMethod() === DUE_UPDATE_METHOD_AUTOMATIC) model.updateDueDates();
            view.showModelData();
        }
        reader.readAsText(fileReference);
    },

    async saveFile(){
        var fileStatus = model.getFileStatus();

        if (fileStatus === NO_FILE_LOADED) {
            await customAlertPromise("Cannot save file, no file loaded.");
        }
        else {
            var data = model.getAllModelDataAsJsonString();
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

    selectDueUpdateMethod(){

    },

    updateDueDates(){

    },

    selectDisplayFormat(){

    },

    deleteRoom(){
        model.deleteRoom(view.selectedRoomId);
        if (model.getRoomNumberOf() === 0) {
            view.enableOrDisableListOfInputsById(["deleteRoom"],DISABLE,view.buttonDisabledStyle); }
        view.enableOrDisableListOfInputsById(["roomName"],DISABLE,view.inputDisabledStyle);
        $("room-"+view.selectedRoomId).remove();
        view.selectedRoomId = null;
        $("roomName").value = "";
        $("taskListPanel").lastElementChild.remove();
    },

    selectRoom(event){

        var roomButton = event.target;
        var roomId = parseInt(roomButton.id.split("-")[1]);
        if (roomId === view.selectedRoomId) return;
        view.selectedRoomId = roomId;

        view.enableOrDisableListOfInputsById(["deleteRoom"],ENABLE,view.defaultStyle);

        var roomObject = model.getRoomAsObject(roomId);

        view.lastSelectedTaskId = null;

        $("roomName").value = roomObject.name;
        view.enableOrDisableListOfInputsById(["roomName"],ENABLE,view.defaultStyle);

        var taskListElement = document.createElement("div");
        taskListElement.className = "taskList";

        roomObject.groups.forEach(group => {
            
            var parentTaskElement = undefined;

            //create parent task if 
            for (var t=0; t<group.tasks.length; t++) {
                if(group.tasks[t].id === group.parentTaskId) {
                    var task = group.tasks[t];
                    parentTaskElement = view.createTaskElement("task",task.id, task.name, task.time, task.interval, task.lastDone, task.due);
                    for (const taskLocation in group.tasks) {
                        if (group.tasks[taskLocation].id === group.parentTaskId) {
                            group.tasks.splice(taskLocation,1); }}
                }
            }

            if (group.tasks.length > 0) {
                
                //create task
                if (parentTaskElement === undefined) {
                    group.tasks.forEach(task => {
                        var taskElement = view.createTaskElement("task",task.id, task.name, task.time, task.interval, task.lastDone, task.due);
                        taskListElement.appendChild(taskElement);
                    });
                }

                //create sub task for parent task
                else {
                    var subTaskList = document.createElement("div");
                    subTaskList.className = "subTaskList";
                    group.tasks.forEach(task => {
                        var subTaskElement = view.createTaskElement("task",task.id, task.name, task.time, task.interval, task.lastDone, task.due);
                        subTaskList.appendChild(subTaskElement);
                    });
                    var subTaskListContainer = document.createElement("div");
                    subTaskListContainer.className = "subTaskListContainer";
                    subTaskListContainer.appendChild(subTaskList);
                    parentTaskElement.appendChild(subTaskListContainer);
                }
            }

            if (parentTaskElement !== undefined) {
                taskListElement.appendChild(parentTaskElement);
            }
        });

        taskListElement.addEventListener("click", event => {
            if (event.target.type === "radio") view.selectTask(event); });
        taskListElement.addEventListener("keyup", event => {
            if (event.target.type === "text" || event.target.type === "number") {
                view.textInputOnChange(event, "taskApply"); }});

        if ($("taskListPanel").lastElementChild.className === "taskList") document.getElementById("taskListPanel").lastElementChild.remove();
        document.getElementById("taskListPanel").appendChild(taskListElement);
    },

    async addRoom(){
        try
        {
            var name = await view.customPromptPromise("Please enter new room name.");    
            var roomId = model.addRoom(name);
            model.addTask(roomId,null);

            var button = document.createElement("button");
            button.id = "room-"+roomId;
            button.innerHTML = name;
            $("roomButtons").appendChild(button);
            view.enableOrDisableListOfInputsById(["deleteRoom"],ENABLE,view.defaultStyle);
        }
        catch(e) { console.log(e); }
    },

    roomNameApply(){
        var roomName = $("roomName").value;
        model.setRoomName(view.selectedRoomId,roomName);
        $("roomName").parentElement.className = view.defaultStyle;
        view.enableOrDisableListOfInputsById(["roomNameApply"],DISABLE,view.buttonDisabledStyle);
        $("room-"+view.selectedRoomId).innerHTML = roomName;
    },

    selectTask(event){
        var taskElementId = event.target.parentElement.id;
        view.selectTaskByElementId(taskElementId);
    },

    taskApply(event) {
        var taskElement = event.target.parentElement.parentElement;
        var taskListElement = taskElement.parentElement;
        var taskListType = taskListElement.className;
        
        var taskButtonsClassName;
        if (taskListType === "taskList") taskButtonsClassName = "taskButtons";
        else if (taskListType === "subTaskList") taskButtonsClassName = "subTaskButtons";

        var id = parseInt(taskElement.id.split("-")[SELECTED_TASK_ID]);
        var name = taskElement.children[NAME_INPUT].firstChild.value;
        var time = parseInt(taskElement.children[TIME_INPUT].firstChild.value);
        var interval = parseInt(taskElement.children[INTERVAL_INPUT].firstChild.value);

        if (time === "") time = null;
        if (interval === "") interval = null;

        model.setTaskDetails(id,name,time,interval);

        var due = model.setTaskDue(id);
        if (due !== null) {
            var taskDueElement = taskElement.children[DUE_INPUT];
            taskDueElement.innerHTML = due.toFixed(1);
            taskDueElement.style.border = view.dueBorderStyle(due.toFixed(1));
        }

        taskElement.children[NAME_INPUT].className = view.defaultStyle;
        taskElement.children[TIME_INPUT].className = view.defaultStyle;
        taskElement.children[INTERVAL_INPUT].className = view.defaultStyle;

        var applyTaskElement = document.getElementsByClassName(taskButtonsClassName)[0].children[0];
        view.enableOrDisableListOfInputsByElement([applyTaskElement],DISABLE,view.buttonDisabledStyle);

        if (name !== "") {
            view.enableOrDisableListOfInputsByElement(
                [document.getElementsByClassName(taskButtonsClassName)[0].children[TASK_ADD_SUB_TASK_BUTTON]],
                ENABLE,
                this.defaultStyle
            ); }
    },

    taskComplete(event) {
        var taskElement = event.target.parentElement.parentElement;
        var taskId = parseInt(taskElement.id.split("-")[1]);

        var taskLastDone = model.setTaskLastDone(taskId);
        taskElement.children[LAST_DONE_INPUT].innerHTML = view.getDateString(taskLastDone);

        var taskDue = model.setTaskDue(taskId);
        var taskDueElement = taskElement.children[DUE_INPUT];
        taskDueElement.innerHTML = taskDue.toFixed(1);
        taskDueElement.style.border = view.dueBorderStyle(taskDue.toFixed(1));
    },

    taskAdd(event) {
        var taskElement = event.target.parentElement.parentElement;
        var taskId = parseInt(taskElement.id.split("-")[1]);
        var taskListElement = taskElement.parentElement
        var taskListType = taskListElement.className;
        
        var roomId = view.selectedRoomId;
        var groupId;
        if (taskListType === "taskList") 
            groupId = null;
        else if (taskListType === "subTaskList") 
            groupId = model.getGroupId(taskId);

        var addedTaskId = model.addTask(roomId,groupId);

        var taskElement = view.createTaskElement("task",addedTaskId,null,null,null,null,null);
        taskListElement.appendChild(taskElement);
        view.selectTaskByElementId("task-"+addedTaskId);
    },

    taskDelete(event) {
        var taskElement = event.target.parentElement.parentElement;
        var taskId = view.lastSelectedTaskId;
        var taskListElement = taskElement.parentElement;
        var taskListType = taskListElement.id;
        model.deleteTask(taskId);

        taskElement.remove();
        view.lastSelectedTaskId = null;
        view.selectTaskByElementId(taskListElement.lastElementChild.id);
    },

    taskAddSubTask(event) {
        var taskElement = event.target.parentElement.parentElement;
        var taskId = view.lastSelectedTaskId;
        var taskListElement = taskElement.parentElement;
        var taskListType = taskListElement.className;

        var parentTaskId = view.lastSelectedTaskId;
        var subTaskId = model.addSubTask(parentTaskId);

        var subTaskElement = view.createTaskElement("task",subTaskId,null,null,null,null,null);
        if (taskElement.children.length === SELECTED_TASK_LIST_LENGTH) {
            var subTaskListElement;
            subTaskListElement = document.createElement("div");
            subTaskListElement.className = "subTaskList";
            subTaskListElement.appendChild(subTaskElement);
            var subTaskListContainerElement = document.createElement("div");
            subTaskListContainerElement.className = "subTaskListContainer";
            subTaskListContainerElement.appendChild(subTaskListElement);
            taskElement.appendChild(subTaskListContainerElement);
        }
        else {
            var subTaskListElement = document.querySelector("#"+taskId+" .subTaskList");
            subTaskElement.appendChild(subTaskElement);
        }
        view.selectTaskByElementId(subTaskElement.id);
    },

    //UI helper functions

    showModelData() {

        this.selectedRoomId = null;
        this.lastSelectedTaskId = null;

        // file

        view.showFileStatus(model.getFileStatus());

        $("filename").value = model.getFilename();
        view.enableOrDisableListOfInputsById(["filename"], ENABLE, this.defaultStyle);

        $("lastOpened").value = view.getDateString(model.getLastOpened());

        // options
        view.enableOrDisableListOfInputsById(["importMethod","import","importFileFormat"],ENABLE,this.defaultStyle);
        view.enableOrDisableListOfInputsById(["dueUpdateMethod","displayFormat"],ENABLE,this.defaultStyle);
        if ($("dueUpdateMethod").selectedIndex === DUE_UPDATE_METHOD_AUTOMATIC) {
            view.enableOrDisableListOfInputsById(["updateDueDates"], DISABLE, this.buttonDisabledStyle); }
        else if ($("dueUpdateMethod").selectedIndex === DUE_UPDATE_METHOD_MANUAL) {
            view.enableOrDisableListOfInputsById(["updateDueDates"], ENABLE, this.defaultStyle); }

        // room

        view.enableOrDisableListOfInputsById(["left","right","addRoom"],ENABLE,this.defaultStyle);

        var rooms = model.getRoomList();
        $("roomButtons").innerHTML = "";
        for (const i in rooms) {
            var button = document.createElement("button");
            button.id = "room-"+rooms[i][ROOM_ID];
            button.innerHTML = rooms[i][ROOM_NAME];
            $("roomButtons").appendChild(button);
        }
        if ($("roomButtons").childElementCount > 0) {
            this.enableOrDisableListOfInputsById(["deleteRoom"],ENABLE, this.defaultStyle); }
        else this.enableOrDisableListOfInputsById(["deleteRoom"],DISABLE, this.buttonDisabledStyle);

        $("roomName").value = "";

        document.getElementsByClassName("taskList")[0].innerHTML = "";
    },

    createButtonsElement(taskListType) {
        var buttonsElement = document.createElement("div");
        if (taskListType === "taskList") buttonsElement.className = "taskButtons";
        else if (taskListType === "subTaskList") buttonsElement.className = "subTaskButtons";
        buttonsElement.appendChild(view.createButton("Apply",view.buttonDisabledStyle,"taskApply",view.taskApply));
        buttonsElement.appendChild(view.createButton("Complete",null,"taskComplete",view.taskComplete));
        buttonsElement.appendChild(view.createButton("Add Task",null,"taskAdd",view.taskAdd));
        buttonsElement.appendChild(view.createButton("Delete Task",null,"taskDelete",view.taskDelete));
        if (taskListType === "taskList") buttonsElement.appendChild(view.createButton("Add Sub Task",null,"taskAddSubTask",view.taskAddSubTask));
        else if (taskListType === "subTaskList") buttonsElement.appendChild(document.createElement("div"));
        return buttonsElement;
    },

    createTaskElement(type,id,name,time,interval,lastDone,due) {

        var taskElement = document.createElement("div");
        taskElement.className = type;
        taskElement.id = type + "-" + id;

        //fucking name
        var div = document.createElement("div");
        var input = document.createElement("input");
        input.type = "text";
        input.className = "inputDisabled-2";
        input.autocomplete = false;
        input.disabled = true;
        input.value = (name ? name : "");
        div.appendChild(input);
        taskElement.appendChild(div);

        //fucking time
        var div = document.createElement("div");
        var input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.className = "inputDisabled-2";
        input.autocomplete = false;
        input.disabled = true;
        input.value = (time ? time : "");
        div.appendChild(input);
        taskElement.appendChild(div);

        //fucking interval
        var div = document.createElement("div");
        var input = document.createElement("input");
        input.type = "number";
        input.min = "1";
        input.className = "inputDisabled-2";
        input.autocomplete = false;
        input.disabled = true;
        input.value = (interval ? interval : "");
        div.appendChild(input);
        taskElement.appendChild(div);

        //fucking last done
        var textarea = document.createElement("textarea");
        textarea.className = "readOnlySmall";
        textarea.spellcheck = false;
        textarea.autocomplete = false;
        textarea.disabled = true;
        textarea.innerHTML = (lastDone ? view.getDateString(lastDone) : "Never");
        taskElement.appendChild(textarea);

        //fucking due
        var textarea = document.createElement("textarea");
        textarea.className = "readOnlySmall";
        textarea.spellcheck = false;
        textarea.autocomplete = false;
        textarea.disabled = true;

        if (due !== null) {
            textarea.innerHTML = due.toFixed(1);
            textarea.style.border = view.dueBorderStyle(due.toFixed(1));
        }
        else { textarea.innerHTML = ""; }

        taskElement.appendChild(textarea);

        //fucking cunt radio button
        var input = document.createElement("input");
        input.type = "radio";
        input.name = "taskSelect";
        taskElement.appendChild(input);

        return taskElement;
    },

    dueBorderStyle(due) {
        if (due >= 1) { return "solid 1px green"; }
        else if (due < 1 && due >= 0) { return "solid 1px orange"; }
        else if (due < 0) { return "solid 1px red"; }
        return "";
    },

    selectTaskByElementId(taskElementId) {
        var taskElement = $(taskElementId);
        var taskListElement = taskElement.parentElement;
        var taskListType = taskListElement.className;
        var selectedTaskId = parseInt(taskElement.id.split("-")[1]);

        //deselect last task
        if (view.lastSelectedTaskId !== null) {
            var last = $("task-"+view.lastSelectedTaskId);
            view.enableOrDisableListOfInputsByElement(
                [ last.children[NAME_INPUT].firstElementChild, last.children[TIME_INPUT].firstElementChild, last.children[INTERVAL_INPUT].firstElementChild ],
                DISABLE,
                view.inputDisabledStyle_2
            );
            last.children[RADIO_INPUT].checked = false;
            last.children[SELECTED_TASK_BUTTONS_ELEMENT].remove();
        }

        //select new task
        view.enableOrDisableListOfInputsByElement(
            [ 
                taskElement.children[NAME_INPUT].firstElementChild, 
                taskElement.children[TIME_INPUT].firstElementChild, 
                taskElement.children[INTERVAL_INPUT].firstElementChild ],
            ENABLE,
            view.defaultStyle
        );
        taskElement.children[RADIO_INPUT].checked = true;

        view.lastSelectedTaskId = selectedTaskId;

        var buttonsElement = view.createButtonsElement(taskListType);

        //button delete disable
        if (taskListElement.children.length === 1) {
            view.enableOrDisableListOfInputsByElement(
                [buttonsElement.children[TASK_DELETE_BUTTON]],
                DISABLE,
                view.buttonDisabledStyle
            );
        }

        //button sub task add disable
        if(taskListType === "taskList") {
            if(taskElement.children[NAME_INPUT].firstElementChild.value === "") {
                this.enableOrDisableListOfInputsByElement(
                    [buttonsElement.children[TASK_ADD_SUB_TASK_BUTTON]],
                    DISABLE,
                    this.buttonDisabledStyle
                ); }}


        //no subTaskList element
        if (taskElement.children.length === DESELECTED_TASK_LIST_LENGTH) {
            taskElement.appendChild(buttonsElement); } 
        
        //subTaskList element
        else taskElement.insertBefore(buttonsElement, taskElement.lastElementChild);
    },

    //UI generic helper functions

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

    showFileStatus(fileStatus) {
        if (fileStatus === FILE_LOADED) { $("fileStatus").textContent = "File Loaded"; }
        else if (fileStatus === NEW_FILE_UNSAVED_CHANGES) { $("fileStatus").textContent = "New File, Unsaved Changes"; }
        else if (fileStatus === UNSAVED_CHANGES) { $("fileStatus").textContent = "Unsaved Changes"; }
        else if (fileStatus === SAVED_CHANGES) { $("fileStatus").textContent = "Saved Changes"; }
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
    },

    //generic helper functions

    getDateString(unixTimeStamp) {
        var date = new Date(unixTimeStamp);
        var dateString = "";
        dateString += date.getUTCDate();
        dateString += "/" + (date.getUTCMonth() + 1);
        dateString += "/" + date.getUTCFullYear();
    
        return dateString;
    }
}

window.onload = async function () {
    
    
    //html

    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
    });

    //event handlers

    if (window.File && window.FileReader && window.FileList && window.Blob);
    else alert('The File APIs are not fully supported in this browser.');

    $("fileInput").addEventListener("change", view.loadFile);
    $("newFile").addEventListener("click", view.newFile);
    $("saveFile").addEventListener("click", view.saveFile);

    $("filename").addEventListener("keyup", event => {
        view.textInputOnChange(event, "filenameApply")
    });
    $("filenameApply").addEventListener("click", view.filenameApply);

    $("dueUpdateMethod").addEventListener("click",view.selectDueUpdateMethod);
    $("updateDueDates").addEventListener("click", view.updateDueDates);
    $("displayFormat").addEventListener("change", view.selectDisplayFormat);

    $("deleteRoom").addEventListener("click", view.deleteRoom);
    $("roomButtons").addEventListener("click", view.selectRoom);
    $("addRoom").addEventListener("click", view.addRoom);

    $("roomName").addEventListener("keyup", event => {
        view.textInputOnChange(event,"roomNameApply");
    });
    $("roomNameApply").addEventListener("click", view.roomNameApply);
    
    // $("bodyContent").addEventListener("click", event => {
    //     var data = {};

    //     data["description"] = model.description;
    //     data["filename"] = model.filename;
    //     data["lastOpened"] = model.lastOpened;
    //     data["dueUpdateMethod"] = model.dueUpdateMethod;
    //     data["displayFormat"] = model.displayFormat;
    //     data["rooms"] = model.rooms;
    //     data["groups"] = model.groups;
    //     data["tasks"] = model.tasks;

    //     console.log(data);
    // });
}