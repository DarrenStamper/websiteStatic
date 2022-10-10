
'use strict';
import { $, loadNavbar, navbarDropdown } from "./global.js";

try {

    var DISABLE = true;
    var ENABLE = false;

    var DEBUG_CONTROLLER_FILE_FILEREADER = 1;

    var NO_FILE_LOADED = 0;
    var FILE_LOADED = 1;
    var NEW_FILE_UNSAVED_CHANGES = 2;
    var UNSAVED_CHANGES = 3;
    var SAVED_CHANGES = 4;

    // MODEL =================================================================================

    var model = {

        documentWidthInCharacters: 149,

        fileStatus: null,
        filename: null,
        lastModified: null,

        initialise() {},

        fileStatus_set(fileStatus) {
            if (this.fileStatus === NEW_FILE_UNSAVED_CHANGES && fileStatus === UNSAVED_CHANGES) return;
            else this.fileStatus = fileStatus;
        }
    }

    // VIEW ==================================================================================

    var view = {

        defaultStyle: "",
        inputChangeStyle: "inputChange-1",
        inputDisabledStyle: "inputDisabled-1",
        buttonDisabledStyle: "buttonDisabled-1",
        selectDisabledStyle: "selectDisabled-1",
        textareaDisabledStyle: "textareaDisabled-1",
        tableRowSelectedStyle: "var(--colour-2)",

        initialise() {

            view.file.inputElement.addEventListener("change",controller.file.load);
            view.file.saveElement.addEventListener("click",controller.file.save);
            view.file.newElement.addEventListener("click",controller.file.new);
            view.file.nameElement.addEventListener("keyup",controller.file.name_onChange);
            view.file.nameApplyElement.addEventListener("click",controller.file.name_apply);

            window.addEventListener("resize",view.editor.resizeFont);
            window.addEventListener("orientationchange",view.editor.resizeFont);
            view.editor.resizeFont();
        },

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
                // unix timestamp
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

            editorElement: $("editor"),

            disable() {
                this.editorElement.disabled = true;
                this.editorElement.className = this.textareaDisabledStyle;
            },

            enable() {
                this.editorElement.disabled = false;
                this.editorElement.className = this.defaultStyle;
            },

            set(documentText) { this.editorElement.value = documentText; },

            get() { return this.editorElement.value; },

            getFirstLine() { return view.editor.editorElement.value.split("\n")[0]; },

            resizeFont(firstLineString) {

                var tolerance = 5;

                var editorPadding = 40; // left padding + right padding
                var editorWidth = view.editor.editorElement.clientWidth - editorPadding - tolerance;
                
                var spanElementFontSizemin = 0;
                var spanElementFontSizemax = editorWidth;

                var spanElementWidth = 0;
                var spanElementFontSize;
                
                while ( (editorWidth-spanElement >= 0 && editorWidth-spanElement < 5) === false ) {

                    spanElementFontSize = (spanElementFontSizemax - spanElementFontSizemin) / 2;

                    //create hidden element
                    var spanElement = document.createElement("span");
                    spanElement.value = firstLineString;
                    spanElement.style.zIndex = -1;
                    spanElement.style.width = "max-content";
                    spanElement.style.position = "absolute";
                    spanElement.style.top = 0;
                    spanElement.style.left = 0;
                    spanElement.id = "spanElement";
                    spanElement.fontSize = spanElementFontSize + "px";
                    document.appendChild(spanElement);

                    spanElementWidth = document.getElementById("spanElement");
                    document.removeChild(spanElement);
                    if (spanElementWidth < editorWidth) { spanElementFontSizemin = spanElementFontSize; }
                    else spanElementFontSizemax = 
                }



                //resize font

                //measure element width
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

    // CONTROLLER ============================================================================

    var controller = {

        initialise() {

            // fileReader

            if (window.File && window.FileReader && window.FileList && window.Blob);
            else alert('The File APIs are not fully supported in this browser.');

            controller.file.fileReader.onabort = e => { 
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onabort: ",e); }
            }

            controller.file.fileReader.onerror = e => {
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onerror: ",e); }
            }

            controller.file.fileReader.onload = e => { 
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onload: ",e); }

                view.editor.set(controller.file.fileReader.result);
                view.editor.enable();
            }

            controller.file.fileReader.onloadend = e => {
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onloadend: ",e); }
            }

            controller.file.fileReader.onloadstart = e => {
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onloadstart: ",e); }
            }

            controller.file.fileReader.onprogress = e => {
                if (DEBUG_CONTROLLER_FILE_FILEREADER) { console.log("controller.file.fileReader.onprogress: ",e); }
            }
        },

        file: {

            fileReader: new FileReader(),

            load(e) {
                try {
                    var fileReference = e.target.files[0];

                    controller.file.fileReader.readAsText(fileReference);

                    model.fileStatus_set(FILE_LOADED);
                    model.filename = fileReference.name;
                    model.lastModified = fileReference.lastModified;
        
                    view.file.status_set(FILE_LOADED);
                    view.file.name_set(model.filename);
                    view.file.name_enable();
                    view.file.lastModified_set(model.lastModified);
                }
                catch(e) {
                    alert("error - controller.file.load: " + e.message);
                }
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

        try {
            // logs
            console.stdlog = console.log.bind(console);
            console.logs = [];
            console.log = function() {
                console.stdlog.apply(console, arguments);
                console.logs.push(Array.from(arguments));
                Array.from(arguments).forEach( (string) => {
                    $("consoleLog").value += string + "\n";
                });
            }
            // error
            console.defaultError = console.error.bind(console);
            console.errors = [];
            console.error = function(){
                // default &  console.error()
                console.defaultError.apply(console, arguments);
                // new & array data
                console.errors.push(Array.from(arguments));
                Array.from(arguments).forEach( (string) => {
                    $("consoleLog").value += string + "\n";
                });
            }
            // warn
            console.defaultWarn = console.warn.bind(console);
            console.warns = [];
            console.warn = function(){
                // default &  console.warn()
                console.defaultWarn.apply(console, arguments);
                // new & array data
                console.warns.push(Array.from(arguments));
                Array.from(arguments).forEach( (string) => {
                    $("consoleLog").value += string + "\n";
                });
            }
            // debug
            console.defaultDebug = console.debug.bind(console);
            console.debugs = [];
            console.debug = function(){
                // default &  console.debug()
                console.defaultDebug.apply(console, arguments);
                // new & array data
                console.debugs.push(Array.from(arguments));
                Array.from(arguments).forEach( (string) => {
                    $("consoleLog").value += string + "\n";
                });
            }

            // build html
            loadNavbar().then( () => {
                document.getElementById("navbarIcon").addEventListener("click", navbarDropdown);
                document.getElementById("asciiTextEditor").className = "active";
            });

            view.initialise();
            controller.initialise();

            window.addEventListener("resize", e => {
                var el = document.getElementById("docTextarea");
                el.style.fontSize = el.clientWidth / 38 + "px";
            })
            window.mrf = function() {
                var el = document.getElementById("docTextarea");
                el.style.fontSize = el.clientWidth / 38 + "px";
            }
        }
        catch(e) { alert("asciiTextEditor.js - window.onload: " + e.message); }
    }
}
catch(e) {
    alert("asciiTextEditor.js - top level error: " + e.message);
}