import * as Koa from "koa";
import * as combineRouters from "koa-combine-routers";
import { WebPaymentRouter } from "./routers";
import * as CORS from "@koa/cors";

let path: any = require("path");
let bodyParser: any = require('koa-bodyparser');

// Set the port to listen on -- may want to make this more customizable
const PORT: number = 8081;

export default class Server
{
    public app : Koa

    public constructor()
    {
        // Create an ExpressJS application instance
        this.app = new Koa();

        // Configure the application
        this.Configure();

        // Add the routes
        this.Routes();
    }

    public Configure()
    {
        // Add static paths -- needs to be updated for the different frontend methods
        this.app.use(bodyParser());

        // Add error handling
        this.app.on("error", console.error);

        // Listen on a port
        this.app.listen(PORT);
    }

    private Routes()
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