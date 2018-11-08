const electron = require("electron");
const url = require("url");
const path = require("path");

const {app, BrowserWindow} = electron;

let mainWindow;

// Listen for app ready
app.on("ready", function(){
    //create new window
    mainWindow = new BrowserWindow({width: 1150, height: 750});
    //Load html file in new window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "html/LogIn/index.html"),
        protocol: "file:",
        slahes: true
    }));
});
