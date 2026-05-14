import { z } from 'zod';

export const initiateRegistrationSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        middle_name: z.string().optional().nullable(),
        suffix: z.string().optional().nullable(),
        sex: z.enum(['Male', 'Female']).optional().nullable(),
        date_of_birth: z.string().optional().nullable(), // ISO date string
        phone: z.string().optional().nullable(),
    }),
});

export const verifyRegistrationOTPSchema = z.object({
    body: z.object({
        email: z.string().email(),
        otp_code: z.string().length(6),
    }),
});
