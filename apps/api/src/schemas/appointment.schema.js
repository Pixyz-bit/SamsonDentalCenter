import { z } from 'zod';

// Maximum flexibility: just check it's a string or nullish
const stringSchema = z.string().nullish();
const stringRequired = z.string().min(1);

export const bookGuestSchema = z.object({
    body: z.object({
        service_id: stringRequired,
        date: stringRequired,
        time: stringRequired,
        email: z.string().email(),
        phone: stringRequired,
        guestNameParts: z.object({
            first: stringRequired,
            last: stringRequired,
            middle: stringSchema,
            suffix: stringSchema,
            birthday: stringSchema, // ✅ Added
            relationship: stringSchema, // ✅ Added
            sex: stringSchema, // ✅ Added
        }).nullish(),
        user_session_id: stringSchema,
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();


export const bookUserSchema = z.object({
    body: z.object({
        service_id: stringRequired,
        date: stringRequired,
        time: stringRequired,
        booked_for_name_parts: z.object({
            first: stringRequired,
            last: stringRequired,
            middle: stringSchema,
            suffix: stringSchema,
            birthday: stringSchema, // ✅ Added
            relationship: stringSchema, // ✅ Added
            sex: stringSchema, // ✅ Added
        }).nullish(),
        user_session_id: stringSchema,
        dentist_id: stringSchema,
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();

export const submitWizardSchema = z.object({
    body: z.object({
        service_id: stringRequired,
        booking: z.object({
            date: stringRequired,
            time: stringRequired,
            booked_for_name_parts: z.object({
                first: stringRequired,
                last: stringRequired,
                middle: stringSchema,
                suffix: stringSchema,
                birthday: stringSchema, // ✅ Added
                relationship: stringSchema, // ✅ Added
                sex: stringSchema, // ✅ Added
            }).nullish(),
            user_session_id: stringSchema,
            dentist_id: stringSchema,
        }).passthrough().nullish(),
        waitlist: z.object({
            date: stringSchema,
            preferred_date: stringSchema,
            time: stringSchema,
            preferred_time: stringSchema,
            priority: z.number().nullish(),
            dentist_id: stringSchema,
            booked_for_name_parts: z.object({
                first: stringRequired,
                last: stringRequired,
                middle: stringSchema,
                suffix: stringSchema,
                birthday: stringSchema, // ✅ Added
                relationship: stringSchema, // ✅ Added
                sex: stringSchema, // ✅ Added
            }).nullish(),
        }).passthrough().nullish(),
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();

export const getMyAppointmentsSchema = z.object({
    query: z.object({
        status: stringSchema,
        sort: stringSchema,
        page: z.coerce.number().int().positive().nullish(),
        limit: z.coerce.number().int().positive().nullish(),
    }).passthrough(),
    body: z.any(),
    params: z.any(),
}).passthrough();

export const getOneSchema = z.object({
    params: z.object({
        id: stringRequired,
    }).passthrough(),
    query: z.any(),
    body: z.any(),
}).passthrough();

export const cancelSchema = z.object({
    params: z.object({
        id: stringRequired,
    }).passthrough(),
    body: z.object({
        reason: stringSchema,
    }).passthrough(),
    query: z.any(),
}).passthrough();

export const rescheduleSchema = z.object({
    params: z.object({
        id: stringRequired,
    }).passthrough(),
    body: z.object({
        date: stringRequired,
        time: stringRequired,
        user_session_id: stringSchema,
        dentist_id: stringSchema,
    }).passthrough(),
    query: z.any(),
}).passthrough();


export const holdSlotSchema = z.object({
    body: z.object({
        service_id: stringRequired,
        date: stringRequired,
        time: stringRequired,
        user_session_id: stringRequired,
        dentist_id: stringSchema,
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();

export const releaseHoldSchema = z.object({
    body: z.object({
        hold_id: stringRequired,
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();

export const releaseHoldBySessionSchema = z.object({
    body: z.object({
        user_session_id: stringRequired,
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();

export const guestValidateSchema = z.object({
    body: z.object({
        email: z.string().email(),
        date: stringRequired,
        time: stringRequired,
        service_id: stringRequired,
        duration: z.number().int().positive(),
    }).passthrough(),
    query: z.any(),
    params: z.any(),
}).passthrough();
