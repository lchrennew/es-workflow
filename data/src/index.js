import { startServer } from "koa-es-template";
import IndexController from "./routes/index.js";

await startServer({ index: IndexController })