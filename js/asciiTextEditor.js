
'use strict';

//generic functions
import { $ } from "./global.js";

//view functions
import { navbar, dialog } from "./global.js";

//=============================================================================================
// Code Refactor

const FILE_STATUS = {
    NO_FILE_LOADED: 0,
    FILE_LOADED: 1,
    NEW_FILE_UNSAVED_CHANGES: 2,
    UNSAVED_CHANGES: 3,
    SAVED_CHANGES: 4
}

const ORIENTATION = {
    HORIZONTAL: 0,
    VERTICAL: 1
}

const ELEMENT_TYPE = {
    DOCUMENT: 0,
    CONTAINER: 1,
    TITLE: 2,
    TABLE_OF_CONTENTS: 3,
    HEADING_ONE: 4,
    HEADING_TWO: 5,
    HEADING_THREE: 6,
    PARAGRAPH: 7,
    BULLET_LIST: 8,
    BULLET_POINT: 9,
    IMAGE: 10,
}

/**
 * Handles: data model, data manipulation
 */
var model = {

    //prototype
    element: {
        type: null,

        width_numOfCharacters: null,
        width_pixels: null,

        //container variables
        isContainer: null,
        orientation: null,
        childElements: [],
        childElements_maxNumOf: null,

        //element variables
        value: null,
        renderStyle: null,
        renderStrings: [],

        //functions
        render: null
    },

    //data

    file: {
        status: FILE_STATUS.NO_FILE_LOADED,
        name: null,

        status_set (status) {
            if (this.status === FILE_STATUS.NEW_FILE_UNSAVED_CHANGES && status === UNSAVED_CHANGES) return;
            else this.status = status;
        },

        name_set (name) { this.name = name; }
    },

    characterHeight_px_double: null,
    characterWidth_px_double: null,

    characterHeight_px: null,
    characterWidth_px: null,

    lineHeight_px: null,
    documentWidth_FullCharacters: null,

    document: null,

    selectedElement: null,

    //internal functions

    createElement_document () {
        var documentElement = Object.create(this.element);

        documentElement.type = ELEMENT_TYPE.DOCUMENT;
    },

    //interface

    new (filename) {
        this.file.status_set(FILE_STATUS.NEW_FILE_UNSAVED_CHANGES);
        this.file.name_set(filename);
        this.selectedElement = null;
    },

    create_container () {
        var element = Object.create(this.element);

        element.type = ELEMENT_TYPE.CONTAINER;

        element.render = () => {  }

        return element;
    },

    create_title () {
        var element = Object.create(this.element);
    },

    create_tableOfContents () {
        var element = Object.create(this.element);
    },

    create_headingOne () {
        var element = Object.create(this.element);
    },

    create_headingTwo () {
        var element = Object.create(this.element);
    },

    create_headingThree () {
        var element = Object.create(this.element);
    },

    create_paragraph () {
        var element = Object.create(this.element);
    },

    create_bulletList () {
        var element = Object.create(this.element);
    },

    create_bulletPoint () {
        var element = Object.create(this.element);
    },

    create_image () {
        var element = Object.create(this.element);
    },
}

/**
 * Handles: user interaction, page manipulation, field updating
 * 
 * @type {object}
 */
