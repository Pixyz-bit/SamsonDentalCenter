const url = 'https://lxxmctfjvkddedfbpzqi.supabase.co/rest/v1/slot_holds';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4eG1jdGZqdmtkZGVkZmJwenFpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTMxNDk1MCwiZXhwIjoyMDg2ODkwOTUwfQ.S8HIIscwhJrm9OYcERbTHUvChlmkNu9LS_Gm0V3O_CU';

async function clearHold() {
    console.log('Clearing active hold for May 21 at 8:00 AM...');
    const response = await fetch(`${url}?appointment_date=eq.2026-05-21&start_time=eq.08:00:00&status=eq.active`, {
        method: 'PATCH',
        headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        },
        body: JSON.stringify({
            status: 'released',
            updated_at: new Date().toISOString()
        })
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Successfully cleared holds:', data);
    } else {
        const error = await response.text();
        console.error('Error clearing hold:', error);
    }
}

clearHold();
