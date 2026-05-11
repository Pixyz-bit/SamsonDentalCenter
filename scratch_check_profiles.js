import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/webApp/PrimeraDental/apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('is_registered', false);
    
    if (error) {
        console.error('Error fetching profiles:', error);
    } else {
        console.log('Stub Profiles found:', data.length);
        console.log(data);
    }
}

checkProfiles();
