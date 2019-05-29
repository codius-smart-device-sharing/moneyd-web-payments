// Import base route class
import { CustomRouter } from "./CustomRouter";
import { startILPConnector, stopILPConnector, closeAllChannels } from "../services";

export class ConnectorRouter extends CustomRouter
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
        this.router.post('/start', async (ctx: any, next: Function): Promise<any> =>
        {
            try
            {
                await startILPConnector();

                // What to return?
            }
            catch (error)
            {
                console.error(error.toString());

                // Close the channels on error
                await closeAllChannels();
            }
        });

        this.router.post('/stop', async (ctx: any, next: Function): Promise<any> =>
        {
            try
            {
                await stopILPConnector();

                // What to return?
            }
            catch (error)
            {
                console.error(error.toString());
            }
        });
    }
}