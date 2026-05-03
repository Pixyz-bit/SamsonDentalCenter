import * as settingsService from '../services/settings.service.js';

export const getClinicSettings = async (req, res, next) => {
    try {
        const settings = await settingsService.getSettings();
        res.json(settings);
    } catch (err) {
        next(err);
    }
};

export const updateClinicSettings = async (req, res, next) => {
    try {
        const settings = await settingsService.updateSettings(
            req.body,
            req.user.id,
            req.user.role
        );
        res.json({ message: 'Clinic settings updated successfully.', settings });
    } catch (err) {
        next(err);
    }
};

export const getClinicSchedule = async (req, res, next) => {
    try {
        const schedule = await settingsService.getSchedule();
        res.json(schedule);
    } catch (err) {
        next(err);
    }
};

export const updateClinicSchedule = async (req, res, next) => {
    try {
        const schedule = await settingsService.updateSchedule(
            req.body,
            req.query.force,
            req.user.id,
            req.user.role
        );
        res.json({ message: 'Clinic schedule updated successfully.', schedule });
    } catch (err) {
        next(err);
    }
};

export const listHolidays = async (req, res, next) => {
    try {
        const holidays = await settingsService.getHolidays();
        res.json(holidays);
    } catch (err) {
        next(err);
    }
};

export const createHoliday = async (req, res, next) => {
    try {
        const holiday = await settingsService.addHoliday(
            req.body,
            req.user.id,
            req.user.role,
            req.query.force
        );
        res.status(201).json({ message: 'Holiday added successfully.', holiday });
    } catch (err) {
        next(err);
    }
};

export const removeHoliday = async (req, res, next) => {
    try {
        await settingsService.deleteHoliday(
            req.params.id,
            req.user.id,
            req.user.role
        );
        res.json({ message: 'Holiday removed successfully.' });
    } catch (err) {
        next(err);
    }
};