var view = {

    buttonDisabledStyle: "buttonDisabled-1",

    //ui sections

    navbar: navbar,

    dialog: dialog,

    editor: {

        element: $('editor')
    },

    file: {
        
        element: $('file'),

        newElement: $('new'),
        loadElement: $('load'), inputElement: $('input'),
        saveElement: $('save'),
        renameElement: $('rename'),

        statusElement: $('fileStatus'),
        nameElement: $('filename'),

        buttons_all_enable () {
            this.saveElement.className = "";
            this.renameElement.className = "";
        },

        status_set (fileStatus) {
            if (fileStatus === FILE_STATUS.NO_FILE_LOADED) { this.statusElement.textContent = 'No File Loaded'; }
            else if (fileStatus === FILE_STATUS.FILE_LOADED) { this.statusElement.textContent = 'File Loaded'; }
            else if (fileStatus === FILE_STATUS.NEW_FILE_UNSAVED_CHANGES) { this.statusElement.textContent = 'New File Unsaved'; }
            else if (fileStatus === FILE_STATUS.UNSAVED_CHANGES) { this.statusElement.textContent = 'Unsaved Changes'; }
            else if (fileStatus === FILE_STATUS.SAVED_CHANGES) { this.statusElement.textContent = 'Saved Changes'; }
        },

        name_set (filename) { this.nameElement.value = filename; }
    },

    editMode: {

        element: $('editMode'),

        textElement: $('text'),
        layoutElement: $('layout'),

        buttons_all_enable() {
            this.textElement.className = '';
            this.layoutElement.className = '';
        }
    },

    elements: {

        element: $('elements'),

        containerElement: $('container'),
        titleElement: $('title'),
        tableOfContentsElement: $('tableOfContents'),
        headingOneElement: $('headingOne'),
        headingTwoElement: $('headingTwo'),
        headingThreeElement: $('headingThree'),
        paragraphElement: $('paragraph'),
        bulletList: ('bulletList'),
        bulletPoint: ('bulletPoint'),
        image: ('image')
    },

    elementProperties: {

        element: ('elementProperties'),

        splitHorizontalElement: ('splitHorizontal'),
        splitVerticalElement: ('splitVertical'),
        deleteElement: ('delete')
    },

    format: {

        element: ('format'),

        documentWidthElement: ('documentWidth')
    },

    settings: {

        element: ('settings')
    },

    document: {

        element: $('document'),

        /**
         * Calculates height of monospace character in pixels
         * 
         * @returns {Number} character height
         */
        calculateCharacterHeight_double() {

            var text = "A";
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = '16px monospace';
            var textMetrics = context.measureText(text);         
            var height = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent;

            return height;
        },

        /**
         * Calculates width of monospace character in pixels
         * 
         * @returns {number} character width
         */
        calculateCharacterWidth_double() {

            var text = "a";
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            context.font = '16px monospace';
            var textMetrics = context.measureText(text);
            var width = textMetrics.width;

            return width;
        },

        createRandomString(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
              result += characters.charAt(Math.floor(Math.random() * charactersLength));
              counter += 1;
            }
            return result;
        }
    },

    info: {

        element: $('info'),

        fontFamilyElement: $('fontFamily'),
        fontSizeElement: $('fontSize'),
        characterHeightElement: $('characterHeight'),
        lineHeightElement: $('lineHeight'),
        characterWidthElement: $('characterWidth'),
        documentWidthElement: $('documentWidth-2'),

        characterHeight_set(characterHeight) {
            this.characterHeightElement.value = characterHeight.toFixed(2) + ' px | ' + Math.ceil(characterHeight) + ' px';
        },

        lineHeight_set(lineHeight) { this.lineHeightElement.value = lineHeight + ' px'; },

        characterWidth_set(characterWidth) { 
            this.characterWidthElement.value = characterWidth.toFixed(2) + ' px | ' + Math.ceil(characterWidth) + ' px';
        },

        documentWidth_set(documentWidth) { this.documentWidthElement.value = documentWidth + ' chars'; }
    },
}

/**
 * Handles: logic - complex program functionality that ties the model and controller together
 * 
 * @type {object}
 */
