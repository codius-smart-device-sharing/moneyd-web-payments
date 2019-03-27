import { app, BrowserWindow } from 'electron';
import Server from "./Server";

// Set up the electron app to serve the application
// Create the app

app.on('ready', () => {
    const a: Server = new Server()
    console.log(a);
});