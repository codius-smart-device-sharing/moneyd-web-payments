import { createHmac, randomBytes } from 'crypto';

// This moneyd instance has a connection to the src/index.js in the moneyd package -- allows buildConfig and startConnector
const Connector = require('ilp-connector');
const fetch = require('node-fetch');
const { deriveKeypair, deriveAddress } = require('ripple-keypairs')

const connectorList = require('../config/connector_list.json');
const rippledList = require('../config/rippled_list.json');

const base64url = (buf: any) => buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

// Export the connector -- make this a type later -- there can only be one connector
let connector: any;

export const createILPConnector = async (uplinkName: string, uplinkOptions: any) =>
{
    try
    {
        if (!connector)
        {
            await createConnector(uplinkName, uplinkOptions);
        }
        else
        {
            console.log('Shutting down existing connector');

            await stopILPConnector();

            await createConnector(uplinkName, uplinkOptions);
        }
    }
    catch (error)
    {
        console.error('Error creating the connector.');
        console.error(error);
    }
}

const createConnector = async (uplinkName: string, uplinkOptions: any) =>
{
    console.log('Creating ILP connector...');

    // Create the uplink data -- this will change depending on the uplinkName (XRP, ETH, etc) -- currently only supports XRP
    const uplinkData: any = await createUplinkData(uplinkName, uplinkOptions);

    // Create an ilp-connector -- moneyd just wraps this call, and this allows more flexibility
    connector = Connector.createApp({
        spread: 0,
        backend: 'one-to-one',
        store: 'ilp-store-memory',
        initialConnectTimeout: 60000,
        env: uplinkOptions.testnet ? 'test' : 'production',
        adminApi: !!uplinkOptions.adminApiPort,
        adminApiPort: uplinkOptions.adminApiPort,
        accounts: {
            parent: uplinkData,
            local: {
                relation: 'child',
                plugin: 'ilp-plugin-mini-accounts',
                assetCode: uplinkData.assetCode,
                assetScale: uplinkData.assetScale,
                balance: {
                    minimum: '-Infinity',
                    maximum: 'Infinity',
                    settleThreshold: '-Infinity'
                },
                options: {
                    wsOpts: { 
                        host: 'localhost',
                        port: uplinkOptions.connectorPort
                    },
                    allowedOrigins: uplinkOptions.allowedOrigins
                }
            }
        }
    });

    console.log('Created the connector');
}

export const startILPConnector = async () =>
{
    try
    {
        if (connector)
        {
            console.log('Starting the connector...');

            // Listen with the connector -- this essentially starts the service
            await connector.listen();

            console.log('Connector started...');
        }
        else
        {
            console.error('Connector does not exist');

            // What to do when connector doesnt exist??
        }
    }
    catch (error)
    {
        console.error('Error starting the connector. Is it already running?');
        console.error(error);

        // Restart the connector? -- what to do when a start fails?
    }
}

// Might be better to just have stop connector remove channels (if necessary) and then create a new connector from this image?
export const stopILPConnector = async () =>
{
    try
    {
        console.log('Stopping the ILP connector...');

        await connector.shutdown();

        console.log('Connector stopped...');
    }
    catch (error)
    {
        console.error('Error stopping the connector');
        console.error(error);
    }
}

// Add support for other uplink types (ETH, LND, COIL, etc)
const createUplinkData = async (uplinkName: string, uplinkOptions: any) =>
{
    // Only support XRP for now -- other uplinks later
    if (uplinkName === 'XRP')
    {
        // Configure the necessary options for the uplink data -- can even configure testnet with this
        const servers = connectorList[uplinkOptions.testnet ? 'test' : 'live']
        const defaultParent = servers[Math.floor(Math.random() * servers.length)]
        const rippledServers = rippledList[uplinkOptions.testnet ? 'test' : 'live']
        const defaultRippled = rippledServers[Math.floor(Math.random() * rippledServers.length)]
        const parentBtpHmacKey = 'parent_btp_uri';
        const btpName = base64url(randomBytes(32)) || '';
        const btpSecret = hmac(hmac(parentBtpHmacKey, defaultParent + btpName), uplinkOptions.secret).toString('hex');
        const btpServer = 'btp+wss://' + btpName + ':' + btpSecret + '@' + defaultParent;

        let xrpAddress: string;
        let xrpSecret: string;

        if (uplinkOptions.testnet && !uplinkOptions.secret)
        {
            console.log('acquiring testnet account...');
            const resp = await fetch('https://faucet.altnet.rippletest.net/accounts', { method: 'POST' });
            const json = await resp.json();

            xrpAddress = json.account.address;
            xrpSecret = json.account.secret;
            console.log('got testnet address "' + xrpAddress + '"');
            console.log('waiting for testnet API to fund address...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
        else 
        {
            // This information should probably have validation
            xrpAddress = deriveAddress(deriveKeypair(uplinkOptions.secret).publicKey).address;
            xrpSecret = uplinkOptions.secret;
        }

        return {
            relation: 'parent',
            plugin: require.resolve('ilp-plugin-xrp-asym-client'),
            assetCode: 'XRP',
            assetScale: 9,
            balance: {
              minimum: '-Infinity',
              maximum: '20000000',
              settleThreshold: '5000000',
              settleTo: '10000000'
            },
            sendRoutes: false,
            receiveRoutes: false,
            options: {
              currencyScale: 9,
              server: btpServer,
              secret: xrpSecret,
              address: xrpAddress,
              xrpServer: defaultRippled
            }
        };
    }
}

const hmac = (key: any, message: any) =>
{
    const h = createHmac('sha256', key);
    h.update(message);
    return h.digest();
}