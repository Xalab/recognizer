import { autoUpdater } from "electron-updater";
import { dialog } from "electron";

autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";

autoUpdater.autoDownload = false;

export const checkForUpdates = () => {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on("update-available", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Update available",
            message: "A new version of Recognizer is available. Do you want to download and install it now?",
            buttons: ["Yes", "No"]
        }).then(({responce}) => {
                if (responce === 0) {
                    autoUpdater.downloadUpdate()
                }
        })
    })

    autoUpdater.on("update-downloaded", () => {
        dialog.showMessageBox({
            type: "info",
            title: "Update ready",
            message: "Insall and restart now?",
            buttons: ["Yes", "Later"]
        }).then(({response}) => {
            if (response === 0) {
                autoUpdater.quitAndInstall(false, true);
            }
        })
    })
}

