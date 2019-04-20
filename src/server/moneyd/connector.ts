import { createHmac, randomBytes } from 'crypto';

// This moneyd instance has a connection to the src/index.js in the moneyd package -- allows buildConfig and startConnector
const Moneyd = require('moneyd');
const fetch = require('node-fetch');
const { deriveKeypair, deriveAddress } = require('ripple-keypairs')

const connectorList = require('../config/connector_list.json');
const rippledList = require('../config/rippled_list.json');

const base64url = (buf: any) => buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export const startMoneydConnector = async (uplinkName: string, uplinkOptions: any) =>
{
    try
    {
        // Create an instance of Moneyd
        const moneyd: any = new Moneyd({ testnet: true });
        console.log(moneyd.environment);

        // Create an instance of moneyd connector -- pass in the data for this uplink -- shouldn't need .moneyd.json this way
        const connector = await moneyd.startConnector(await createUplinkData(uplinkName, uplinkOptions));
        console.log(connector);
        return connector;
    }
    catch (error)
    {
        console.error(error);

        // Restart the connector?
    }
}

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

        if (uplinkOptions.testnet)
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
            xrpAddress = deriveAddress(deriveKeypair(uplinkOptions.secret).publicKey);
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