import { Router } from 'express';
import weatherRoutes from './weather';
import radarRoutes from './radar';
import geocodeRoutes from './geocode';

const router = Router();

router.use('/weather', weatherRoutes);
router.use('/radar', radarRoutes);
router.use('/geocode', geocodeRoutes);

export default router;
