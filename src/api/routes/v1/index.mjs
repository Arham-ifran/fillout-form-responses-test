import express from 'express';
import formRoutes from './form.route.mjs';

const router = express.Router();

router.use('/forms', formRoutes);

export default router;