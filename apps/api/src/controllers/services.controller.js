import { supabaseAdmin } from '../config/supabase.js';

/**
 * GET /api/services
 *
 * List all active dental services.
 * Public endpoint — no login required.
 * Optional query: ?tier=general or ?tier=specialized
 */
export const getAllServices = async (req, res, next) => {
    try {
        const { tier } = req.query;

        let query = supabaseAdmin
            .from('services')
            .select('id, name, description, duration_minutes, price, tier')
            .eq('is_active', true)
            .order('tier') // General first, then specialized
            .order('name');

        // Optional filter by tier
        if (tier && (tier === 'general' || tier === 'specialized')) {
            query = query.eq('tier', tier);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json({ services: data });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/services/:id
 *
 * Get a single service by ID.
 * Public endpoint.
 */
export const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from('services')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({ error: 'Service not found.' });
        }

        res.json({ service: data });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/services
 *
 * Create a new service (Admin only).
 * Body: { name, description, duration_minutes, price, tier? }
 * tier defaults to 'general' if not provided.
 */
export const createService = async (req, res, next) => {
    try {
        const { name, description, duration_minutes, price, tier } = req.body;

        if (!name || !duration_minutes) {
            return res.status(400).json({
                error: 'Name and duration_minutes are required.',
            });
        }

        const { data, error } = await supabaseAdmin
            .from('services')
            .insert({
                name,
                description,
                duration_minutes,
                price,
                tier: tier || 'general',
            })
            .select()
            .single();

        if (error) {
            return next(error);
        }

        res.status(201).json({ message: 'Service created!', service: data });
    } catch (err) {
        next(err);
    }
};

/**
 * PATCH /api/v1/services/:id
 *
 * Update an existing service (Admin only).
 * Body: { name?, description?, duration_minutes?, price?, tier?, is_active? }
 * Only provided fields are updated.
 *
 * @param {string} req.params.id - Service ID
 * @param {object} req.body - Fields to update
 * @returns {object} Updated service
 */
export const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description, duration_minutes, price, tier, is_active } = req.body;

        // Build update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (duration_minutes !== undefined) updateData.duration_minutes = duration_minutes;
        if (price !== undefined) updateData.price = price;
        if (tier !== undefined) {
            if (!['general', 'specialized'].includes(tier)) {
                return res.status(422).json({
                    success: false,
                    error: {
                        code: 'INVALID_TIER',
                        message: 'Tier must be either "general" or "specialized"',
                    },
                });
            }
            updateData.tier = tier;
        }
        if (is_active !== undefined) updateData.is_active = is_active;

        // Return error if no fields to update
        if (Object.keys(updateData).length === 0) {
            return res.status(422).json({
                success: false,
                error: {
                    code: 'NO_FIELDS_TO_UPDATE',
                    message: 'At least one field is required to update',
                },
            });
        }

        const { data, error } = await supabaseAdmin
            .from('services')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_SERVICE',
                        message: 'Service name already exists',
                    },
                });
            }
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SERVICE_UPDATE_ERROR',
                    message: 'Failed to update service',
                    details: error.message,
                },
            });
        }

        if (!data) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    message: `Service with ID ${id} not found`,
                },
            });
        }

        res.json({
            success: true,
            message: 'Service updated successfully',
            data,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * DELETE /api/v1/services/:id
 *
 * Delete a service (Admin only).
 * - Default: Soft-delete (sets is_active = false) — service hidden but data preserved
 * - Query param ?force=true: Hard-delete (permanent removal) — only if no appointments
 *
 * @param {string} req.params.id - Service ID
 * @param {boolean} req.query.force - Force hard delete (optional)
 * @returns {object} Deletion confirmation
 */
export const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { force } = req.query;

        // Verify service exists first
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('id, name, is_active')
            .eq('id', id)
            .single();

        if (!service) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SERVICE_NOT_FOUND',
                    message: `Service with ID ${id} not found`,
                },
            });
        }

        // Check if service has any appointments
        const { data: appointments, count } = await supabaseAdmin
            .from('appointments')
            .select('id', { count: 'exact', head: true })
            .eq('service_id', id)
            .not('status', 'in', '("CANCELLED","LATE_CANCEL")'); // Exclude cancelled/late cancelled

        const activeAppointmentCount = count || 0;

        // Hard delete requested
        if (force === 'true') {
            if (activeAppointmentCount > 0) {
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'CANNOT_DELETE_WITH_APPOINTMENTS',
                        message: `Cannot permanently delete service. ${activeAppointmentCount} active appointment(s) exist.`,
                        details: {
                            appointment_count: activeAppointmentCount,
                            suggestion:
                                'Use soft delete (default) or cancel/complete all appointments first',
                        },
                    },
                });
            }

            // Proceed with hard delete
            const { error } = await supabaseAdmin.from('services').delete().eq('id', id);

            if (error) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'SERVICE_DELETE_ERROR',
                        message: 'Failed to permanently delete service',
                        details: error.message,
                    },
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Service permanently deleted',
                data: {
                    id,
                    name: service.name,
                    deleted_type: 'permanent',
                },
            });
        }

        // Soft delete (default) — just mark as inactive
        const { data: updated, error } = await supabaseAdmin
            .from('services')
            .update({ is_active: false })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'SERVICE_UPDATE_ERROR',
                    message: 'Failed to deactivate service',
                    details: error.message,
                },
            });
        }

        res.status(200).json({
            success: true,
            message: 'Service deactivated (soft delete)',
            data: {
                id: updated.id,
                name: updated.name,
                is_active: updated.is_active,
                deleted_type: 'soft',
                note:
                    activeAppointmentCount > 0
                        ? `${activeAppointmentCount} active appointment(s) still using this service`
                        : null,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/v1/services/:id/specialists
 *
 * Get all dentists qualified for this service (based on tier).
 */
export const getServiceSpecialists = async (req, res, next) => {
    try {
        const { id } = req.params;

        // 1. Get service details 
        const { data: service } = await supabaseAdmin
            .from('services')
            .select('tier')
            .eq('id', id)
            .single();

        if (!service) {
            return res.status(404).json({ error: 'Service not found.' });
        }

        // 2. Get all active dentists
        const { data: allDentists, error: dError } = await supabaseAdmin
            .from('dentists')
            .select(`
                id,
                tier,
                photo_url,
                profile:profiles(id, full_name, first_name, last_name, middle_name, suffix)
            `)
            .eq('is_active', true);

        if (dError) return res.status(500).json({ error: dError.message });

        // 3. Get dentists explicitly enrolled in this service via dentist_services
        const { data: serviceSkills } = await supabaseAdmin
            .from('dentist_services')
            .select('dentist_id')
            .eq('service_id', id);
        const matchIds = (serviceSkills || []).map(ds => ds.dentist_id);

        if (matchIds.length === 0) {
            return res.json({ specialists: [] });
        }

        // 4. Fetch schedules to verify if they have ANY working days (Availability Check)
        const [{ data: allSchedules }, { data: clinicSchedules }] = await Promise.all([
            supabaseAdmin
                .from('dentist_schedule')
                .select('dentist_id, is_working, is_using_global')
                .in('dentist_id', matchIds),
            supabaseAdmin
                .from('clinic_schedule')
                .select('day_of_week, is_open')
                .eq('is_open', true)
        ]);

        const openClinicDays = new Set((clinicSchedules || []).map(c => c.day_of_week));

        // 5. Filter specialists based on skillset AND active status
        const qualifiedDentists = allDentists.filter(d => {
            // A. Strict skillset check: Must be mapped to this service
            if (!matchIds.includes(d.id)) return false;

            // B. Explicit Inactivity Check
            if (d.is_active === false) return false;

            // C. "Total Off-Duty" Check: 
            // We only hide them if they have 7 rows and ALL 7 are set to Custom + Not Working.
            const dSchedules = (allSchedules || []).filter(s => s.dentist_id === d.id);
            
            if (dSchedules.length === 7) {
                const isEntirelyOff = dSchedules.every(s => s.is_working === false && s.is_using_global === false);
                if (isEntirelyOff) return false;
            }

            // Otherwise, they are either in Global Mode or have at least one working day/slot.
            return true;
        });

        res.json({ specialists: qualifiedDentists });
    } catch (err) {
        next(err);
    }
};
