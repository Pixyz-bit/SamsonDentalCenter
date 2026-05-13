import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';

/**
 * Get all patient profiles (dependents) for a specific account holder.
 */
export const getPatientProfiles = async (profileId) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, middle_name, suffix, date_of_birth, relationship_to_primary, full_name, sex')
        .eq('primary_profile_id', profileId)
        .order('first_name', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    
    // Map relationship_to_primary back to relationship for frontend compatibility
    return (data || []).map(p => ({
        ...p,
        relationship: p.relationship_to_primary
    }));
};

/**
 * Get a single patient profile by ID with ownership check.
 */
export const getPatientProfileById = async (id, profileId) => {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, first_name, last_name, middle_name, suffix, date_of_birth, relationship_to_primary, full_name, sex')
        .eq('id', id)
        .eq('primary_profile_id', profileId)
        .single();

    if (error || !data) throw new AppError('Patient profile not found.', 404);
    
    return {
        ...data,
        relationship: data.relationship_to_primary
    };
};

/**
 * Create a new patient profile (Stub profile linked to primary).
 */
export const createPatientProfile = async (profileId, profileData) => {
    const { first_name, last_name, middle_name, suffix, date_of_birth, relationship, sex } = profileData;

    if (!first_name || !last_name || !date_of_birth || !relationship) {
        throw new AppError('First name, last name, DOB, and relationship are required.', 400);
    }

    const full_name = `${first_name} ${last_name}`.trim();

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert({
            primary_profile_id: profileId,
            first_name,
            last_name,
            middle_name,
            suffix,
            full_name,
            date_of_birth,
            sex,
            relationship_to_primary: relationship,
            role: 'patient',
            is_registered: false // It's a stub profile
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            throw new AppError('A profile with this name and DOB already exists.', 409);
        }
        throw new AppError(error.message, 500);
    }

    return {
        ...data,
        relationship: data.relationship_to_primary
    };
};

/**
 * Update an existing patient profile.
 */
export const updatePatientProfile = async (id, profileId, profileData) => {
    const { relationship, ...otherData } = profileData;
    
    const updates = {
        ...otherData,
        updated_at: new Date().toISOString()
    };
    
    if (relationship) {
        updates.relationship_to_primary = relationship;
    }

    const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .eq('primary_profile_id', profileId)
        .select()
        .single();

    if (error) throw new AppError(error.message, 500);
    
    return {
        ...data,
        relationship: data.relationship_to_primary
    };
};

/**
 * Delete a patient profile.
 */
export const deletePatientProfile = async (id, profileId) => {
    const { error } = await supabaseAdmin
        .from('profiles')
        .delete()
        .eq('id', id)
        .eq('primary_profile_id', profileId);

    if (error) throw new AppError(error.message, 500);
    return { success: true };
};
