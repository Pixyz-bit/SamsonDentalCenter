import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('d:/webApp/PrimeraDental/apps/api/.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    const { data: users } = await supabaseAdmin.from('profiles').select('id').limit(1);
    const patientId = users[0].id;
    const firstName = 'TestFamily';
    const lastName = 'MemberTest';
    const finalBookedForBirthday = '2000-01-01';
    const finalBookedForRelationship = 'Child';
    const finalPatientSex = 'Male';
    const bookedForName = 'MemberTest, TestFamily';

    console.log('Attempting insert...');
    const { data: newProfile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .insert({
            primary_profile_id: patientId,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            middle_name: null,
            suffix: null,
            full_name: bookedForName,
            date_of_birth: finalBookedForBirthday,
            relationship_to_primary: finalBookedForRelationship,
            sex: finalPatientSex,
            role: 'patient',
            is_registered: false
        })
        .select('id')
        .single();

    if (profileErr) {
        console.error('Insert failed:', profileErr.message);
    } else {
        console.log('Insert succeeded:', newProfile.id);
    }
}

testInsert();
