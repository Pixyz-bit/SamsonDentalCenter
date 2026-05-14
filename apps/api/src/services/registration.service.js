import crypto from 'crypto';
import { supabaseAdmin } from '../config/supabase.js';
import { AppError } from '../utils/errors.js';
import { sendRegistrationOTPEmail } from './email-confirmation.service.js';

/**
 * Generate a 6-digit random OTP.
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Step 1 & 2: Initiate registration.
 * Saves pending data and sends OTP.
 */
export const initiateRegistration = async (data) => {
    const { email, password, first_name, last_name, middle_name, suffix, sex, date_of_birth, phone } = data;
    const normalizedEmail = email.toLowerCase().trim();
    const otpCode = generateOTP();

    // 1. Check if user already exists in auth.users
    const { data: existingAuth } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingAuth.users.some(u => u.email === normalizedEmail);
    if (userExists) {
        throw new AppError('An account with this email already exists.', 409);
    }

    // 2. Check if there's a registered profile
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, is_registered')
        .eq('email', normalizedEmail)
        .maybeSingle();

    if (profile && profile.is_registered) {
        throw new AppError('An account with this email already exists.', 409);
    }

    // 3. Upsert registration request (replace old if exists)
    const { error } = await supabaseAdmin.from('registration_requests').upsert({
        email: normalizedEmail,
        otp_code: otpCode,
        password_hash: password, // Storing temporarily until verification
        first_name,
        last_name,
        middle_name,
        suffix,
        sex,
        date_of_birth,
        phone,
        is_verified: false,
        expires_at: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes
    }, { onConflict: 'email' });

    if (error) {
        console.error('Failed to save registration request:', error.message);
        throw new AppError('Failed to initiate registration. Please try again.', 500);
    }

    // 4. Send Email
    const fullName = `${first_name} ${last_name}`.trim();
    try {
        await sendRegistrationOTPEmail(normalizedEmail, fullName, otpCode);
    } catch (err) {
        console.error('Failed to send registration OTP email:', err.message);
        throw new AppError('Failed to send verification email. Please check your email address or try again later.', 500);
    }

    return { message: 'Verification code sent to your email.' };
};

/**
 * Step 3: Verify OTP and finalize registration.
 */
export const verifyAndFinalize = async (email, code) => {
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Find the latest valid registration request
    const { data: request, error } = await supabaseAdmin
        .from('registration_requests')
        .select('*')
        .eq('email', normalizedEmail)
        .eq('otp_code', code)
        .eq('is_verified', false)
        .gt('expires_at', new Date().toISOString())
        .single();

    if (error || !request) {
        throw new AppError('Invalid or expired verification code.', 401);
    }

    // 2. Create the user in Supabase Auth
    const fullName = `${request.last_name}, ${request.first_name} ${request.middle_name || ''} ${request.suffix || ''}`.replace(/\s+/g, ' ').trim();
    
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: request.password_hash,
        email_confirm: true, // They verified via our OTP
        user_metadata: {
            first_name: request.first_name,
            last_name: request.last_name,
            middle_name: request.middle_name,
            suffix: request.suffix,
            full_name: fullName,
            role: 'patient',
            sex: request.sex,
            date_of_birth: request.date_of_birth
        }
    });

    if (authErr) {
        console.error('Failed to create auth user:', authErr.message);
        if (authErr.message.includes('already registered')) {
            throw new AppError('An account with this email already exists.', 409);
        }
        throw new AppError('Failed to finalize registration.', 500);
    }

    // 3. Update profile with additional info (phone)
    if (request.phone) {
        await supabaseAdmin.from('profiles').update({ phone: request.phone }).eq('id', authData.user.id);
    }

    // 4. Mark request as verified and clean up (optional: could just delete)
    await supabaseAdmin.from('registration_requests').delete().eq('id', request.id);

    return { 
        message: 'Registration complete! You can now log in.',
        user: {
            id: authData.user.id,
            email: normalizedEmail,
            full_name: fullName
        }
    };
};
