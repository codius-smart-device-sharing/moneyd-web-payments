import Server from "./Server";
import { createILPConnector, startILPConnector, stopILPConnector } from './services';

const f = async () =>
{
    await createILPConnector('XRP', {
        testnet: true,
        // secret: 'sEd7ZiAH3iLqbKwc1SJereMP49k8aCA'
        secret: 'sn1kBR78sFM8EvRm1H5g7mNS9JtWj',
        connectorPort: 7768,
        adminApiPort: 7769
    });
    
    // Start the ILP connector
    await startILPConnector();

    // Stop the connector as a test
    await stopILPConnector();

    // Restart the connector -- also a test -- this fails due to the connector still thinking that the addresses are in use
    await startILPConnector();
}

f();

// Create the app
const server: Server = new Server();