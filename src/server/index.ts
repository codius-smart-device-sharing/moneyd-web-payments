import Server from "./Server";
import { createILPConnector, startILPConnector, stopILPConnector, closeAllChannels, getChannels } from './services';

const f = async () =>
{
    // Create the connector service
    await createILPConnector('XRP', {
        testnet: false,
        secret: 'sEd7ZiAH3iLqbKwc1SJereMP49k8aCA'
    });

    // Start the connector
    await startILPConnector();

    // Get the channels
    console.log(await getChannels());

    setTimeout(async () =>
    {
        // Close all the channels
        await closeAllChannels();
    }, 5000);
}

// Call the async code
f();

// Create the app
const server: Server = new Server();