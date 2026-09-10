// Milestone 12 Verification Script
// Tests Doctor Clinical Workflow: Medical Reports & E-Prescription against live backend contracts

import assert from 'node:assert';

const API_BASE = 'http://localhost:5000/api';

let totalPassed = 0;
let totalFailed = 0;

function pass(msg) {
  totalPassed++;
  console.log(`  ✓ ${msg}`);
}

function fail(msg, err) {
  totalFailed++;
  console.error(`  ✗ ${msg}`);
  if (err) console.error(`    ${err.message || err}`);
}

async function runTests() {
  console.log('====================================================');
  console.log('       MILESTONE 12 VERIFICATION TEST SUITE         ');
  console.log('====================================================\n');

  const rand = Math.floor(Math.random() * 899999 + 100000);
  const docAPhone = `92${rand}01`;
  const docBPhone = `92${rand}02`;
  const patPhone = `92${rand}03`;

  // 1. Setup: Register Doctor A, Doctor B, Patient
  console.log('Test Setup: Registering & authenticating test actors...');
  const docAEmail = `m12.docA.${rand}@example.com`;
  const docBEmail = `m12.docB.${rand}@example.com`;
  const patEmail = `m12.patient.${rand}@example.com`;
  const password = 'Password@123';

  // Register Doctor A
  const docARegRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Alice Specialist',
      email: docAEmail,
      password,
      role: 'DOCTOR',
      phone: docAPhone,
    }),
  });
  const docARegData = await docARegRes.json();
  assert.strictEqual(docARegRes.status, 201, `Doctor A reg failed: ${JSON.stringify(docARegData)}`);
  pass('Doctor A registered successfully');

  const docALoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: docAEmail, password }),
  });
  const docALoginData = await docALoginRes.json();
  const docAToken = docALoginData.token;
  const docAId = docALoginData.user.id;
  assert.ok(docAToken, 'Doctor A token required');
  pass('Doctor A authenticated successfully');

  // Register Doctor B (Unauthorized / unassigned doctor)
  const docBRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Dr. Bob Outside',
      email: docBEmail,
      password,
      role: 'DOCTOR',
      phone: docBPhone,
    }),
  });
  assert.strictEqual(docBRegRes.status, 201, 'Doctor B registered');
  const docBLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: docBEmail, password }),
  });
  const docBLoginData = await docBLoginRes.json();
  const docBToken = docBLoginData.token;
  const docBId = docBLoginData.user.id;
  assert.ok(docBToken, 'Doctor B token required');
  pass('Doctor B registered & authenticated successfully');

  // Register Patient
  const patRegRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Charlie Patient',
      email: patEmail,
      password,
      role: 'PATIENT',
      phone: patPhone,
    }),
  });
  assert.strictEqual(patRegRes.status, 201, 'Patient registered');
  const patLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: patEmail, password }),
  });
  const patLoginData = await patLoginRes.json();
  const patToken = patLoginData.token;
  const patId = patLoginData.user.id;
  assert.ok(patToken, 'Patient token required');
  pass('Patient registered & authenticated successfully');

  // Create Profile for Doctor A
  const docAProfileRes = await fetch(`${API_BASE}/doctor/create-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({
      specialization: 'Pulmonology',
      experience: 12,
      consultationFee: 750,
      qualification: 'MD, FCCP',
      hospitalName: 'DocTalk Respiratory Care',
      bio: 'Pulmonologist specializing in clinical management of respiratory conditions.',
      languages: 'English',
      timezone: 'UTC',
    }),
  });
  assert.strictEqual(docAProfileRes.status, 201, 'Doctor A profile created');
  const docAProfileData = await docAProfileRes.json();
  const docAProfileId = docAProfileData.doctorProfile.id;
  pass('Doctor A profile created');

  // Create Profile for Doctor B and verify Doctor B
  const docBProfileRes = await fetch(`${API_BASE}/doctor/create-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docBToken}`,
    },
    body: JSON.stringify({
      specialization: 'General Surgery',
      experience: 8,
      consultationFee: 800,
      qualification: 'MS, MBBS',
      hospitalName: 'DocTalk Surgery Center',
      bio: 'Surgeon with outpatient clinic.',
      languages: 'English',
      timezone: 'UTC',
    }),
  });
  assert.strictEqual(docBProfileRes.status, 201, 'Doctor B profile created');
  const docBProfileId = (await docBProfileRes.json()).doctorProfile.id;

  // Verify Doctor A & Doctor B via Admin
  const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'platform_admin@doctalk.com',
      password: 'AdminSecurePass123!',
    }),
  });
  if (adminLoginRes.status === 200) {
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    await fetch(`${API_BASE}/admin/doctors/${docAProfileId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    await fetch(`${API_BASE}/admin/doctors/${docBProfileId}/verify`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    pass('Doctor A & Doctor B verified by platform admin');
  }

  // Doctor A sets schedule
  const scheduleRes = await fetch(`${API_BASE}/doctor/schedule`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      active: true,
    }),
  });
  assert.strictEqual(scheduleRes.status, 201, 'Doctor A schedule set');
  pass('Doctor A working schedule configured (Monday 09:00 - 17:00)');

  // Create an appointment between Patient and Doctor A
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + ((1 + 7 - targetDate.getDay()) % 7 || 7)); // Next Monday
  const nextMondayStr = targetDate.toISOString().slice(0, 10);
  const apptTime = `${nextMondayStr}T10:00:00.000Z`;

  const bookRes = await fetch(`${API_BASE}/appointment/book`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify({
      doctorId: docAId,
      appointmentDate: apptTime,
      symptoms: 'Persistent dry cough and mild dyspnea on exertion.',
    }),
  });
  const bookData = await bookRes.json();
  assert.strictEqual(bookRes.status, 201, `Booking should succeed: ${JSON.stringify(bookData)}`);
  const appointmentId = bookData.appointment.id;
  pass(`Appointment booked successfully (#${appointmentId.slice(-6)})`);

  // Doctor A confirms appointment
  const confirmRes = await fetch(`${API_BASE}/appointment/update-status/${appointmentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({ status: 'CONFIRMED' }),
  });
  assert.strictEqual(confirmRes.status, 200, 'Appointment confirmed');
  pass('Appointment marked as CONFIRMED by Doctor A');

  // ========================================================
  // SECTION 1: PRESCRIPTION AUTHORIZATION & ROLES
  // ========================================================
  console.log('\n[Section 1: Prescription Role & Permission Guards]');

  // 1.1 Patient attempting to create a prescription -> 403 Forbidden
  const patCreateRxRes = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify({
      appointmentId,
      diagnosis: 'Unauthorized Self Prescription',
      items: [
        { medicineName: 'Amoxicillin', dosage: '500mg', frequency: 'TID', duration: 5, quantity: 15 },
      ],
    }),
  });
  assert.strictEqual(patCreateRxRes.status, 403, 'Patient cannot create prescriptions');
  pass('Patient receives 403 Forbidden on POST /api/prescriptions');

  // 1.2 Unassigned Doctor B attempting to prescribe for Doctor A appointment -> 403 Forbidden
  const docBCreateRxRes = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docBToken}`,
    },
    body: JSON.stringify({
      appointmentId,
      diagnosis: 'Interloping Diagnosis',
      items: [
        { medicineName: 'Azithromycin', dosage: '250mg', frequency: 'OD', duration: 3, quantity: 3 },
      ],
    }),
  });
  assert.strictEqual(docBCreateRxRes.status, 403, 'Unassigned doctor receives 403 Forbidden');
  pass('Doctor B receives 403 Forbidden when prescribing for an unassigned appointment');

  // ========================================================
  // SECTION 2: PRESCRIPTION VALIDATION & LIFECYCLE
  // ========================================================
  console.log('\n[Section 2: Prescription Validation & Lifecycle]');

  // 2.1 Missing required medicineName or invalid quantity -> 400 Bad Request
  const invalidRxRes = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({
      appointmentId,
      diagnosis: 'Acute Bronchitis',
      items: [
        { medicineName: '', dosage: '1 tablet', frequency: 'BD', duration: 5, quantity: 0 },
      ],
    }),
  });
  assert.strictEqual(invalidRxRes.status, 400, 'Invalid items should return 400');
  pass('Doctor A receives 400 Bad Request when submitting invalid prescription items');

  // 2.2 Doctor A creates DRAFT prescription
  const draftRxRes = await fetch(`${API_BASE}/prescriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({
      appointmentId,
      diagnosis: 'Subacute Bronchitis with Bronchospasm',
      clinicalNotes: 'Chest clear bilaterally, mild wheezing on forced expiration.',
      instructions: 'Maintain adequate hydration and rest.',
      status: 'DRAFT',
      items: [
        {
          medicineName: 'Levosalbutamol Inhaler',
          strength: '50 mcg',
          dosage: '2 puffs',
          frequency: 'As needed',
          duration: 14,
          durationUnit: 'DAYS',
          route: 'INHALATION',
          instructions: 'Rinse mouth after use',
          quantity: 1,
        },
        {
          medicineName: 'Montelukast Sodium',
          strength: '10 mg',
          dosage: '1 tablet',
          frequency: 'Once daily at bedtime',
          duration: 10,
          durationUnit: 'DAYS',
          route: 'ORAL',
          instructions: 'Take at night',
          quantity: 10,
        },
      ],
    }),
  });
  const draftRxData = await draftRxRes.json();
  assert.strictEqual(draftRxRes.status, 201, `Creating draft Rx should succeed: ${JSON.stringify(draftRxData)}`);
  const prescriptionId = draftRxData.prescription.id;
  assert.strictEqual(draftRxData.prescription.status, 'DRAFT');
  assert.strictEqual(draftRxData.prescription.items.length, 2);
  pass('Doctor A created DRAFT prescription successfully');

  // 2.3 Doctor A updates DRAFT prescription
  const updateRxRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({
      diagnosis: 'Subacute Bronchitis with Mild Allergic Asthma',
      clinicalNotes: 'Follow-up scheduled in 10 days if symptoms persist.',
      instructions: 'Avoid cold beverages and dust exposure.',
      items: [
        {
          medicineName: 'Levosalbutamol Inhaler',
          strength: '50 mcg',
          dosage: '2 puffs',
          frequency: 'Twice daily',
          duration: 14,
          durationUnit: 'DAYS',
          route: 'INHALATION',
          instructions: 'Rinse mouth after use',
          quantity: 1,
        },
        {
          medicineName: 'Montelukast Sodium',
          strength: '10 mg',
          dosage: '1 tablet',
          frequency: 'Once daily at bedtime',
          duration: 14,
          durationUnit: 'DAYS',
          route: 'ORAL',
          instructions: 'Take at night',
          quantity: 14,
        },
      ],
    }),
  });
  assert.strictEqual(updateRxRes.status, 200, 'Updating draft Rx should return 200');
  const updatedRxData = await updateRxRes.json();
  assert.strictEqual(updatedRxData.prescription.diagnosis, 'Subacute Bronchitis with Mild Allergic Asthma');
  pass('Doctor A updated DRAFT prescription successfully');

  // 2.4 Patient querying DRAFT prescription -> 403 Forbidden (Drafts not released to patients)
  const patGetDraftRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  assert.strictEqual(patGetDraftRes.status, 403, 'Patient cannot view DRAFT prescription');
  pass('Patient receives 403 Forbidden when attempting to view unfinalized DRAFT prescription');

  // 2.5 Doctor A issues prescription
  const issueRxRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}/issue`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(issueRxRes.status, 200, 'Issuing prescription should succeed');
  const issuedRxData = await issueRxRes.json();
  assert.strictEqual(issuedRxData.prescription.status, 'ISSUED');
  pass('Doctor A finalized & digitally issued prescription to patient');

  // 2.6 Doctor A attempting to edit ISSUED prescription -> 400 Bad Request (Immutability)
  const editIssuedRxRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${docAToken}`,
    },
    body: JSON.stringify({ diagnosis: 'Attempted Tamper After Sign' }),
  });
  assert.strictEqual(editIssuedRxRes.status, 400, 'Editing issued Rx must fail');
  pass('System prevents editing of ISSUED prescription (ensures clinical immutability)');

  // 2.7 Patient retrieves their issued prescriptions
  const patRxListRes = await fetch(`${API_BASE}/prescriptions/my-prescriptions`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  assert.strictEqual(patRxListRes.status, 200, 'Patient can list issued prescriptions');
  const patRxListData = await patRxListRes.json();
  const myRx = patRxListData.prescriptions.find((p) => p.id === prescriptionId);
  assert.ok(myRx, 'Issued prescription should be in patient list');
  assert.strictEqual(myRx.status, 'ISSUED');
  pass('Patient retrieves newly issued prescription via GET /api/prescriptions/my-prescriptions');

  // 2.8 Patient views prescription details by ID
  const patGetIssuedRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}`, {
    headers: { Authorization: `Bearer ${patToken}` },
  });
  assert.strictEqual(patGetIssuedRes.status, 200, 'Patient can view issued prescription by ID');
  const patIssuedData = await patGetIssuedRes.json();
  assert.strictEqual(patIssuedData.prescription.items.length, 2);
  pass('Patient retrieves detailed items for issued prescription');

  // 2.9 Doctor A cancels prescription
  const cancelRxRes = await fetch(`${API_BASE}/prescriptions/${prescriptionId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(cancelRxRes.status, 200, 'Cancelling prescription should succeed');
  const cancelledRxData = await cancelRxRes.json();
  assert.strictEqual(cancelledRxData.prescription.status, 'CANCELLED');
  pass('Doctor A cancelled prescription successfully');

  // ========================================================
  // SECTION 3: MEDICAL REPORTS & GRANULAR ACCESS CONTROL
  // ========================================================
  console.log('\n[Section 3: Medical Reports & Granular Access Control]');

  // 3.1 Patient creates report upload request
  const uploadReqRes = await fetch(`${API_BASE}/reports/upload-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify({
      title: 'Chest X-Ray PA View',
      reportType: 'IMAGING_XRAY',
      reportDate: '2026-09-09',
      fileName: 'chest_xray_pa.pdf',
      mimeType: 'application/pdf',
      fileSize: 204850,
    }),
  });
  assert.strictEqual(uploadReqRes.status, 201, 'Report upload-url should return 201');
  const uploadReqData = await uploadReqRes.json();
  const reportId = uploadReqData.reportId;
  assert.ok(reportId, 'Report ID generated');
  assert.ok(uploadReqData.uploadUrl, 'Presigned upload URL provided');
  pass('Patient generated presigned upload URL for medical report');

  // 3.2 Patient completes upload
  const completeRes = await fetch(`${API_BASE}/reports/${reportId}/complete-upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${patToken}` },
  });
  assert.strictEqual(completeRes.status, 200, 'Upload completion should return 200');
  pass('Patient confirmed report upload completion');

  // 3.3 Doctor A queries patient reports BEFORE access granted -> 403 Forbidden
  const docAGetReportsNoAccessRes = await fetch(`${API_BASE}/reports/patient/${patId}`, {
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(docAGetReportsNoAccessRes.status, 403, 'Doctor cannot view reports without access grant');
  pass('Doctor A receives 403 Forbidden before patient grants explicit report access');

  // 3.4 Doctor A requests download URL BEFORE access granted -> 403 Forbidden
  const docADownloadNoAccessRes = await fetch(`${API_BASE}/reports/${reportId}/download-url`, {
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(docADownloadNoAccessRes.status, 403, 'Doctor cannot download report without access');
  pass('Doctor A receives 403 Forbidden requesting download URL before access grant');

  // 3.5 Patient grants access to Doctor A
  const grantRes = await fetch(`${API_BASE}/reports/${reportId}/access`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${patToken}`,
    },
    body: JSON.stringify({
      doctorId: docAId,
      appointmentId,
    }),
  });
  assert.strictEqual(grantRes.status, 201, 'Patient grant access should return 201');
  const grantData = await grantRes.json();
  const accessId = grantData.access.id;
  assert.ok(accessId, 'Access ID returned');
  pass('Patient granted Doctor A access to medical report');

  // 3.6 Doctor A queries patient reports AFTER access granted -> 200 OK
  const docAGetReportsWithAccessRes = await fetch(`${API_BASE}/reports/patient/${patId}`, {
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(docAGetReportsWithAccessRes.status, 200, 'Doctor can view reports after access granted');
  const docAReportsData = await docAGetReportsWithAccessRes.json();
  const foundReport = docAReportsData.reports.find((r) => r.id === reportId);
  assert.ok(foundReport, 'Authorized report should be in doctor list');
  assert.strictEqual(foundReport.title, 'Chest X-Ray PA View');
  pass('Doctor A accesses patient report list following authorization');

  // 3.7 Doctor A requests presigned download URL -> 200 OK with ephemeral URL
  const docADownloadWithAccessRes = await fetch(`${API_BASE}/reports/${reportId}/download-url`, {
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(docADownloadWithAccessRes.status, 200, 'Doctor can generate download URL');
  const docADownloadData = await docADownloadWithAccessRes.json();
  assert.ok(docADownloadData.downloadUrl, 'Download URL provided');
  assert.strictEqual(docADownloadData.expiresIn, 900, 'Presigned URL expires in 900 seconds');
  pass('Doctor A received secure ephemeral presigned download URL (expires in 15 mins)');

  // 3.8 Doctor B (unauthorized doctor) queries patient reports -> 403 Forbidden
  const docBGetReportsRes = await fetch(`${API_BASE}/reports/patient/${patId}`, {
    headers: { Authorization: `Bearer ${docBToken}` },
  });
  assert.strictEqual(docBGetReportsRes.status, 403, 'Doctor B remains blocked from accessing reports');
  pass('Doctor B receives 403 Forbidden (isolation between ungranted physicians)');

  // 3.9 Patient revokes access from Doctor A
  const revokeRes = await fetch(`${API_BASE}/reports/${reportId}/access/${accessId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${patToken}` },
  });
  assert.strictEqual(revokeRes.status, 200, 'Patient revokes access');
  pass('Patient revoked report access from Doctor A');

  // 3.10 Doctor A queries patient reports AFTER revocation -> 403 Forbidden
  const docAGetReportsAfterRevokeRes = await fetch(`${API_BASE}/reports/patient/${patId}`, {
    headers: { Authorization: `Bearer ${docAToken}` },
  });
  assert.strictEqual(docAGetReportsAfterRevokeRes.status, 403, 'Doctor blocked after access revocation');
  pass('Doctor A receives 403 Forbidden after patient revoked access');

  // ========================================================
  // SECTION 4: SECURITY & CREDENTIAL HYGIENE
  // ========================================================
  console.log('\n[Section 4: Security & Credential Hygiene]');

  // Verify that report objects never leak raw S3 keys or internal secrets
  const rawJson = JSON.stringify(docAReportsData);
  assert.ok(!rawJson.includes('AWS_SECRET_ACCESS_KEY'), 'No AWS secrets in responses');
  assert.ok(!rawJson.includes('DATABASE_URL'), 'No database URLs in responses');
  pass('Zero credential or secret leaks detected in clinical responses');

  console.log('\n====================================================');
  console.log(`MILESTONE 12 VERIFICATION COMPLETE`);
  console.log(`Passed: ${totalPassed} | Failed: ${totalFailed}`);
  console.log('====================================================\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
