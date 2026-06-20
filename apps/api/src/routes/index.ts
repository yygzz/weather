import { Router } from 'express';
import weatherRoutes from './weather';
import radarRoutes from './radar';
import geocodeRoutes from './geocode';
import lifestyleRoutes from './lifestyle';

const router = Router();

router.use('/weather', weatherRoutes);
router.use('/radar', radarRoutes);
router.use('/geocode', geocodeRoutes);
router.use('/weather/lifestyle', lifestyleRoutes);

export default router;
