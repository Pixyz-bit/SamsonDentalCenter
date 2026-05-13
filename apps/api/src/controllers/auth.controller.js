import { supabaseAdmin, supabasePublic } from '../config/supabase.js';
import { humanizeError } from '../utils/errorMapper.js';
import * as guestAuthService from '../services/guest-auth.service.js';
import { mergePatientRecords } from '../services/admin.service.js';

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 60 * 60 * 1000 * 24 * 7, // 7 days
};

/**
 * POST /api/auth/register
 *
 * Register a new patient account.
 * Body: { email, password, full_name, phone }
 *
 * Uses supabasePublic.auth.signUp() so Supabase sends the confirmation email automatically.
 * Make sure "Confirm email" is enabled in Supabase Dashboard → Authentication → Providers → Email.
 */
export const register = async (req, res, next) => {
    try {
        const { email, password, first_name, last_name, middle_name, suffix, phone, sex, date_of_birth } = req.body;

        // ── Validate input ──
        if (!email || !password || !first_name || !last_name) {
            return res.status(400).json({
                error: 'Email, password, first name, and last name are required.',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters.',
            });
        }

        // Concat for legacy/metadata support
        const full_name = `${last_name}, ${first_name} ${middle_name || ''} ${suffix || ''}`.replace(/\s+/g, ' ').trim();

        // ── NEW: Check for Stub Profile ──
        const { data: stubProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, is_registered')
            .eq('email', email)
            .maybeSingle();

        if (stubProfile && !stubProfile.is_registered) {
            return res.status(409).json({
                code: 'STUB_PROFILE_EXISTS',
                message: 'A profile with this email already exists but is not yet registered. Please verify your identity to link your account.',
                profile_id: stubProfile.id
            });
        }

        // ── Create user via public client ──
        const { data, error } = await supabasePublic.auth.signUp({
            email,
            password,
            options: {
                data: { 
                    full_name, 
                    first_name, 
                    last_name, 
                    middle_name, 
                    suffix, 
                    role: 'patient',
                    sex,
                    date_of_birth
                },
            },
        });

        if (error) {
            return next(error);
        }

        // ── Update phone and preferred_time if provided ──
        const profileUpdates = {};
        if (phone) profileUpdates.phone = phone;
        if (req.body.preferred_time) profileUpdates.preferred_time = req.body.preferred_time;
        if (sex) profileUpdates.sex = sex;
        if (date_of_birth) profileUpdates.date_of_birth = date_of_birth;

        if (Object.keys(profileUpdates).length > 0 && data.user?.id) {
            await supabaseAdmin.from('profiles').update(profileUpdates).eq('id', data.user.id);
        }

        // ── Return success ──
        res.status(201).json({
            message: 'Registration successful! Please check your email to confirm your account.',
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name,
                first_name,
                last_name,
                middle_name,
                suffix
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // ── Validate ──
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        // ── Sign in via Supabase ──
        const { data, error } = await supabasePublic.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('SignIn error:', error);
            return next(error);
        }

        // ── Get profile ──
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) {
            console.error('Profile fetch error:', profileError);
            return next(profileError);
        }

        // ── Set httpOnly cookies ──
        res.cookie('sb-access-token', data.session.access_token, COOKIE_OPTIONS);
        res.cookie('sb-refresh-token', data.session.refresh_token, COOKIE_OPTIONS);

        // ── Return token + profile ──
        res.json({
            message: 'Login successful!',
            token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile?.full_name,
                first_name: profile?.first_name,
                last_name: profile?.last_name,
                middle_name: profile?.middle_name,
                suffix: profile?.suffix,
                role: profile?.role,
                phone: profile?.phone,
                avatar_url: profile?.avatar_url,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};

/**
 * GET /api/auth/me
 */
export const getProfile = async (req, res, next) => {
    try {
        const user = {
            id: req.user.id,
            email: req.user.email,
            full_name: req.user.full_name,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            middle_name: req.user.middle_name,
            suffix: req.user.suffix,
            phone: req.user.phone,
            role: req.user.role,
            avatar_url: req.user.avatar_url,
            date_of_birth: req.user.date_of_birth,
            sex: req.user.sex,
        };

        return res.json({ user });
    } catch (error) {
        next(error);
    }
};

/**
 * PATCH /api/auth/me
 */
export const updateProfile = async (req, res, next) => {
    try {
        const { full_name, first_name, last_name, middle_name, suffix, phone, avatar_url, date_of_birth, sex } = req.body;

        const updates = {};
        if (first_name !== undefined) updates.first_name = first_name;
        if (last_name !== undefined) updates.last_name = last_name;
        if (middle_name !== undefined) updates.middle_name = middle_name;
        if (suffix !== undefined) updates.suffix = suffix;

        // Auto-generate full_name if name parts changed
        if (updates.first_name !== undefined || updates.last_name !== undefined || updates.middle_name !== undefined || updates.suffix !== undefined) {
            const current = req.user;
            const fn = updates.first_name !== undefined ? updates.first_name : current.first_name;
            const ln = updates.last_name !== undefined ? updates.last_name : current.last_name;
            const mn = updates.middle_name !== undefined ? updates.middle_name : current.middle_name;
            const sx = updates.suffix !== undefined ? updates.suffix : current.suffix;
            updates.full_name = `${ln || ''}, ${fn || ''} ${mn || ''} ${sx || ''}`.replace(/\s+/g, ' ').trim();
        } else if (full_name !== undefined) {
            updates.full_name = full_name;
        }

        if (phone !== undefined) updates.phone = phone;
        if (avatar_url !== undefined) updates.avatar_url = avatar_url;
        if (date_of_birth !== undefined) updates.date_of_birth = date_of_birth;
        if (sex !== undefined) updates.sex = sex;
        updates.updated_at = new Date().toISOString();

        if (Object.keys(updates).length <= 1) {
            return res.status(400).json({ error: 'No fields to update.' });
        }

        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', req.user.id)
            .select()
            .single();

        if (error) {
            return next(error);
        }

        res.json({ message: 'Profile updated!', user: data });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/set-password
 * Called by the doctor portal after clicking the invitation email link.
 * Body: { access_token, refresh_token, password }
 */
export const setPassword = async (req, res, next) => {
    try {
        const { access_token, refresh_token, password } = req.body;

        if (!access_token || !refresh_token || !password) {
            return res.status(400).json({ error: 'access_token, refresh_token, and password are required.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters.' });
        }

        // 1. Set the session from the invitation tokens
        const { data: sessionData, error: sessionErr } = await supabasePublic.auth.setSession({
            access_token,
            refresh_token,
        });

        if (sessionErr || !sessionData?.user) {
            return res.status(401).json({ error: 'Invalid or expired invitation link.' });
        }

        // 2. Update the user's password via admin
        const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
            sessionData.user.id,
            { password }
        );

        if (updateErr) {
            return res.status(500).json({ error: updateErr.message });
        }

        // 3. Get the profile to return
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', sessionData.user.id)
            .single();

        // 4. Sign in with new password to get a fresh session/token
        const { data: loginData, error: loginErr } = await supabasePublic.auth.signInWithPassword({
            email: sessionData.user.email,
            password,
        });

        if (loginErr) {
            return res.status(500).json({ error: 'Password set but login failed. Please log in manually.' });
        }

        res.json({
            message: 'Password set successfully.',
            token: loginData.session.access_token,
            user: {
                id: profile.id,
                email: profile.email,
                full_name: profile.full_name,
                first_name: profile.first_name,
                last_name: profile.last_name,
                middle_name: profile.middle_name,
                suffix: profile.suffix,
                role: profile.role,
                phone: profile.phone,
                avatar_url: profile.avatar_url,
            },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('sb-access-token', COOKIE_OPTIONS);
        res.clearCookie('sb-refresh-token', COOKIE_OPTIONS);
        res.json({ message: 'Logged out successfully.' });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/guest/send-otp
 */
export const sendGuestOTP = async (req, res, next) => {
    try {
        const { email, name } = req.body;
        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required.' });
        }
        const result = await guestAuthService.sendOTP(email, name);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/guest/verify-otp
 */
export const verifyGuestOTP = async (req, res, next) => {
    try {
        const { email, otp_code } = req.body;
        if (!email || !otp_code) {
            return res.status(400).json({ error: 'Email and OTP code are required.' });
        }
        const result = await guestAuthService.verifyOTP(email, otp_code);
        res.json(result);
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/guest-to-user
 * Frictionless upgrade from guest to registered patient.
 */
export const upgradeGuestToUser = async (req, res, next) => {
    try {
        const { email, password, verification_token, first_name, last_name, phone } = req.body;

        if (!email || !password || !verification_token) {
            return res.status(400).json({ error: 'Email, password, and verification token are required.' });
        }

        // 1. Verify the token was valid for this email
        const isValid = await guestAuthService.validateGuestVerification(email, verification_token);
        if (!isValid) {
            return res.status(403).json({ error: 'Invalid or expired verification session.' });
        }

        // 2. Create the user via admin auth (bypasses email confirmation as they just verified via OTP)
        // Note: Using concatenated full_name for profile consistency
        const fullName = `${last_name}, ${first_name}`.trim();
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                first_name,
                last_name,
                role: 'patient',
                full_name: fullName,
            }
        });

        if (error) {
            if (error.message.includes('already registered')) {
                return res.status(409).json({ error: 'An account with this email already exists. Please log in to manage your appointments.' });
            }
            return res.status(400).json({ error: error.message });
        }

        // 3. Update profile with phone if provided
        if (phone && data.user?.id) {
            await supabaseAdmin.from('profiles').update({ phone }).eq('id', data.user.id);
        }

        // 4. Link existing guest appointments to this new profile
        await supabaseAdmin
            .from('appointments')
            .update({ patient_id: data.user.id })
            .eq('guest_email', email.toLowerCase());

        // 5. Log them in automatically
        const { data: loginData, error: loginErr } = await supabasePublic.auth.signInWithPassword({
            email,
            password,
        });

        if (loginErr) {
            return res.status(201).json({ 
                message: 'Account created successfully! Please log in manually.',
                user: data.user
            });
        }

        // 5. Set cookies and return
        res.cookie('sb-access-token', loginData.session.access_token, COOKIE_OPTIONS);
        res.cookie('sb-refresh-token', loginData.session.refresh_token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'Welcome to PrimeraDental! Your account is ready.',
            token: loginData.session.access_token,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: 'patient'
            }
        });

    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/verify-and-link-stub
 * Body: { email, password, date_of_birth, phone, profile_id }
 */
export const verifyAndLinkStub = async (req, res, next) => {
    try {
        const { email, password, date_of_birth, phone, profile_id } = req.body;

        if (!email || !password || !profile_id || (!date_of_birth && !phone)) {
            return res.status(400).json({ error: 'Email, password, profile_id, and verification info are required.' });
        }

        // 1. Verify identity against stub profile
        const { data: stub } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', profile_id)
            .eq('email', email)
            .eq('is_registered', false)
            .single();

        if (!stub) return res.status(404).json({ error: 'Stub profile not found or already registered.' });

        const dobMatch = date_of_birth && stub.date_of_birth === date_of_birth;
        const phoneMatch = phone && stub.phone === phone;

        if (!dobMatch && !phoneMatch) {
            return res.status(401).json({ error: 'Identity verification failed. Information does not match our records.' });
        }

        // 2. Create auth user
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'patient',
                full_name: stub.full_name,
                first_name: stub.first_name,
                last_name: stub.last_name
            }
        });

        if (authErr) {
            if (authErr.message.includes('already registered')) {
                return res.status(409).json({ error: 'An account with this email already exists.' });
            }
            return res.status(400).json({ error: authErr.message });
        }

        const newAuthId = authData.user.id;

        // 3. Merge Stub into New Profile
        await mergePatientRecords(profile_id, newAuthId);

        // 4. Ensure NEW profile is marked as registered
        await supabaseAdmin.from('profiles').update({ is_registered: true }).eq('id', newAuthId);

        // 5. Sign in
        const { data: loginData, error: loginErr } = await supabasePublic.auth.signInWithPassword({
            email,
            password,
        });

        if (loginErr) {
            return res.status(201).json({ 
                message: 'Account linked successfully! Please log in manually.',
                user: authData.user
            });
        }

        res.cookie('sb-access-token', loginData.session.access_token, COOKIE_OPTIONS);
        res.cookie('sb-refresh-token', loginData.session.refresh_token, COOKIE_OPTIONS);

        res.status(201).json({
            message: 'Account linked and logged in successfully.',
            token: loginData.session.access_token,
            user: {
                id: newAuthId,
                email: authData.user.email,
                role: 'patient'
            }
        });

    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/auth/setup/verify
 * Public endpoint to check if a setup token is valid.
 */
export const verifySetupToken = async (req, res, next) => {
    try {
        const { token } = req.query;
        if (!token) return res.status(400).json({ error: 'Token is required.' });

        const { data: tokenData, error: tokenErr } = await supabaseAdmin
            .from('account_setup_tokens')
            .select('*, profiles(id, full_name, email, phone, date_of_birth)')
            .eq('token', token)
            .single();

        if (tokenErr || !tokenData) {
            return res.status(404).json({ error: 'Invalid or expired setup link.' });
        }

        if (new Date(tokenData.expires_at) < new Date()) {
            return res.status(410).json({ error: 'Setup link has expired.' });
        }

        res.json({
            profile: {
                id: tokenData.profiles.id,
                full_name: tokenData.profiles.full_name,
                email: tokenData.profiles.email,
            }
        });
    } catch (err) {
        next(err);
    }
};

/**
 * POST /api/auth/setup/complete
 * Verify identity and set password.
 */
export const completeSetup = async (req, res, next) => {
    try {
        const { token, password, date_of_birth, phone } = req.body;

        if (!token || !password || (!date_of_birth && !phone)) {
            return res.status(400).json({ error: 'Token, password, and identity verification are required.' });
        }

        // 1. Verify token
        const { data: tokenData, error: tokenErr } = await supabaseAdmin
            .from('account_setup_tokens')
            .select('*, profiles(*)')
            .eq('token', token)
            .single();

        if (tokenErr || !tokenData || new Date(tokenData.expires_at) < new Date()) {
            return res.status(401).json({ error: 'Invalid or expired setup link.' });
        }

        const profile = tokenData.profiles;

        // 2. Identity Gate
        const dobMatch = date_of_birth && profile.date_of_birth === date_of_birth;
        const phoneMatch = phone && profile.phone === phone;

        if (!dobMatch && !phoneMatch) {
            return res.status(401).json({ error: 'Identity verification failed.' });
        }

        // 3. Create Auth User
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
            email: profile.email,
            password,
            email_confirm: true,
            user_metadata: {
                role: 'patient',
                full_name: profile.full_name,
                first_name: profile.first_name,
                last_name: profile.last_name
            }
        });

        if (authErr) throw authErr;

        // 4. Link & Merge
        await mergePatientRecords(profile.id, authData.user.id);
        await supabaseAdmin.from('profiles').update({ is_registered: true }).eq('id', authData.user.id);

        // 5. Cleanup Token
        await supabaseAdmin.from('account_setup_tokens').delete().eq('id', tokenData.id);

        res.json({ message: 'Account set up successfully!' });

    } catch (err) {
        next(err);
    }
};
