import * as emailTemplateService from '../services/email-template.service.js';

/**
 * Get all templates.
 */
export const getAllTemplates = async (req, res, next) => {
    try {
        const templates = await emailTemplateService.getAllTemplates();
        res.json(templates);
    } catch (err) {
        next(err);
    }
};

/**
 * Get template by key.
 */
export const getTemplateByKey = async (req, res, next) => {
    try {
        const { key } = req.params;
        const template = await emailTemplateService.getTemplateByKey(key);
        res.json(template);
    } catch (err) {
        next(err);
    }
};

/**
 * Update template.
 */
export const updateTemplate = async (req, res, next) => {
    try {
        const { key } = req.params;
        const { html_content, subject_line } = req.body;
        
        const updated = await emailTemplateService.updateTemplate(
            key, 
            { html_content, subject_line }, 
            req.user.id
        );
        
        res.json(updated);
    } catch (err) {
        next(err);
    }
};

/**
 * Restore template to default.
 */
export const restoreDefault = async (req, res, next) => {
    try {
        const { key } = req.params;
        const restored = await emailTemplateService.restoreDefault(key, req.user.id);
        res.json(restored);
    } catch (err) {
        next(err);
    }
};
