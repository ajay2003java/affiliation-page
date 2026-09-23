const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Connected to Supabase Cloud Database');
} else {
  console.log('⚡ Running with local SQLite database engine (zero-config mode)');
}

const dbPath = path.join(__dirname, 'portal.db');
const localDb = new Database(dbPath);
localDb.pragma('journal_mode = WAL');
localDb.pragma('foreign_keys = ON');

// Initialize schema (Purely Additive)
const schemaSql = `
CREATE TABLE IF NOT EXISTS entities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tagline TEXT,
    color_theme TEXT NOT NULL,
    industry_focus TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    city TEXT,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'USER',
    organization_id TEXT,
    organization_name TEXT,
    industry TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS opportunities (
    id TEXT PRIMARY KEY,
    job_id TEXT UNIQUE NOT NULL,
    date_added DATE NOT NULL,
    referring_user_id TEXT,
    target_entity_id TEXT NOT NULL,
    target_organization_id TEXT,
    intake_type TEXT DEFAULT 'COMPANY_GROWTH',
    client_name TEXT NOT NULL,
    person_contacted TEXT,
    designation_role TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    service_product TEXT NOT NULL,
    requirement_breakdown TEXT,
    clinical_intake_notes TEXT,
    current_status TEXT NOT NULL DEFAULT 'SUBMITTED',
    last_discussion TEXT,
    quoted_price REAL DEFAULT 0.00,
    pricing_type TEXT DEFAULT 'One-Time',
    quote_status TEXT DEFAULT 'Draft',
    final_agreed_price REAL,
    next_action TEXT,
    follow_up_date DATE,
    product_owner TEXT,
    conversion_date DATE,
    lost_reason TEXT,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(referring_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(target_entity_id) REFERENCES entities(id),
    FOREIGN KEY(target_organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS rewards (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reward_type TEXT NOT NULL DEFAULT 'FIXED_AMOUNT',
    reward_value REAL NOT NULL DEFAULT 5000.00,
    status TEXT NOT NULL DEFAULT 'NOT_ELIGIBLE',
    eligible_date DATETIME,
    provided_date DATETIME,
    payout_reference TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS status_history (
    id TEXT PRIMARY KEY,
    opportunity_id TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
);
`;

localDb.exec(schemaSql);

