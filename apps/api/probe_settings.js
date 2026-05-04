import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function probe() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'clinic_settings' });
    if (error) {
        // Fallback: Just try to select one row and see the keys
        const { data: row, error: selectError } = await supabase.from('clinic_settings').select('*').limit(1).single();
        if (selectError) {
            console.error('Probe failed:', selectError);
        } else {
            console.log('Columns found:', Object.keys(row));
        }
    } else {
        console.log('Table Info:', data);
    }
}

probe();
