import Server from "./Server";

const m = require('moneyd');
console.log(m);

// Set up the electron app to serve the application
// Create the app
const server: Server = new Server();