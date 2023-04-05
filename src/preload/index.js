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
        document.getElementById("select-folder").style.backgroundColor = "green";
        const pathElement = document.getElementById('path');
        pathElement.textContent = folderPath;
        pathToModel = folderPath;
      }
      else {
        document.getElementById("select-folder").style.backgroundColor = "red";
        const pathElement = document.getElementById('path');
        pathElement.textContent = "Это не модуль: " + folderPath;
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
  }
});