// Safe additive schema migration helper for SQLite
function ensureColumn(table, column, typeDef) {
  try {
    const tableInfo = localDb.prepare(`PRAGMA table_info(${table})`).all();
    const exists = tableInfo.some(col => col.name === column);
    if (!exists) {
      localDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${typeDef}`);
    }
  } catch (e) {
    console.warn(`Migration check for ${table}.${column}:`, e.message);
  }
}

ensureColumn('users', 'organization_id', 'TEXT');
ensureColumn('users', 'organization_name', 'TEXT');
ensureColumn('users', 'intent_selected', 'INTEGER DEFAULT 0');
ensureColumn('organizations', 'is_self_serve', 'INTEGER DEFAULT 0');
ensureColumn('organizations', 'reward_amount', 'REAL DEFAULT 5000.00');
ensureColumn('opportunities', 'target_organization_id', 'TEXT');
ensureColumn('opportunities', 'intake_type', "TEXT DEFAULT 'COMPANY_GROWTH'");
ensureColumn('opportunities', 'clinical_intake_notes', 'TEXT');

// Seed default entities
localDb.prepare(`
  INSERT OR IGNORE INTO entities (id, name, tagline, color_theme, industry_focus) VALUES
  ('ottobon', 'Ottobon Academy', 'Digital Growth & Technology for Educational Institutes', '#2563EB', 'Education'),
  ('medcy', 'Medcy Health Tech', 'Digital Systems & Patient Growth for Clinics and Hospitals', '#059669', 'Healthcare'),
  ('sbloom', 'sBloom', 'Social Media & Brand Growth for Healthcare & Education', '#9333EA', 'Social Media Growth')
`).run();

// Wipe old test organizations and keep ONLY the 4 real client institutions
localDb.prepare("DELETE FROM organizations WHERE id NOT IN ('org-bansal-college', 'org-basara-defence', 'org-basara-school', 'org-sainik-academy')").run();

// Seed real onboarded client organizations
localDb.prepare(`
  INSERT OR REPLACE INTO organizations (id, name, category, city, contact_person, phone, email, status) VALUES
  ('org-bansal-college', 'Bansal Intermediate College', 'Education', 'Hyderabad / Telangana', 'Suresh', '+91 9876543220', 'admissions@bansalcollege.edu', 'ACTIVE'),
  ('org-basara-defence', 'Basara Defence Academy', 'Education', 'Basara / Telangana', 'Ramesh', '+91 9876543221', 'director@basaradefence.edu', 'ACTIVE'),
  ('org-basara-school', 'Basara School', 'Education', 'Basara / Telangana', 'Ramesh', '+91 9876543222', 'info@basaraschool.edu', 'ACTIVE'),
  ('org-sainik-academy', 'Sainik Academy', 'Education', 'Telangana', 'Bhaskar', '+91 9876543223', 'director@sainikacademy.edu', 'ACTIVE')
`).run();

// Clean up all mock/test users and seed authentic admin & user accounts
localDb.prepare("DELETE FROM users WHERE id NOT IN ('usr-admin-1', 'usr-sharma-2', 'usr-bansal-admin', 'usr-basara-defence-admin', 'usr-basara-school-admin', 'usr-sainik-admin')").run();

localDb.prepare(`
  INSERT OR REPLACE INTO users (id, email, name, phone, password_hash, role, organization_id, organization_name, industry, intent_selected, status) VALUES
  ('usr-admin-1', 'admin@company.com', 'Super Admin', '+91 9876543210', 'admin123', 'SUPER_ADMIN', NULL, 'Headquarters', 'Management', 1, 'ACTIVE'),
  ('usr-sharma-2', 'sharma@cityclinic.com', 'Dr. Sharma', '+91 9876543211', 'user123', 'USER', NULL, 'City Health Clinic', 'Healthcare', 1, 'ACTIVE'),
  ('usr-bansal-admin', 'admissions@bansalcollege.edu', 'Bansal College Admissions Desk', '+91 9876543220', 'admin123', 'ADMIN', 'org-bansal-college', 'Bansal Intermediate College', 'Education', 1, 'ACTIVE'),
  ('usr-basara-defence-admin', 'director@basaradefence.edu', 'Basara Defence Admissions', '+91 9876543221', 'admin123', 'ADMIN', 'org-basara-defence', 'Basara Defence Academy', 'Education', 1, 'ACTIVE'),
  ('usr-basara-school-admin', 'info@basaraschool.edu', 'Basara School Admissions Desk', '+91 9876543222', 'admin123', 'ADMIN', 'org-basara-school', 'Basara School', 'Education', 1, 'ACTIVE'),
  ('usr-sainik-admin', 'director@sainikacademy.edu', 'Sainik Academy Admissions', '+91 9876543223', 'admin123', 'ADMIN', 'org-sainik-academy', 'Sainik Academy', 'Education', 1, 'ACTIVE')
`).run();

// Ensure all administrators always have intent_selected = 1
localDb.prepare("UPDATE users SET intent_selected = 1 WHERE role IN ('SUPER_ADMIN', 'ADMIN')").run();

// Clean up old opportunities and seed authentic student & candidate admissions
localDb.prepare("DELETE FROM opportunities").run();

// Seed authentic admissions & candidate referrals for real institutions
localDb.prepare(`
  INSERT INTO opportunities (
    id, job_id, date_added, referring_user_id, target_entity_id, target_organization_id, intake_type,
    client_name, person_contacted, designation_role, phone, email, location, service_product,
    requirement_breakdown, clinical_intake_notes, current_status, last_discussion, quoted_price,
    pricing_type, quote_status, final_agreed_price, product_owner, conversion_date, remarks
  ) VALUES
  (
    'opp-bic-1', 'BIC-101', '2026-08-01', 'usr-sharma-2', 'ottobon', 'org-bansal-college', 'STUDENT_ADMISSION',
    'Aakash Verma', 'Aakash Verma', 'Student (Class 11th)', '+91 9845123401', 'aakash.verma@gmail.com', 'Hyderabad',
    'Intermediate 11th Science (PCM)', 'Full-time 2-Year Intermediate Science with JEE Foundation coaching',
    'Referred by Dr. Arvind Sharma; student completed 10th with 94% marks.', 'CONVERTED',
    'Fee paid and enrollment confirmed for 2026 Academic Batch', 45000.00, 'annual', 'agreed', 45000.00,
    'Suresh (Admissions Head)', '2026-08-01', 'Admission confirmed; 1st installment cleared'
  ),
  (
    'opp-bic-2', 'BIC-102', '2026-08-25', 'usr-sharma-2', 'ottobon', 'org-bansal-college', 'STUDENT_ADMISSION',
    'Pooja Reddy', 'Pooja Reddy', 'Student (Class 12th)', '+91 9845123402', 'pooja.reddy@gmail.com', 'Hyderabad',
    'Intermediate 12th Commerce & CA Foundation', 'Transfer admission for Class 12th Commerce with CA Foundation batch',
    'Referred by Dr. Arvind Sharma; visited college campus with parents.', 'IN DISCUSSION',
    'Counseling complete; parent requested fee installment option', 40000.00, 'annual', 'Draft', 38000.00,
    'Suresh (Admissions Head)', NULL, 'Campus tour completed; waiting for final fee clearance'
  ),
  (
    'opp-bda-1', 'BDA-101', '2026-08-17', 'usr-sharma-2', 'ottobon', 'org-basara-defence', 'DEFENCE_CADET',
    'Vikramaditya Rao', 'Vikramaditya Rao', 'Cadet (NDA Batch)', '+91 9845123403', 'vikram.rao@gmail.com', 'Basara / Nizamabad',
    'NDA 2026 Foundation & SSB Coaching', 'Residential NDA Coaching with daily physical conditioning and SSB interview prep',
    'Referred by Dr. Arvind Sharma; cadet cleared physical standard check.', 'CONVERTED',
    'Hostel & tuition fee deposited; batch starts Monday', 65000.00, 'annual', 'agreed', 65000.00,
    'Ramesh (Director)', '2026-08-17', 'Enrolled in 2026 NDA residential wing'
  ),
  (
    'opp-bda-2', 'BDA-102', '2026-09-02', 'usr-sharma-2', 'ottobon', 'org-basara-defence', 'DEFENCE_CADET',
    'Rohan Kulkarni', 'Rohan Kulkarni', 'Cadet (CDS Batch)', '+91 9845123404', 'rohan.kulkarni@gmail.com', 'Basara',
    'CDS Written & Physical Training Batch', 'CDS Combined Defence Services crash batch + SSB psychology coaching',
    'Referred by Dr. Arvind Sharma; candidate attended demo lecture.', 'IN DISCUSSION',
    'Written mock test completed with high score; enrollment in progress', 50000.00, 'annual', 'Draft', 48000.00,
    'Ramesh (Director)', NULL, 'Attended counseling and campus tour'
  ),
  (
    'opp-bs-1', 'BS-101', '2026-08-17', 'usr-sharma-2', 'ottobon', 'org-basara-school', 'STUDENT_ADMISSION',
    'Sneha Patel', 'Sneha Patel', 'Student (Grade 8)', '+91 9845123405', 'sneha.patel@gmail.com', 'Basara',
    'CBSE Grade 8 Primary Admission', 'CBSE Day-Scholar admission with school bus transport',
    'Referred by Dr. Arvind Sharma; TC verified from previous school.', 'CONVERTED',
    'Admission fee and 1st term tuition cleared', 35000.00, 'annual', 'agreed', 35000.00,
    'Ramesh (Director)', '2026-08-17', 'Uniform and books issued; student attending classes'
  ),
  (
    'opp-sa-1', 'SA-101', '2026-09-07', 'usr-sharma-2', 'ottobon', 'org-sainik-academy', 'DEFENCE_CADET',
    'Aditya Pratap Singh', 'Aditya Pratap Singh', 'Cadet (AISSEE Batch)', '+91 9845123406', 'aditya.singh@gmail.com', 'Telangana',
    'AISSEE Sainik School Entrance Coaching', 'Intensive entrance coaching for All India Sainik Schools Entrance Exam 2026',
    'Referred by Dr. Arvind Sharma; student enrolled in hostel wing.', 'CONVERTED',
    'Complete coaching and residential fee cleared', 55000.00, 'annual', 'agreed', 55000.00,
    'Bhaskar (Director)', '2026-09-07', 'Joined hostel on Sep 7; daily morning drills active'
  )
`).run();

// Clean up and seed corresponding rewards for converted partner referrals
localDb.prepare("DELETE FROM rewards").run();
localDb.prepare(`
  INSERT INTO rewards (id, opportunity_id, user_id, reward_type, reward_value, status, eligible_date, provided_date, payout_reference, notes) VALUES
  ('rew-bic-1', 'opp-bic-1', 'usr-sharma-2', 'FIXED_AMOUNT', 4000.00, 'PAID', '2026-08-01', '2026-08-01', 'UPI/UTR-883901928', 'Bansal Intermediate College admission reward paid via UPI to Dr. Arvind Sharma'),
  ('rew-bda-1', 'opp-bda-1', 'usr-sharma-2', 'FIXED_AMOUNT', 5000.00, 'PAID', '2026-08-17', '2026-08-17', 'UPI/UTR-994812039', 'Basara Defence Academy cadet enrollment reward paid via UPI to Dr. Arvind Sharma'),
  ('rew-bs-1', 'opp-bs-1', 'usr-sharma-2', 'FIXED_AMOUNT', 3000.00, 'PAID', '2026-08-17', '2026-08-17', 'UPI/UTR-773819203', 'Basara School admission reward paid via UPI to Dr. Arvind Sharma'),
  ('rew-sa-1', 'opp-sa-1', 'usr-sharma-2', 'FIXED_AMOUNT', 5000.00, 'PAID', '2026-09-07', '2026-09-07', 'UPI/UTR-662910394', 'Sainik Academy admission reward paid via UPI to Dr. Arvind Sharma')
`).run();

module.exports = {
  db: localDb,
  supabase
};
