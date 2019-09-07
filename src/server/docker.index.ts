import Server from "./servers/Server";
import { createILPConnector, closeAllChannels } from './services';
import { UplinkOptions } from './models';
import * as parseArgs from 'minimist';

const isDocker = require('is-docker');
const { CONNECTOR_PORT, ADMIN_API_PORT } = require('./config/uplink.json');

// Check for and create connector if in env and appropriate arguments -- should have 5 but could have 8 if names are args
if (isDocker() && (process.argv.length === 8 || process.argv.length === 5))
{
    // Extract args
    const { uplinkName, testnet, secret } = parseArgs(process.argv.slice(2));
    console.log('Connector name: ' + uplinkName);
    console.log('Connector mode: ' + (testnet === 'false' ? 'LiveNet' : 'TestNet'));

    const uplinkOptions: UplinkOptions = {
        testnet: testnet === 'true',
        secret: secret,
        connectorPort: CONNECTOR_PORT,
        adminApiPort: ADMIN_API_PORT,
        allowedOrigins: [
            'chrome-extension://fakjpmebfmpdbhpnddiokemempckoejk'
        ]
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