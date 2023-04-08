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
        }).then(({ response }) => {
            console.log("Im here");
            if (response === 0) {
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
        }).then(({ response }) => {
            if (response === 0) {
                autoUpdater.quitAndInstall(false, true);
            }
        })
    })

    autoUpdater.on("update-not-available", () => {
        console.log("Update not available");
    });

    autoUpdater.on("error", (error) => {
        console.error("Error during update:", error);
    });

    autoUpdater.on("download-progress", (progress) => {
        console.log(`Download progress: ${progress.percent.toFixed(2)}%`);
    });

    autoUpdater.on("update-downloaded", (info) => {
        console.log("Update downloaded:", info);
    });
}