var controller = {
    
    //logic

    file: {

        fileReader: new FileReader(),

        async new() {
            
            //check if unsaved changes
            if (model.file.status === FILE_STATUS.NEW_FILE_UNSAVED_CHANGES || model.file.status === FILE_STATUS.UNSAVED_CHANGES) {
                var userOption = await view.dialog.confirm('Current document has unsaved changes. Continue?');
                if (userOption === false) return;
            }

            //get filename

            var dialog_prompt_value = await view.dialog.prompt('Enter Filename:');
            if (dialog_prompt_value === false) return; //user selected cancel

            var filename = dialog_prompt_value;

            //model
            model.new(filename);

            //view

            view.file.buttons_all_enable();
            view.file.status_set(FILE_STATUS.NEW_FILE_UNSAVED_CHANGES);
            view.file.name_set(filename);

            view.editMode.buttons_all_enable();
        },

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
        }
    },

    async initialise() {

        if (window.File && window.FileReader && window.FileList && window.Blob);
        else alert('The File APIs are not fully supported in this browser.');

        //model

        model.characterHeight_px_double = view.document.calculateCharacterHeight_double();
        model.characterWidth_px_double = view.document.calculateCharacterWidth_double();

        model.characterHeight_px = Math.ceil(model.characterHeight_px_double);
        model.characterWidth_px = Math.ceil(model.characterWidth_px_double);

        model.lineHeight_px = Math.ceil(model.characterHeight_px) * 2;
        model.documentWidth_FullCharacters = Math.floor( (view.document.element.offsetWidth -22) / Math.ceil(model.characterWidth_px)); //1px border 10px padding = 22px

        //view

        view.navbar.load().then( () => view.navbar.initialise('asciiTextEditor') );

        view.dialog.initialise();

        view.file.status_set(FILE_STATUS.NO_FILE_LOADED);
        view.file.newElement.addEventListener("click",this.file.new);

        view.info.characterHeight_set(model.characterHeight_px_double);
        view.info.lineHeight_set(model.lineHeight_px);
        view.info.characterWidth_set(model.characterWidth_px_double);
        view.info.documentWidth_set(model.documentWidth_FullCharacters);

        var randomString = view.document.createRandomString(model.documentWidth_FullCharacters);
        view.document.element.innerHTML = randomString;
    }
}

window.onload = () => controller.initialise(); 

//=============================================================================================

// try {

//     var view = {

//         defaultStyle: "",
//         inputChangeStyle: "inputChange-1",
//         inputDisabledStyle: "inputDisabled-1",
//         selectDisabledStyle: "selectDisabled-1",
//         textareaDisabledStyle: "textareaDisabled-1",
//         tableRowSelectedStyle: "var(--colour-2)",

//         initialise() {

//             view.file.inputElement.addEventListener("change",controller.file.load);
//             view.file.saveElement.addEventListener("click",controller.file.save);
//             view.file.newElement.addEventListener("click",controller.file.new);
//             view.file.nameElement.addEventListener("keyup",controller.file.name_onChange);
//             view.file.nameApplyElement.addEventListener("click",controller.file.name_apply);

//             window.addEventListener("resize",view.editor.resizeFont);
//             window.addEventListener("orientationchange",view.editor.resizeFont);
//             view.editor.resizeFont();
//         },

//         file: {

//             inputElement: $("fileInput"),
//             inputTextElement: $("fileInputText"),
//             newElement: $("fileNew"),
//             saveElement: $("fileSave"),
//             statusElement: $("fileStatus"),
//             nameElement: $("filename"),
//             nameApplyElement: $("filenameApply"),
//             lastModifiedElement: $("lastModified"),

//             inputText_set(fileInputText) { this.inputTextElement.innerHTML = fileInputText; },

//             status_set(fileStatus) {
//                 if (fileStatus === NO_FILE_LOADED) { this.statusElement.textContent = "No File Loaded"; }
//                 else if (fileStatus === FILE_LOADED) { this.statusElement.textContent = "File Loaded"; }
//                 else if (fileStatus === NEW_FILE_UNSAVED_CHANGES) { this.statusElement.textContent = "New File, Unsaved Changes"; }
//                 else if (fileStatus === UNSAVED_CHANGES) { this.statusElement.textContent = "Unsaved Changes"; }
//                 else if (fileStatus === SAVED_CHANGES) { this.statusElement.textContent = "Saved Changes"; } 
//             },

//             name_get() { return this.nameElement.value; },
//             name_set(filename) { this.nameElement.value = filename; },

