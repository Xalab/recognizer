import path from 'path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
const { spawn } = require('child_process');
import Express from 'express';
import bodyParser from 'body-parser';

console.log("Приложение начинает работу!");

const createWindow = () => {
  let win = new BrowserWindow({
    title: CONFIG.name,
    width: CONFIG.width,
    height: CONFIG.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: true,
      preload: path.join(app.getAppPath(), 'preload', 'index.js')
    }
  })

  console.log(path.join(app.getAppPath(), 'preload', 'index.js'))

  win.loadFile('renderer/index.html')
  console.log("Приложение загрузило страницу!")

  //win.webContents.openDevTools();

  win.on('closed', () => {
    win = null
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

let pathToModel;

function selectFolder() {
  dialog.showOpenDialog({
    properties: ['openDirectory']
  }).then(result => {
    console.log(result.canceled);
    console.log(result.filePaths);
    pathToModel = result.filePaths[0];
    BrowserWindow.getFocusedWindow().webContents.send('selected-folder', result.filePaths[0]);
    console.log("path is sended!");
  }).catch(err => {
    console.log(err);
  });
}

ipcMain.on('select-folder', (event, arg) => {
  selectFolder();
});

ipcMain.on("recognize", (event, arg) => {
  createRecognizer(arg);
})


const createRecognizer = (pathToModel) => {
  const scriptPath = 'recognition.py';
  const args = ['-m', pathToModel];

  const scriptProcess = spawn('python', [scriptPath, ...args]);

  scriptProcess.stderr.on('data', (data) => {
    // Обработка ошибок из скрипта Python
    console.error(`stderr: ${data}`);
  });

  scriptProcess.on('close', (code) => {
    // Обработка закрытия процесса Python
    console.log(`child process exited with code ${code}`);
  });

  const server = Express();
  const port = 6000;
  server.use(bodyParser.urlencoded({ extended: true }));
  server.use(bodyParser.json());

  server.post('/newRec', (req, res) => {
    req.setEncoding('utf8');
    console.log(req.body);
    const body = req.body;
    console.log(typeof(body));
    console.log(typeof(body["text"]));
    console.log(body["text"].toString('utf-8'));
    const obj = JSON.parse(body["text"]);
    console.log(obj.text.toString('utf-8'));
    if(obj.text.toString('utf-8') != "") {
      const readyMessage = Date.now + obj.text.toString('utf-8')
      BrowserWindow.getFocusedWindow().webContents.send('messages', readyMessage);
    }
    res.sendStatus(200);
  });

  server.listen(port, () => {
    console.log(`Express server is started. Listening at http://localhost:${port}`);
  });
}



