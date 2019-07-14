import Server from "./Server";
import { createILPConnector, closeAllChannels } from './services';
import * as parseArgs from 'minimist';

const isDocker = require('is-docker');

// Check for and create connector if in env and appropriate arguments -- should have 5?
if (isDocker() && process.argv.length === 5)
{
    // Extract args
    const { uplinkName, testnet, secret } = parseArgs(process.argv.slice(2));

    const uplinkOptions: any = {
        testnet: testnet === 'true',
        secret: secret
    };

    try
    {
        // Create the connector on the server startup -- has to have the options
        createILPConnector(uplinkName, uplinkOptions);
    }
    catch (error)
    {
        console.error(error.toString());
    }
}

// Create the server for the app
const server: Server = new Server();