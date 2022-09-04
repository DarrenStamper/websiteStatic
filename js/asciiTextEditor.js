'use strict';

import { $, loadNavbar, navbarDropdown } from "./global.js";

var DISABLE = true;
var ENABLE = false;

var NO_FILE_LOADED = 0;
var FILE_LOADED = 1;
var NEW_FILE_UNSAVED_CHANGES = 2;
var UNSAVED_CHANGES = 3;
var SAVED_CHANGES = 4;

var model = {

    documentWidthInCharacters: 149,

    fileStatus: null,
    filename: null,
    lastModified: null,

    fileStatus_set(fileStatus) {
        if (this.fileStatus === NEW_FILE_UNSAVED_CHANGES && fileStatus === UNSAVED_CHANGES) return;
        else this.fileStatus = fileStatus;
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
        lastModifiedElement: $("lastModified"),

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

        name_enable() { view.enableOrDisableListOfInputsByElement([this.nameElement],ENABLE,view.defaultStyle); },

        name_disable() { view.enableOrDisableListOfInputsByElement([this.nameElement],DISABLE,view.inputDisabledStyle); },

        name_onChange() {
            this.nameElement.parentElement.className = view.inputChangeStyle;
            view.enableOrDisableListOfInputsByElement([this.nameApplyElement],ENABLE,view.defaultStyle);
        },

        name_apply() {
            this.nameElement.parentElement.className = view.defaultStyle;
            view.enableOrDisableListOfInputsByElement(this.nameApplyElement,DISABLE,view.inputDisabledStyle);
        },

        lastModified_set(lastModified) { 
            //unix timestamp
            var date = new Date(lastModified);
            var dateString = date.getDate() + "/"
                           + (date.getMonth()+1) + "/"
                           + date.getFullYear() + " "
                           + date.getSeconds() + ":"
                           + date.getMinutes() + ":"
                           + date.getHours();
            this.lastModifiedElement.value = dateString;
        }

    },

    editor: {

        docTextareaElement: $("docTextarea"),

        disable() {
            this.docTextareaElement.disabled = true;
            this.docTextareaElement.className = this.textareaDisabledStyle;
        },

        enable() {
            this.docTextareaElement.disabled = false;
            this.docTextareaElement.className = this.defaultStyle;
        },

        set(documentText) { this.docTextareaElement.value = documentText; },

        get() { return this.docTextareaElement.value; }
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

    enableOrDisableListOfInputsByElement(inputList, disabled, inputStyle) {
        for (var i=0; i<inputList.length; i++) {
            inputList[i].disabled = disabled;
            inputList[i].className = inputStyle;
        }
    },

    save(filename,data) {
        var element = document.createElement("a");
        element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

var controller = {

    file: {

        load(e) {
            var fileReference = e.target.files[0];
            
            var reader = new FileReader();
            reader.onload = function(e) { 
                view.editor.set(e.target.result);
                view.editor.enable();
            }
            reader.readAsText(fileReference);

            model.fileStatus_set(FILE_LOADED);
            model.filename = fileReference.name;
            model.lastModified = fileReference.lastModified;

            view.file.status_set(FILE_LOADED);
            view.file.name_set(model.filename);
            view.file.name_enable();
            view.file.lastModified_set(model.lastModified);
        },
    
        async save() {

            if (model.fileStatus === NO_FILE_LOADED) {
                await view.customAlertPromise("Cannot save file, no file loaded.");
            }
            else {
                var docText = view.editor.get();
                view.save(model.filename, docText);

                model.fileStatus_set(SAVED_CHANGES);
                view.file.status_set(SAVED_CHANGES);
            }
        },
    
        new() {},
    
        name_onChange() { view.file.name_onChange(); },

        name_apply() {
            model.filename = view.file.name_get();
            view.file.name_apply();
    
            model.fileStatus_set(UNSAVED_CHANGES);
            view.file.status_set(UNSAVED_CHANGES);
        },
    }
}

window.onload = async function () {
    
    //build html
    
    loadNavbar().then( () => {
        document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
        document.getElementById("asciiTextEditor").className = "active";
    });

    //set event listeners

    view.file.inputElement.addEventListener("change",controller.file.load);
    view.file.saveElement.addEventListener("click",controller.file.save);
    view.file.newElement.addEventListener("click",controller.file.new);
    view.file.nameElement.addEventListener("keyup",controller.file.name_onChange);
    view.file.nameApplyElement.addEventListener("click",controller.file.name_apply);
}