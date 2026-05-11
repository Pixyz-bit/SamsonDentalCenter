import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/webApp/PrimeraDental/apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function checkConstraint() {
    const query = `
      SELECT pg_get_constraintdef(c.oid) AS constraint_def
      FROM pg_constraint c
      JOIN pg_class t ON c.conrelid = t.oid
      WHERE t.relname = 'slot_holds' AND c.conname = 'slot_holds_status_check';
    `;
    const { data, error } = await supabaseAdmin.rpc('run_sql', { sql: query });
    if (error) {
        // If run_sql RPC doesn't exist, we can't run raw SQL this easily from the client.
        console.error('RPC failed:', error.message);
    } else {
        console.log('Constraint:', data);
    }
}

checkConstraint();
