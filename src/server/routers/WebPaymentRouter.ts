// Import base route class
import { CustomRouter } from "./CustomRouter";

// Set up the ilp configs
import { ILDCP, SPSP, createPlugin, Receipt } from 'ilp/src';
import { PluginV2 } from "ilp/src/lib/plugin";
import { SPSPServer } from "../servers/SPSPServer";

export class WebPaymentRouter extends CustomRouter
{
    public constructor(title: string, prefix?: string)
    {
        super(title, prefix);
        // Create the routes -- will call the implemented method
        this.CreateRoutes();
    }
    // Implement the route creating method
    protected CreateRoutes(): void
    {
        this.router.get('/asset', async (ctx: any, next: Function): Promise<any> =>
        {
            try
            {
                const plugin: PluginV2 = createPlugin();
                await plugin.connect();
                const { assetCode, assetScale } = await ILDCP.fetch(plugin.sendData.bind(plugin));

                console.log('Code: ' + assetCode + ', Scale: ' + assetScale);

                ctx.body = {
                    asset: assetCode,
                    assetScale: assetScale
                };
                ctx.status = 200;
            }
            catch (error)
            {
                console.error(error);
                ctx.status = 500;
            }
        });

        this.router.post('/actions/send', async (ctx: any, next: Function): Promise<any> =>
        {
            const { receiver, amount, orderHash } = JSON.parse(ctx.request.body.body);
      
            try 
            {
                const result: Receipt = await SPSP.pay(createPlugin(), {
                    receiver,
                    sourceAmount: amount,
                    data: orderHash
                });
      
                console.log(result);
            }
            catch (error)
            {
                ctx.status = 400;
                ctx.body = {
                    success: false,
                    message: error.message,
                    stack: error.stack
                };
                return;
            }
      
            ctx.body = {
                success: true
            };
        });

        this.router.get('/actions/connect', async (ctx: any, next: Function): Promise<any> =>
        {
            // This is the route to try and create a connection to the ilp service worker -- this will try to connect the plugin
            // and if it succeeds in establishing a connection to the local moneyd instance, then the ILP service worker should be
            // retrieved from the distlib on this local port -- dont store in s3 (full app doesnt need to know about your Payment method)
            try
            {
                const plugin: PluginV2 = createPlugin();
                await plugin.connect();

                // This worked -- return success
                ctx.body = {
                    success: true
                };
                ctx.status = 200;
            }
            catch (error)
            {
                console.error(error);

                ctx.body = {
                    success: false
                };

                // label this as client error -- they should have moneyd running!
                ctx.status = 400;
            }
        });

        this.router.get('/receiver', async (ctx: any, next: Function): Promise<any> =>
        {
            try
            {
                const paymentPointer: string = SPSPServer.paymentPointer;
                await SPSP.query(paymentPointer);

                ctx.body = {
                    paymentPointer: paymentPointer
                };
                ctx.status = 200;
            }
            catch (error)
            {
                console.error(error);
                ctx.body = {
                    error: error.toString()
                };
                ctx.status = 500;
            }
        });
    }
}