import { z } from 'zod';

const stringRequired = z.string().min(1);
const stringSchema = z.string().nullish();

export const adminBookAppointmentSchema = z.object({
    params: z.object({
        id: stringRequired, // The ID of the patient being booked for
    }).passthrough(),
    body: z.object({
        service_id: stringRequired,
        date: stringRequired,
        time: stringRequired,
        user_session_id: stringSchema,
        dentist_id: stringSchema,
    }).passthrough(),
    query: z.any(),
}).passthrough();
