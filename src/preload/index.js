const { ipcRenderer, contextBridge } = require('electron');
const path = require('path');

let pathToModel;

contextBridge.exposeInMainWorld('myApi', {
  openFolder() {
    ipcRenderer.send('select-folder');
  },
  getPath() {
    ipcRenderer.on('selected-folder', (_, folderPath) => {
      if (path.basename(folderPath).includes("vosk")) {
        document.getElementById("select-folder").style.backgroundColor = "#6CE987";
        const recBtn = document.getElementById('start-rec');
        recBtn.classList.remove("disabled");
        recBtn.setAttribute("title", folderPath);
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
      let newp = document.createElement("p");
      newp.innerText = data;
      document.getElementById("messages").appendChild(newp);
    })
  },
  showSaveDialog() {
    ipcRenderer.send('open-save-dialog');
  }
});