//             name_enable() { view.enableOrDisableListOfInputsByElement([this.nameElement],ENABLE,view.defaultStyle); },

//             name_disable() { view.enableOrDisableListOfInputsByElement([this.nameElement],DISABLE,view.inputDisabledStyle); },

//             name_onChange() {
//                 this.nameElement.parentElement.className = view.inputChangeStyle;
//                 view.enableOrDisableListOfInputsByElement([this.nameApplyElement],ENABLE,view.defaultStyle);
//             },

//             name_apply() {
//                 this.nameElement.parentElement.className = view.defaultStyle;
//                 view.enableOrDisableListOfInputsByElement(this.nameApplyElement,DISABLE,view.inputDisabledStyle);
//             },

//             lastModified_set(lastModified) { 
//                 // unix timestamp
//                 var date = new Date(lastModified);
//                 var dateString = date.getDate() + "/"
//                             + (date.getMonth()+1) + "/"
//                             + date.getFullYear() + " "
//                             + date.getSeconds() + ":"
//                             + date.getMinutes() + ":"
//                             + date.getHours();
//                 this.lastModifiedElement.value = dateString;
//             }

//         },

//         editor: {

//             editorElement: $("editor"),

//             disable() {
//                 this.editorElement.disabled = true;
//                 this.editorElement.className = this.textareaDisabledStyle;
//             },

//             enable() {
//                 this.editorElement.disabled = false;
//                 this.editorElement.className = this.defaultStyle;
//             },

//             set(documentText) { this.editorElement.value = documentText; },

//             get() { return this.editorElement.value; },

//             getFirstLine() { return view.editor.editorElement.value.split("\n")[0]; },

//             resizeFont(firstLineString) {

//                 var tolerance = 5;

//                 var editorPadding = 40; // left padding + right padding
//                 var editorWidth = view.editor.editorElement.clientWidth - editorPadding - tolerance;
                
//                 var spanElementFontSizemin = 0;
//                 var spanElementFontSizemax = editorWidth;

//                 var spanElementWidth = 0;
//                 var spanElementFontSize;
                
//                 while ( (editorWidth-spanElement >= 0 && editorWidth-spanElement < 5) === false ) {

//                     spanElementFontSize = (spanElementFontSizemax - spanElementFontSizemin) / 2;

//                     //create hidden element
//                     var spanElement = document.createElement("span");
//                     spanElement.value = firstLineString;
//                     spanElement.style.zIndex = -1;
//                     spanElement.style.width = "max-content";
//                     spanElement.style.position = "absolute";
//                     spanElement.style.top = 0;
//                     spanElement.style.left = 0;
//                     spanElement.id = "spanElement";
//                     spanElement.fontSize = spanElementFontSize + "px";
//                     document.appendChild(spanElement);

//                     spanElementWidth = document.getElementById("spanElement");
//                     document.removeChild(spanElement);
//                     if (spanElementWidth < editorWidth) { spanElementFontSizemin = spanElementFontSize; }

//                 }



//                 //resize font

//                 //measure element width
//             }
//         },

//         //helper functions

//         customAlertPromise(message) {
//             var customAlertContainer = $("customAlertContainer");
//             var customAlert = $("customAlert");
        
//             customAlert.querySelector(".message").innerHTML = message;
//             customAlertContainer.style.display = "grid";
        
//             return new Promise(function(resolve) {
//                 customAlert.addEventListener("click", function click(e) {
//                     if (e.target.tagName === "BUTTON") {
//                         customAlert.removeEventListener("click", click);
//                         customAlertContainer.style.display = "";
//                         resolve();
//                     }
//                 });
//             });
//         },

//         enableOrDisableListOfInputsByElement(inputList, disabled, inputStyle) {
//             for (var i=0; i<inputList.length; i++) {
//                 inputList[i].disabled = disabled;
//                 inputList[i].className = inputStyle;
//             }
//         },

