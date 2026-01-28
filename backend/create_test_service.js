
const path = require('path');
// Load .env from root explicitly
const envPath = path.resolve(__dirname, '..', '.env');
console.log('Loading .env from:', envPath);
require('dotenv').config({ path: envPath });

const supabase = require('./supabaseClient');

async function createTestService() {
    console.log('--- Creating Test Service and Plan (10 PKR) ---');

    try {
        // 1. Check if service exists
        const { data: existingService, error: findError } = await supabase
            .from('services')
            .select('id')
            .eq('name', 'Test Service')
            .maybeSingle();

        if (findError) throw findError;

        let serviceId;

        if (existingService) {
            console.log('Test Service already exists with ID:', existingService.id);
            serviceId = existingService.id;
        } else {
            // 2. Create Service if not exists
            const { data: newService, error: createError } = await supabase
                .from('services')
                .insert({
                    name: 'Test Service',
                    description: 'A low-cost service for testing payments.',
                    is_active: true
                })
                .select()
                .single();

            if (createError) throw createError;
            console.log('Created Test Service with ID:', newService.id);
            serviceId = newService.id;
        }

        // 3. Check if Plan exists
        const { data: existingPlan, error: findPlanError } = await supabase
            .from('plans')
            .select('id')
            .eq('service_id', serviceId)
            .eq('price', 10.00)
            .maybeSingle();

        if (findPlanError) throw findPlanError;

        if (existingPlan) {
            console.log('Test Plan (10 PKR) already exists with ID:', existingPlan.id);
        } else {
            // 4. Create Plan if not exists
            const { data: newPlan, error: createPlanError } = await supabase
                .from('plans')
                .insert({
                    service_id: serviceId,
                    name: 'Test Plan (10 PKR)',
                    price: 10.00,
                    billing_cycle: 'one_time',
                    is_active: true
                })
                .select()
                .single();
            
            if (createPlanError) throw createPlanError;
            console.log('Created Test Plan with ID:', newPlan.id);
        }

        console.log('✅ Test Data Setup Complete!');

    } catch (err) {
        console.error('❌ Error setting up test data:', err);
    }
}

createTestService();
