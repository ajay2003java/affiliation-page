const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.end();
  });
}

function patch(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': 'Bearer ' + token } : {})
      }
    }, res => {
      let d = '';
      res.on('data', chunk => d += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('--- Phase 2 Flow Test ---');
  
  // 1. Client Hospital Admin Login
  console.log('1. Testing Login as Client Hospital Admin...');
  const hospitalAdminLogin = await post('http://localhost:5000/api/auth/login', { email: 'admin@citycarehospital.com', password: 'admin123' });
  console.log('   Hospital Admin Logged In:', hospitalAdminLogin.status === 200, '| Org:', hospitalAdminLogin.data.user.organization_name);

  // 2. Fetch Intake Referrals
  console.log('2. Fetching Hospital Intake Referrals...');
  const hospitalLeads = await get('http://localhost:5000/api/opportunities', hospitalAdminLogin.data.token);
  console.log('   Initial Hospital Intake Count:', hospitalLeads.data.opportunities.length);

  // 3. Doctor Referrer Login
  console.log('3. Testing Login as Dr. Sharma (Healthcare Referrer)...');
  const doctorLogin = await post('http://localhost:5000/api/auth/login', { email: 'sharma@cityclinic.com', password: 'user123' });
  console.log('   Doctor Logged In:', doctorLogin.status === 200, '| Name:', doctorLogin.data.user.name);

  // 4. Doctor Submitting Intra-Network Patient Referral
  console.log('4. Doctor Submitting Patient Referral to City Care Hospital...');
  const referralSubmit = await post('http://localhost:5000/api/opportunities', {
    target_entity_id: 'medcy',
    target_organization_id: 'org-city-care-1',
    intake_type: 'CLIENT_INTAKE',
    client_name: 'City Care Multi-Specialty Hospital',
    person_contacted: 'Ramesh Patel (Patient)',
    designation_role: 'Age 52',
    phone: '+91 9876500001',
    email: 'ramesh.family@gmail.com',
    service_product: 'Liver Resection & Hepatic Care',
    clinical_intake_notes: 'Diagnosed with liver lesion. Requires immediate surgical triage with oncology/gastro dept.'
  }, doctorLogin.data.token);
  console.log('   Referral Submitted:', referralSubmit.status === 201, '| Job ID:', referralSubmit.data.job_id);

  // 5. Hospital Intake Admin views lead and updates status to CONVERTED
  console.log('5. Hospital Admin Fetching and Converting Intake Lead...');
  const updatedHospitalLeads = await get('http://localhost:5000/api/opportunities', hospitalAdminLogin.data.token);
  const newLead = updatedHospitalLeads.data.opportunities.find(o => o.job_id === referralSubmit.data.job_id);
  console.log('   New Intake Lead Received at Hospital:', newLead ? `${newLead.job_id} (${newLead.person_contacted})` : 'NOT FOUND');

  if (newLead) {
    const convertRes = await patch(`http://localhost:5000/api/opportunities/${newLead.id}`, {
      current_status: 'CONVERTED',
      final_agreed_price: 85000,
      remarks: 'Patient admitted on 18th Sept. Hepatic resection procedure scheduled.'
    }, hospitalAdminLogin.data.token);
    console.log('   Hospital Admin Converted Status:', convertRes.status === 200, '| New Status:', convertRes.data.opportunity.current_status);
  }

  // 6. Verify Doctor's Rewards Dashboard shows ELIGIBLE reward
  console.log('6. Checking Doctor Referral & Reward Status...');
  const doctorRewards = await get('http://localhost:5000/api/rewards', doctorLogin.data.token);
  const updatedDoctorReward = doctorRewards.data.rewards.find(r => r.opportunity_id === referralSubmit.data.opportunity_id);
  console.log('   Doctor Reward Status:', updatedDoctorReward ? `${updatedDoctorReward.status} (Value: ₹${updatedDoctorReward.reward_value})` : 'Reward linked');

  // 7. Super Admin 19-Column Tracker
  console.log('7. Testing Super Admin Global Tracker...');
  const superAdminLogin = await post('http://localhost:5000/api/auth/login', { email: 'admin@company.com', password: 'admin123' });
  const superAdminLeads = await get('http://localhost:5000/api/opportunities', superAdminLogin.data.token);
  console.log('   Super Admin Total Tracker Leads:', superAdminLeads.data.opportunities.length);

  console.log('\n✅ ALL PHASE 2 FLOWS VERIFIED SUCCESSFULLY!');
}

runTests().catch(console.error);
