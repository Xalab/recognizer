import path from 'path'
import { app, BrowserWindow, dialog, ipcMain } from 'electron'
const { spawn } = require('child_process');
import Express from 'express';
import bodyParser from 'body-parser';
import { checkForUpdates } from './updater';

let allDiagnostics = {
  "dirs": {
    "python": "have to be installed in system",
    "script": "selected in prog"
  }
};

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

app.whenReady().then(setTimeout(() => {
  checkForUpdates();
}, 2000));

app.whenReady().then(() => {
  BrowserWindow.getFocusedWindow().webContents.send('diagnostics', allDiagnostics);
})



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
let outputPath;
let pathToScript;

function getRecFile() {
  dialog.showOpenDialog({
    properties: ['openFile']
  }).then(result => {
    console.log(result.canceled);
    console.log(result.filePaths);
    if(path.basename(result.filePaths[0]).includes("recognition.py")) {
      pathToScript = result.filePaths[0];
      BrowserWindow.getFocusedWindow().webContents.send('is-recognition', true);
      console.log("Got file of recognition!");
    }
    else {
      BrowserWindow.getFocusedWindow().webContents.send('is-recognition', true);
      console.log("File is wrong!");
    }
  }).catch(err => {
    console.log(err);
  });
}

ipcMain.on("open-recognition", () => {
  getRecFile();
})

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

ipcMain.on('open-save-dialog', (event) => {
  const options = {
    title: "Выберите куда сохранить",
    defaultPath: `${new Date().toLocaleTimeString().replace(/:/g, "-")}_${new Date().toLocaleDateString("ru-RU").replace(/\./g, "-")}_recognizer.txt`,
    filters: [{ name: "Text Files", extensions: ["txt"] }],
  };

  dialog.showSaveDialog(options).then((result) => {
    if (!result.canceled) {
      outputPath = result.filePath;
      console.log("save path is ready");
      BrowserWindow.getFocusedWindow().webContents.send('saved-file', true);
    }
  });
});

ipcMain.on("recognize", (event, arg) => {
  createRecognizer(arg, outputPath);
})


const createRecognizer = (pathToModel, outputPath) => {
  const args = ['-m', pathToModel, "-o", outputPath];

  const scriptProcess = spawn("python", [pathToScript, ...args]);

  scriptProcess.stderr.on('data', (data) => {
    // Обработка ошибок из скрипта Python
    console.error(`stderr: ${data}`);
    BrowserWindow.getFocusedWindow().webContents.send('script-errors', data);
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
      const currentDate = new Date();
      const formattedDate = `${currentDate.toLocaleTimeString()} ${currentDate.toLocaleDateString()}`  + " --> ";
      const readyMessage = formattedDate + obj.text.toString('utf-8')
      BrowserWindow.getFocusedWindow().webContents.send('messages', readyMessage);
    }
    res.sendStatus(200);
  });

  server.listen(port, () => {
    console.log(`Express server is started. Listening at http://localhost:${port}`);
  });
}



