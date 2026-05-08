import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artistRouter from "./artist";
import songsRouter from "./songs";
import royaltiesRouter from "./royalties";
import contractsRouter from "./contracts";
import eventsRouter from "./events";
import airplayRouter from "./airplay";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artistRouter);
router.use(songsRouter);
router.use(royaltiesRouter);
router.use(contractsRouter);
router.use(eventsRouter);
router.use(airplayRouter);
router.use(dashboardRouter);

export default router;
