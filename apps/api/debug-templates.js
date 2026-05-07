import { supabaseAdmin } from './src/config/supabase.js';

const checkTemplates = async () => {
    const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('template_key, name');
    
    if (error) {
        console.error('Error fetching templates:', error);
        return;
    }
    
    console.log('Current templates in DB:');
    data.forEach(t => console.log(`- ${t.template_key}: ${t.name}`));
};

checkTemplates();
