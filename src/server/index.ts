import Server from "./Server";
import { startMoneydConnector } from './moneyd';

const m = startMoneydConnector('XRP', {
    testnet: true,
    // secret: 'sEd7ZiAH3iLqbKwc1SJereMP49k8aCA'
    secret: 'rN7mhccU7MxoBoPzUZeoftcrMe44Pu25XX'
});

// Create the app
const server: Server = new Server();