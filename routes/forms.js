const express = require('express');
const router = express.Router();
const formsController = require('../controllers/formsController');
const authMiddleware = require('../middlewares/authMiddleware');
const cacheMiddleware = require('../middlewares/cacheMiddleware');
const { redisClient } = require('../config/redisClient');

router.post('/', authMiddleware, formsController.createForm);

router.get('/share/:token',
  cacheMiddleware((req) => `form:share:${req.params.token}`),
  formsController.getFormByShareToken);

router.get('/:id',
  authMiddleware,
  cacheMiddleware((req) => `form:${req.params.id}`),
  formsController.getForm);

router.post('/:id/submit', formsController.submitForm);

router.get('/:id/submissions',
  authMiddleware,
  cacheMiddleware((req) => `forms:submissions:${req.params.id}`),
  formsController.listSubmissions);

module.exports = router;
