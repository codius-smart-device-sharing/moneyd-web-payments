export interface UplinkOptions
{
    testnet: boolean;
    secret: string;
    connectorPort: number;
    adminApiPort: number;
    allowedOrigins: Array<string>;
}