const { ipcRenderer, contextBridge } = require('electron');
const path = require('path');

let pathToModel;
let isReady = [false, false];

contextBridge.exposeInMainWorld('myApi', {
  openFolder() {
    ipcRenderer.send('select-folder');
  },
  openRecognition() {
    ipcRenderer.send("open-recognition");
  },
  isRecognition(){
    ipcRenderer.on("is-recognition", (_, is_rec) => {
      let btn_get_rec = document.getElementById("recognition-file");
      if (is_rec) {
        btn_get_rec.style.backgroundColor = "#6CE987";
        isReady[1] = true;
        if(isReady[1] && isReady[0]) {
          const recBtn = document.getElementById('start-rec');
          recBtn.classList.remove("disabled");
          recBtn.setAttribute("title", folderPath);
        }
      }
      else {
        btn_get_rec.style.backgroundColor = "red";
      }
    })
  },
  getPath() {
    ipcRenderer.on('selected-folder', (_, folderPath) => {
      if (path.basename(folderPath).includes("vosk")) {
        document.getElementById("select-folder").style.backgroundColor = "#6CE987";
        isReady[0] = true;
        if(isReady[1] && isReady[0]) {
          const recBtn = document.getElementById('start-rec');
          recBtn.classList.remove("disabled");
          recBtn.setAttribute("title", folderPath);
        }
        pathToModel = folderPath;
      }
      else {
        document.getElementById("select-folder").style.backgroundColor = "red";
      }
    })
  },
  startRec() {
    ipcRenderer.send("recognize", pathToModel);
  },
  getMessage() {
    ipcRenderer.on("messages", (_, data) => {
      let startRecButton = document.getElementById("start-rec");
      let loader = document.getElementById("loader");
      startRecButton.textContent = "Закончить запись";
      let newp = document.createElement("p");
      newp.innerText = data;
      newp.classList.add("message");
      newp.classList.add("animate");
      const messagesContainer = document.getElementById("messages");
      messagesContainer.appendChild(newp);
      setTimeout(() => {
        newp.classList.remove("animate");
      }, 500);
    });
  },
  showSaveDialog() {
    ipcRenderer.send('open-save-dialog');
  },
  savedFile() {
    ipcRenderer.on("saved-file", (_, result) => {
      console.log("its here");
      console.log(result);
      if (result == true) {
        document.getElementById("select-output").style.backgroundColor = "#6CE987";
      }
      else {
        document.getElementById("select-output").style.backgroundColor = "red";
      }
    })
  },
  getScriptErrors() {
    ipcRenderer.on("script-errors", (_, error) => {
      console.log("Script error: " + error);
    })
  },
  diag() {
    ipcRenderer.on("diagnostics", (_, data) => {
      console.log(data);
    })
  }
});