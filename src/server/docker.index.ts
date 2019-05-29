import Server from "./Server";
import { createILPConnector, closeAllChannels } from './services';
import * as parseArgs from 'minimist';

// Check for docker and create connector if in env and appropriate arguments
if (process.env.DOCKER && process.argv.length === 4)
{
    // Extract args
    const { uplinkName, testnet, secret } = parseArgs(process.argv.slice(2));

    const uplinkOptions: any = {
        testnet: testnet === 'true',
        secret: secret
    };

    // Create ILP connector in env
    try
    {
        // Hate .then but dont want to extract to async function
        createILPConnector(uplinkName, uplinkOptions).then(() => closeAllChannels());
    }
    catch (error)
    {
        console.error(error.toString());
    }
}

// Create the server for the app
const server: Server = new Server();