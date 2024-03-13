import express from 'express';
import { validate } from '../../validators/form.validator.mjs';
import { getResponses } from '../..//controllers/form.controller.mjs';

const router = express.Router();

router.route('/:formId/filteredResponses').get(validate, getResponses);

export default router;