//         save(filename,data) {
//             var element = document.createElement("a");
//             element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
//             element.setAttribute("download", filename);
//             element.style.display = "none";
//             document.body.appendChild(element);
//             element.click();
//             document.body.removeChild(element);
//         }
//     }

//     // CONTROLLER ============================================================================

//     var controller = {

//         file: {

//             fileReader: new FileReader(),

//             load(e) {
//                 try {
//                     var fileReference = e.target.files[0];

//                     controller.file.fileReader.readAsText(fileReference);

//                     model.fileStatus_set(FILE_LOADED);
//                     model.filename = fileReference.name;
//                     model.lastModified = fileReference.lastModified;
        
//                     view.file.status_set(FILE_LOADED);
//                     view.file.name_set(model.filename);
//                     view.file.name_enable();
//                     view.file.lastModified_set(model.lastModified);
//                 }
//                 catch(e) {
//                     alert("error - controller.file.load: " + e.message);
//                 }
//             },
        
//             async save() {

//                 if (model.fileStatus === NO_FILE_LOADED) {
//                     await view.customAlertPromise("Cannot save file, no file loaded.");
//                 }
//                 else {
//                     var docText = view.editor.get();
//                     view.save(model.filename, docText);

//                     model.fileStatus_set(SAVED_CHANGES);
//                     view.file.status_set(SAVED_CHANGES);
//                 }
//             },
        
//             new() {},
        
//             name_onChange() { view.file.name_onChange(); },

//             name_apply() {
//                 model.filename = view.file.name_get();
//                 view.file.name_apply();
        
//                 model.fileStatus_set(UNSAVED_CHANGES);
//                 view.file.status_set(UNSAVED_CHANGES);
//             },
//         }
//     }

//     // window.onload = async function () {

//     function testetsets() {
//         try {
//             // logs
//             console.stdlog = console.log.bind(console);
//             console.logs = [];
//             console.log = function() {
//                 console.stdlog.apply(console, arguments);
//                 console.logs.push(Array.from(arguments));
//                 Array.from(arguments).forEach( (string) => {
//                     $("consoleLog").value += string + "\n";
//                 });
//             }
//             // error
//             console.defaultError = console.error.bind(console);
//             console.errors = [];
//             console.error = function(){
//                 // default &  console.error()
//                 console.defaultError.apply(console, arguments);
//                 // new & array data
//                 console.errors.push(Array.from(arguments));
//                 Array.from(arguments).forEach( (string) => {
//                     $("consoleLog").value += string + "\n";
//                 });
//             }
//             // warn
//             console.defaultWarn = console.warn.bind(console);
//             console.warns = [];
//             console.warn = function(){
//                 // default &  console.warn()
//                 console.defaultWarn.apply(console, arguments);
//                 // new & array data
//                 console.warns.push(Array.from(arguments));
//                 Array.from(arguments).forEach( (string) => {
//                     $("consoleLog").value += string + "\n";
//                 });
//             }
//             // debug
//             console.defaultDebug = console.debug.bind(console);
//             console.debugs = [];
//             console.debug = function(){
//                 // default &  console.debug()
//                 console.defaultDebug.apply(console, arguments);
//                 // new & array data
//                 console.debugs.push(Array.from(arguments));
//                 Array.from(arguments).forEach( (string) => {
//                     $("consoleLog").value += string + "\n";
//                 });
//             }

//             view.initialise();
//             controller.initialise();

//             window.addEventListener("resize", e => {
//                 var el = document.getElementById("docTextarea");
//                 el.style.fontSize = el.clientWidth / 38 + "px";
//             })
//             window.mrf = function() {
//                 var el = document.getElementById("docTextarea");
//                 el.style.fontSize = el.clientWidth / 38 + "px";
//             }
//         }
//         catch(e) { alert("asciiTextEditor.js - window.onload: " + e.message); }
//     }
// }
// catch(e) {
//     alert("asciiTextEditor.js - top level error: " + e.message);
// }