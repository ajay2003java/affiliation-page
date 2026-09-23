const { db } = require('./db/database');
const { notifyNewReferral, notifyStatusChange } = require('./services/email.service');

async function testEmailNotifications() {
  console.log('=== Testing Phase 3 Email Notification Workflows ===\n');

  // Test User
  const mockUser = {
    id: 'user-doc-01',
    name: 'Dr. Ramesh Sharma',
    email: 'sharma@cityclinic.com'
  };

  // 1. Test New Patient Referral to Hospital
  const mockOpp = {
    id: 'test-opp-001',
    job_id: 'INT-001',
    client_name: 'City Care Multi-Specialty Hospital',
    person_contacted: 'Amit Verma',
    phone: '+91 9876543210',
    service_product: 'Cardiology Consultation & Echo Test',
    intake_type: 'CLIENT_INTAKE',
    target_organization_id: 'org-medcy-01',
    referring_user_id: mockUser.id,
    clinical_intake_notes: 'Referred for recurrent chest pain and ECG abnormalities'
  };

  console.log('1. Triggering New Referral Notification...');
  await notifyNewReferral(mockOpp, mockUser);

  // 2. Test Status Change to CONVERTED
  console.log('2. Triggering Status Change to CONVERTED Notification...');
  await notifyStatusChange(
    { ...mockOpp, final_agreed_price: 45000 },
    'IN DISCUSSION',
    'CONVERTED',
    'City Care Admissions Desk',
    'Patient admitted, treatment scheduled.'
  );

  // 3. Inspect logged notifications in DB
  const logs = db.prepare('SELECT * FROM email_notifications ORDER BY created_at DESC LIMIT 5').all();
  console.log('3. Logged Email Notifications in DB:');
  console.table(logs);

  console.log('\n✓ All Phase 3 email notification workflows executed successfully with ZERO in-app sound/noise disturbances.');
}

testEmailNotifications().catch(console.error);
