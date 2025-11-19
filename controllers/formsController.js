const formService = require('../services/formService');
const { redisClient } = require('../config/redisClient');
const ws = require('../utils/ws');

async function createForm(req, res) {
  try {
    const payload = req.body;

    const form = await formService.createForm(payload, req.user?.userId);

    const shareUrl = `${req.protocol}://${req.get("host")}/views/share.html?token=${form.shareToken}`;

    await redisClient.del('forms:all');

    res.json({
      message: "Form created successfully",
      form,
      shareToken: form.shareToken,
      shareUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create form' });
  }
}


async function getForm(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const form = await formService.getFormById(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (res.locals._cacheKey) {
      await redisClient.setEx(res.locals._cacheKey, res.locals._cacheTtl, JSON.stringify(form));
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch form' });
  }
}

async function getFormByShareToken(req, res) {
  try {
    const token = req.params.token;
    const form = await formService.getFormByShareToken(token);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (res.locals._cacheKey) {
      await redisClient.setEx(res.locals._cacheKey, res.locals._cacheTtl, JSON.stringify(form));
    }

    res.json(form);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch shared form' });
  }
}

async function submitForm(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { answers } = req.body;
    const submission = await formService.submitForm(id, answers);

    await redisClient.del(`form:${id}`);
    await redisClient.del(`forms:submissions:${id}`);

    ws.broadcastToForm(id, { type: 'new_submission', payload: submission });

    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit form' });
  }
}

async function listSubmissions(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const submissions = await formService.listSubmissions(id);

    if (res.locals._cacheKey) {
      await redisClient.setEx(res.locals._cacheKey, res.locals._cacheTtl, JSON.stringify(submissions));
    }

    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list submissions' });
  }
}

module.exports = {
  createForm,
  getForm,
  getFormByShareToken,
  submitForm,
  listSubmissions
};
