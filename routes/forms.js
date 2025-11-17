const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const express = require('express');
const router = express.Router();

// End Point for Form Creation 
router.post('/', async (req, res) => {
    try {
        const { title, description, fields } = req.body;

        const createFields = fields.map((f, idx) => {
            const base = {
                label: f.label,
                type: f.type,
                required: !!f.required,
                order: typeof f.order === 'number' ? f.order : idx
            };
            if (f.options && Array.isArray(f.options)) {
                return {
                    ...base,
                    options: {
                        create: f.options.map((opt) => ({ value: opt }))
                    }
                };
            }
            return base;
        });

        const form = await prisma.form.create({
            data: {
                title,
                description,
                fields: {
                    create: createFields
                }
            },
            include: { fields: { include: { options: true } } }
        });

        res.json(form);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create form' });
    }
});

// Get Form By Id
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const form = await prisma.form.findUnique({
            where: { id },
            include: { fields: { include: { options: true } } }
        });
        if (!form) return res.status(404).json({ error: 'Form not found' });
        res.json(form);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch form' });
    }
});

// End Point for Form Submission
router.post('/:id/submit', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const { answers } = req.body; 

        const submission = await prisma.submission.create({
            data: {
                formId: id,
                answers: {
                    create: answers.map(a => ({ fieldId: a.fieldId, value: String(a.value || '') }))
                }
            },
            include: { answers: true }
        });

        res.json(submission);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to submit form' });
    }
});

module.exports = router;