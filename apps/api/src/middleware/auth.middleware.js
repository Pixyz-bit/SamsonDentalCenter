import { supabaseAdmin } from '../config/supabase.js';

export const requireAuth = async (req, res, next) => {
    try {
        // 1. Get the token from cookie or Authorization header
        let token = req.cookies?.['sb-access-token'];

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ error: 'No token provided. Please log in.' });
        }

        // 3. Ask Supabase to verify the token
        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res
                .status(401)
                .json({ error: 'Invalid or expired token. Please log in again.' });
        }

        // 4. Get the user's profile from our profiles table
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, first_name, last_name, middle_name, suffix, phone, role, avatar_url, date_of_birth, sex')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return res.status(401).json({ error: 'User profile not found.' });
        }

        // 5. Attach user info to the request (available in controllers)
        req.user = {
            id: user.id,
            email: user.email,
            full_name: profile.full_name,
            first_name: profile.first_name,
            last_name: profile.last_name,
            middle_name: profile.middle_name,
            suffix: profile.suffix,
            phone: profile.phone,
            role: profile.role,
            avatar_url: profile.avatar_url,
            date_of_birth: profile.date_of_birth,
            sex: profile.sex,
        };

        // 6. Continue to the next middleware/controller
        next();
    } catch (err) {
        return res.status(500).json({ error: 'Authentication error.' });
    }
};

/**
 * OPTIONAL: Tries to identify the user, but lets guests through.
 * req.user will be null if not logged in.
 * Use this for the /book-guest route.
 */
export const optionalAuth = async (req, res, next) => {
    try {
        // 1. Get the token from cookie or Authorization header
        let token = req.cookies?.['sb-access-token'];

        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // If no token, they are a guest. Move to controller.
        if (!token) {
            req.user = null;
            return next();
        }
        const {
            data: { user },
            error,
        } = await supabaseAdmin.auth.getUser(token);

        // If token is bad, we still treat them as a guest rather than blocking them
        if (error || !user) {
            req.user = null;
            return next();
        }

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, first_name, last_name, middle_name, suffix, phone, role, avatar_url, date_of_birth, sex')
            .eq('id', user.id)
            .single();

        // Attach profile if found, otherwise stay as guest
        req.user = profile
            ? {
                  id: user.id,
                  email: user.email,
                  full_name: profile.full_name,
                  first_name: profile.first_name,
                  last_name: profile.last_name,
                  middle_name: profile.middle_name,
                  suffix: profile.suffix,
                  phone: profile.phone,
                  role: profile.role,
                  avatar_url: profile.avatar_url,
                  date_of_birth: profile.date_of_birth,
                  sex: profile.sex,
              }
            : null;

        next();
    } catch (err) {
        // Errors in optional auth shouldn't crash the request for a guest
        req.user = null;
        next();
    }
};
