import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';

/**
 * Get all clinic settings.
 */
export const getSettings = async () => {
    const { data, error } = await supabaseAdmin
        .from('clinic_settings')
        .select('*')
        .single();

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update clinic settings and log the change.
 */
export const updateSettings = async (updates, actorId, actorRole) => {
    // 1. Fetch old values for audit log
    const { data: oldValues } = await supabaseAdmin
        .from('clinic_settings')
        .select('*')
        .single();

    // 2. Perform update
    const { data: newValues, error } = await supabaseAdmin
        .from('clinic_settings')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', 1)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);

    // 3. Log to audit_log (Fire and forget)
    supabaseAdmin.from('audit_log').insert({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'UPDATE_CLINIC_SETTINGS',
        target_type: 'clinic_settings',
        target_id: null,
        resource_type: 'settings',
        resource_id: '1',
        old_values: oldValues,
        new_values: newValues,
        details: { source: 'ADMIN_SETTINGS_PORTAL' }
    }).then(({ error: auditErr }) => {
        if (auditErr) console.error('Audit log failed:', auditErr.message);
    });

    return newValues;
};

/**
 * Get clinic schedule.
 */
export const getSchedule = async () => {
    const { data, error } = await supabaseAdmin
        .from('clinic_schedule')
        .select('*')
        .order('day_of_week', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Update clinic schedule.
 */
export const updateSchedule = async (schedules, actorId, actorRole) => {
    // 1. Fetch old schedule for audit
    const { data: oldSchedule } = await supabaseAdmin
        .from('clinic_schedule')
        .select('*');

    // 2. Bulk upsert schedule
    const { data: newSchedule, error } = await supabaseAdmin
        .from('clinic_schedule')
        .upsert(schedules, { onConflict: 'day_of_week' })
        .select();

    if (error) throw new AppError(error.message, 500);

    // 3. Log to audit_log
    supabaseAdmin.from('audit_log').insert({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'UPDATE_CLINIC_SCHEDULE',
        target_type: 'clinic_schedule',
        target_id: null,
        resource_type: 'schedule',
        old_values: oldSchedule,
        new_values: newSchedule,
        details: { source: 'ADMIN_SETTINGS_PORTAL' }
    }).then(({ error: auditErr }) => {
        if (auditErr) console.error('Audit log failed:', auditErr.message);
    });

    return newSchedule;
};

/**
 * Get active holidays.
 */
export const getHolidays = async () => {
    const { data, error } = await supabaseAdmin
        .from('clinic_holidays')
        .select('*')
        .order('date', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    return data;
};

/**
 * Add a holiday.
 */
export const addHoliday = async (holidayData, actorId, actorRole) => {
    const { data, error } = await supabaseAdmin
        .from('clinic_holidays')
        .insert(holidayData)
        .select()
        .single();

    if (error) {
        if (error.code === '23505') throw new AppError('A holiday on this date already exists.', 409);
        throw new AppError(error.message, 500);
    }

    // Audit log
    supabaseAdmin.from('audit_log').insert({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'ADD_CLINIC_HOLIDAY',
        target_type: 'clinic_holidays',
        target_id: data.id,
        resource_type: 'holidays',
        resource_id: data.id,
        new_values: data
    }).then(({ error: auditErr }) => {
        if (auditErr) console.error('Audit log failed:', auditErr.message);
    });

    return data;
};

/**
 * Delete a holiday.
 */
export const deleteHoliday = async (id, actorId, actorRole) => {
    const { data: oldData } = await supabaseAdmin
        .from('clinic_holidays')
        .select('*')
        .eq('id', id)
        .single();

    const { error } = await supabaseAdmin
        .from('clinic_holidays')
        .delete()
        .eq('id', id);

    if (error) throw new AppError(error.message, 500);

    // Audit log
    supabaseAdmin.from('audit_log').insert({
        actor_id: actorId,
        actor_role: actorRole,
        action: 'DELETE_CLINIC_HOLIDAY',
        target_type: 'clinic_holidays',
        target_id: id,
        resource_type: 'holidays',
        resource_id: id,
        old_values: oldData
    }).then(({ error: auditErr }) => {
        if (auditErr) console.error('Audit log failed:', auditErr.message);
    });

    return { success: true };
};
