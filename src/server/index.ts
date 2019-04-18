import { app, BrowserWindow } from 'electron';
import Server from "./Server";
const path = require('path');

const m = require('moneyd');
console.log(m);

// Set up the electron app to serve the application
// Create the app

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;
let server: Server;

const createWindow = () =>
{
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 300,
        height: 400,
        resizable: false,
        webPreferences: {
          nodeIntegration: true
        }
    });

    // Load index.html and start the server
    if (!server)
    {
        server = new Server();
    }
    mainWindow.loadFile(path.join(__dirname, '../../../dist/index.html'));

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => 
    {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;

        // Kill the server
        server.Close();
    });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () =>
{
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin')
    {
        app.quit();

        // Kill the server
        server.Close();
    }
});

app.on('activate', () =>
{
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) 
    {
        createWindow();
    }
});