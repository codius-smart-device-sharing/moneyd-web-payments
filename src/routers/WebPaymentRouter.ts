// Import base route class
import { CustomRouter } from "./CustomRouter";

// Set up the ilp configs
import { ILDCP, SPSP, createPlugin } from 'ilp/src';

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
                const plugin: any = createPlugin();
                await plugin.connect();
                const { assetCode, assetScale } = await ILDCP.fetch(plugin.sendData.bind(plugin));

                console.log(assetCode + ' ' + assetScale);

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
            const { receiver, amount } = JSON.parse(ctx.request.body.body);
      
            try 
            {
                const result = await SPSP.pay(createPlugin(), {
                    receiver,
                    sourceAmount: amount
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
                return
            }
      
            ctx.body = {
                success: true
            };
        });
    }
}