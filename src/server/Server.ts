import * as Koa from "koa";
import * as combineRouters from "koa-combine-routers";
import { WebPaymentRouter } from "./routers";
import * as CORS from "@koa/cors";
import { SPSPServer } from "./SPSPServer";

let path: any = require("path");
let bodyParser: any = require('koa-bodyparser');

// Set the port to listen on -- may want to make this more customizable
const PORT: number = 8081;

export default class Server
{
    public app: Koa;
    private portConnection: any;

    public constructor()
    {
        // Create an ExpressJS application instance
        this.app = new Koa();

        // Configure the application
        this.Configure();

        // Add the routes
        this.Routes();
    }

    public async Configure(): Promise<void>
    {
        // Add static paths -- needs to be updated for the different frontend methods
        this.app.use(bodyParser());

        // Add error handling
        this.app.on("error", console.error);

        // Create the SPSP receiver -- does this need to be awaited?
        await SPSPServer.run();

        // Listen on a port
        this.Open();
    }

    public async Open(): Promise<void>
    {
        this.portConnection = this.app.listen(PORT);
        await SPSPServer.run();
    }

    public Close(): void
    {
        this.portConnection.close();
        SPSPServer.close();
    }

    private Routes(): void
    {
        // Attach all the routers
        const combinedRouter = combineRouters(
            new WebPaymentRouter("This is the router for local payments information").router
        );
        
        // Use the router middleware -- combine all the routers
        this.app.use(CORS());
        this.app.use(combinedRouter());
    }
}