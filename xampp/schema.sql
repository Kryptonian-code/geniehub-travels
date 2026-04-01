CREATE DATABASE IF NOT EXISTS geniehub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE geniehub;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('client', 'admin') NOT NULL DEFAULT 'client',
  admin_role ENUM('super-admin', 'admin', 'content-manager', 'operations-staff', 'finance-staff') NULL,
  password_hash VARCHAR(255) NOT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 0,
  password_updated_at VARCHAR(40) NULL,
  created_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service VARCHAR(255) NOT NULL,
  booking_date VARCHAR(40) NOT NULL,
  booking_time VARCHAR(40) NOT NULL,
  meeting_type VARCHAR(50) NOT NULL,
  notes TEXT NULL,
  status VARCHAR(50) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_consultation_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS contact_leads (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_lead_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS tour_enquiries (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  departure VARCHAR(40) NOT NULL,
  return_date VARCHAR(40) NOT NULL,
  passengers VARCHAR(20) NOT NULL,
  budget VARCHAR(100) NULL,
  notes TEXT NULL,
  status VARCHAR(50) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_tour_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS visa_applications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  visa_type VARCHAR(100) NOT NULL,
  destination_country VARCHAR(100) NOT NULL,
  purpose TEXT NOT NULL,
  travel_date VARCHAR(40) NOT NULL,
  notes TEXT NULL,
  status VARCHAR(50) NOT NULL,
  timeline_step VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_visa_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  application_id VARCHAR(64) NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  mime_type VARCHAR(120) NULL,
  file_size BIGINT NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NULL,
  original_filename VARCHAR(255) NULL,
  category VARCHAR(64) NOT NULL DEFAULT 'other',
  status VARCHAR(50) NOT NULL DEFAULT 'pending-review',
  client_notes TEXT NULL,
  admin_notes TEXT NULL,
  uploaded_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
);

CREATE TABLE IF NOT EXISTS client_profiles (
  user_id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  date_of_birth VARCHAR(40) NULL,
  nationality VARCHAR(100) NULL,
  passport_number VARCHAR(100) NULL,
  preferred_contact_method VARCHAR(30) NOT NULL DEFAULT 'whatsapp',
  profile_photo_url VARCHAR(255) NULL,
  comm_email TINYINT(1) NOT NULL DEFAULT 1,
  comm_whatsapp TINYINT(1) NOT NULL DEFAULT 1,
  comm_sms TINYINT(1) NOT NULL DEFAULT 0,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS service_requests (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  request_type VARCHAR(80) NOT NULL,
  destination VARCHAR(255) NULL,
  travel_date VARCHAR(40) NULL,
  budget VARCHAR(100) NULL,
  travellers VARCHAR(20) NULL,
  urgency VARCHAR(20) NULL,
  notes TEXT NULL,
  status VARCHAR(50) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_service_request_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  application_id VARCHAR(64) NULL,
  consultation_id VARCHAR(64) NULL,
  service_request_id VARCHAR(64) NULL,
  category VARCHAR(60) NOT NULL,
  reference_code VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  status VARCHAR(40) NOT NULL,
  receipt_url VARCHAR(255) NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS checklist_items (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  application_id VARCHAR(64) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(40) NOT NULL,
  due_date VARCHAR(40) NULL,
  action_label VARCHAR(120) NULL,
  action_path VARCHAR(255) NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_checklist_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS message_threads (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'secure-portal',
  unread_count INT NOT NULL DEFAULT 0,
  last_message_at VARCHAR(40) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_thread_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id VARCHAR(64) PRIMARY KEY,
  thread_id VARCHAR(64) NOT NULL,
  sender_role VARCHAR(20) NOT NULL,
  sender_name VARCHAR(255) NULL,
  body TEXT NOT NULL,
  attachment_name VARCHAR(255) NULL,
  attachment_url VARCHAR(255) NULL,
  read_at VARCHAR(40) NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_message_thread FOREIGN KEY (thread_id) REFERENCES message_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  action_path VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  image_url VARCHAR(255) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  published_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS app_settings (
  id VARCHAR(32) PRIMARY KEY,
  brand_name VARCHAR(100) NOT NULL,
  tagline TEXT NOT NULL,
  support_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  office_address VARCHAR(255) NOT NULL,
  working_hours VARCHAR(255) NOT NULL,
  whatsapp_number VARCHAR(50) NOT NULL,
  instagram_url VARCHAR(255) NULL,
  facebook_url VARCHAR(255) NULL,
  twitter_url VARCHAR(255) NULL,
  snapchat_url VARCHAR(255) NULL,
  linkedin_url VARCHAR(255) NULL,
  tiktok_url VARCHAR(255) NULL,
  default_currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  auto_assign_chat TINYINT(1) NOT NULL DEFAULT 1,
  tawk_property_id VARCHAR(120) NULL,
  tawk_widget_id VARCHAR(120) NULL,
  hero_title VARCHAR(255) NOT NULL,
  hero_subtitle TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_users (
  id VARCHAR(64) PRIMARY KEY,
  linked_user_id VARCHAR(64) NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  role ENUM('super-admin', 'admin', 'content-manager', 'operations-staff', 'finance-staff') NOT NULL DEFAULT 'admin',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  is_chat_agent TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_admin_user_linked FOREIGN KEY (linked_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS lead_meta (
  lead_id VARCHAR(64) PRIMARY KEY,
  source VARCHAR(120) NULL,
  service_type VARCHAR(120) NULL,
  destination VARCHAR(120) NULL,
  assigned_staff_user_id VARCHAR(64) NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
  status ENUM('new', 'contacted', 'awaiting-documents', 'in-progress', 'closed', 'lost') NOT NULL DEFAULT 'new',
  internal_notes TEXT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_lead_meta_staff FOREIGN KEY (assigned_staff_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS application_meta (
  application_id VARCHAR(64) PRIMARY KEY,
  application_type VARCHAR(80) NOT NULL,
  destination_country VARCHAR(120) NULL,
  assigned_staff_user_id VARCHAR(64) NULL,
  stage VARCHAR(120) NOT NULL,
  status VARCHAR(60) NOT NULL,
  next_action VARCHAR(255) NULL,
  internal_notes TEXT NULL,
  client_updates_json LONGTEXT NULL,
  linked_checklist_json LONGTEXT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_application_meta_staff FOREIGN KEY (assigned_staff_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS application_updates (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  visibility ENUM('client', 'internal') NOT NULL DEFAULT 'client',
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  created_by_user_id VARCHAR(64) NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_application_update_staff FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS consultation_meta (
  consultation_id VARCHAR(64) PRIMARY KEY,
  assigned_staff_user_id VARCHAR(64) NULL,
  internal_notes TEXT NULL,
  client_note TEXT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_consultation_meta_staff FOREIGN KEY (assigned_staff_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS service_request_meta (
  request_id VARCHAR(64) PRIMARY KEY,
  assigned_staff_user_id VARCHAR(64) NULL,
  internal_notes TEXT NULL,
  updated_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_service_meta_staff FOREIGN KEY (assigned_staff_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS visa_services (
  id VARCHAR(64) PRIMARY KEY,
  country VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  requirements LONGTEXT NOT NULL,
  checklist_copy LONGTEXT NULL,
  pricing_note TEXT NULL,
  seo_title VARCHAR(255) NULL,
  seo_description TEXT NULL,
  cta_visible TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS study_abroad_records (
  id VARCHAR(64) PRIMARY KEY,
  country VARCHAR(120) NOT NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NOT NULL,
  intake_information TEXT NULL,
  programme_information LONGTEXT NULL,
  cta_text VARCHAR(120) NULL,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS tour_packages (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  destination VARCHAR(120) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  description LONGTEXT NULL,
  starting_price VARCHAR(120) NULL,
  currency VARCHAR(10) NULL,
  travel_period VARCHAR(120) NULL,
  travel_dates VARCHAR(255) NULL,
  itinerary_summary LONGTEXT NULL,
  inclusions LONGTEXT NULL,
  exclusions LONGTEXT NULL,
  image_gallery LONGTEXT NULL,
  image_url VARCHAR(255) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  status ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'published',
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS destination_options (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category ENUM('study-abroad', 'visa', 'tour', 'travel') NOT NULL DEFAULT 'travel',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(64) PRIMARY KEY,
  client_name VARCHAR(255) NOT NULL,
  category ENUM('study-abroad', 'visa', 'tours', 'travel-support') NOT NULL,
  quote_text LONGTEXT NOT NULL,
  image_url VARCHAR(255) NULL,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0,
  approval_status ENUM('approved', 'pending', 'rejected') NOT NULL DEFAULT 'approved',
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS faq_items (
  id VARCHAR(64) PRIMARY KEY,
  category ENUM('visa', 'study-abroad', 'tours', 'payments', 'consultations', 'general') NOT NULL DEFAULT 'general',
  question VARCHAR(255) NOT NULL,
  answer LONGTEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS content_blocks (
  id VARCHAR(64) PRIMARY KEY,
  block_key VARCHAR(120) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  section_key VARCHAR(120) NULL,
  description TEXT NULL,
  body LONGTEXT NOT NULL,
  icon VARCHAR(80) NULL,
  display_order INT NOT NULL DEFAULT 0,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  placement VARCHAR(120) NULL,
  cta_label VARCHAR(120) NULL,
  cta_href VARCHAR(255) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_alerts (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  action_path VARCHAR(255) NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  created_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS service_pricing (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'GHS',
  category VARCHAR(80) NOT NULL,
  is_visible TINYINT(1) NOT NULL DEFAULT 1,
  display_order INT NOT NULL DEFAULT 0,
  created_at VARCHAR(40) NOT NULL,
  updated_at VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_threads (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  visitor_name VARCHAR(255) NULL,
  visitor_email VARCHAR(255) NULL,
  visitor_phone VARCHAR(50) NULL,
  subject VARCHAR(255) NOT NULL,
  channel VARCHAR(30) NOT NULL DEFAULT 'tawk',
  assigned_staff_id VARCHAR(64) NULL,
  unread_count INT NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'open',
  last_message_at VARCHAR(40) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_chat_thread_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_chat_thread_staff FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id VARCHAR(64) PRIMARY KEY,
  thread_id VARCHAR(64) NOT NULL,
  sender_role VARCHAR(30) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  body LONGTEXT NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  CONSTRAINT fk_chat_message_thread FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at VARCHAR(40) NOT NULL,
  used_at VARCHAR(40) NULL,
  created_at VARCHAR(40) NOT NULL,
  INDEX idx_reset_user (user_id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor_user_id VARCHAR(64) NULL,
  actor_role VARCHAR(40) NOT NULL,
  action_key VARCHAR(120) NOT NULL,
  target_type VARCHAR(120) NOT NULL,
  target_id VARCHAR(64) NULL,
  summary VARCHAR(255) NOT NULL,
  created_at VARCHAR(40) NOT NULL,
  INDEX idx_audit_actor (actor_user_id),
  INDEX idx_audit_target (target_type, target_id)
);

INSERT INTO app_settings (
  id, brand_name, tagline, support_email, phone, office_address, working_hours, whatsapp_number, instagram_url, facebook_url, twitter_url, snapchat_url, linkedin_url, tiktok_url, default_currency, auto_assign_chat, tawk_property_id, tawk_widget_id, hero_title, hero_subtitle
)
VALUES (
  'default',
  'GenieHub',
  'Smarter travel applications, client tracking, and admin operations in one place.',
  'hello@geniehub.co',
  '+233 24 000 0000',
  'East Legon, Accra, Ghana',
  'Mon - Fri: 8:00 AM - 5:00 PM | Sat: 9:00 AM - 2:00 PM',
  '+233240000000',
  '',
  '',
  '',
  '',
  '',
  '',
  'GHS',
  1,
  '',
  '',
  'Travel planning, visa applications, and client care from one intelligent hub.',
  'GenieHub helps travellers and students book consultations, track application progress, upload documents, and stay aligned with your team.'
)
ON DUPLICATE KEY UPDATE brand_name = VALUES(brand_name);

INSERT INTO blog_posts (id, title, slug, category, excerpt, content, author, published, published_at)
VALUES
('blog-1', '5 Things to Prepare Before a Student Visa Interview', 'prepare-before-student-visa-interview', 'Visa Tips', 'A practical checklist for students who want to walk into their interview with confidence and complete documentation.', 'Strong preparation starts with your admission documents, financial proof, travel intent, and a clear story about your study plans. Organise your paperwork, rehearse answers honestly, and make sure your records are consistent across all submitted forms.', 'GenieHub Editorial', 1, '2026-03-18'),
('blog-2', 'How to Choose Between Study Abroad Destinations', 'choose-between-study-abroad-destinations', 'Study Abroad', 'Compare cost, post-study work pathways, entry requirements, and lifestyle before committing to a destination.', 'Choosing a destination is usually less about prestige and more about fit. Balance tuition, living costs, visa policy, employability, and support systems. A good shortlist should reflect both your career goals and your financial reality.', 'GenieHub Editorial', 1, '2026-03-11'),
('blog-3', 'What Makes a Strong Tour Enquiry', 'what-makes-a-strong-tour-enquiry', 'Travel Guide', 'The best travel proposals come from clear dates, budgets, group size, and trip expectations right from the start.', 'When clients share destination, budget, travel windows, number of passengers, and preferences early, your travel team can respond faster with better options. Structured enquiries reduce back-and-forth and improve conversion.', 'GenieHub Editorial', 1, '2026-03-03')
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO destination_options (id, name, category, is_active, updated_at)
VALUES
('destination-uk', 'United Kingdom', 'study-abroad', 1, '2026-03-30T08:00:00.000Z'),
('destination-canada', 'Canada', 'study-abroad', 1, '2026-03-30T08:00:00.000Z'),
('destination-dubai', 'Dubai', 'tour', 1, '2026-03-30T08:00:00.000Z'),
('destination-cape-coast', 'Cape Coast & Elmina', 'tour', 1, '2026-03-30T08:00:00.000Z'),
('destination-mole', 'Mole National Park', 'tour', 1, '2026-03-30T08:00:00.000Z'),
('destination-london', 'London', 'travel', 1, '2026-03-30T08:00:00.000Z'),
('destination-new-york', 'New York', 'travel', 1, '2026-03-30T08:00:00.000Z'),
('destination-uk-visa', 'United Kingdom', 'visa', 1, '2026-03-30T08:00:00.000Z')
ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), is_active = VALUES(is_active), updated_at = VALUES(updated_at);

INSERT INTO visa_services (id, country, title, requirements, checklist_copy, pricing_note, seo_title, seo_description, cta_visible, status, updated_at)
VALUES
('visa-service-uk-visitor', 'United Kingdom', 'UK Visitor Visa Support', 'Passport, bank statement, employment or sponsor documents, travel itinerary', 'Passport bio page, financial proof, accommodation plan, covering letter', 'Fees vary depending on urgency and application type.', 'UK Visitor Visa Support | GenieHub', 'Get guided support for UK visitor visa applications from Ghana.', 1, 'published', '2026-03-30T08:00:00.000Z'),
('visa-service-canada-study', 'Canada', 'Canada Study Visa Support', 'Passport, admission letter, tuition evidence, financial proof, study plan', 'Admission letter, passport, proof of funds, tuition receipts, study plan', 'Pricing depends on documentation support and submission complexity.', 'Canada Study Visa Support | GenieHub', 'Structured support for Canada study permit applications from Ghana.', 1, 'published', '2026-03-30T08:00:00.000Z')
ON DUPLICATE KEY UPDATE title = VALUES(title), requirements = VALUES(requirements), updated_at = VALUES(updated_at);

INSERT INTO study_abroad_records (id, country, title, programme_information, intake_information, summary, cta_text, status, updated_at)
VALUES
('study-uk', 'United Kingdom', 'United Kingdom Study Pathways', 'Business, Engineering, Nursing, Information Technology', 'September and January intakes', 'Support students with school shortlisting, admissions, financial planning, and visa readiness for UK institutions.', 'Book a study consultation', 'published', '2026-03-30T08:00:00.000Z'),
('study-canada', 'Canada', 'Canada Study Pathways', 'Computer Science, Healthcare, Business Administration', 'September, January, and May intakes', 'Guide students through admissions, proof of funds, and visa preparation for Canada.', 'Book a study consultation', 'published', '2026-03-30T08:00:00.000Z')
ON DUPLICATE KEY UPDATE title = VALUES(title), summary = VALUES(summary), updated_at = VALUES(updated_at);

INSERT INTO tour_packages (id, title, destination, duration, description, starting_price, currency, travel_period, travel_dates, itinerary_summary, inclusions, exclusions, image_gallery, featured, visible, image_url, status, updated_at)
VALUES
('tour-kakum', 'Kakum National Park', 'Central Region', '1 Day', 'Walk the famous canopy walkway, explore rainforest trails, and experience Ghanaian nature at its best.', 'From GHS 650', 'GHS', 'All year round', 'Custom departure dates available', 'Canopy walk, rainforest access, local guide support.', 'Transport, guide, park entry.', 'Meals, personal shopping, extras not listed.', '[]', 1, 1, NULL, 'published', '2026-03-30T08:00:00.000Z'),
('tour-elmina', 'Elmina Castle Heritage Tour', 'Cape Coast & Elmina', '2 Days / 1 Night', 'Explore Cape Coast Castle, Elmina Castle, Kakum, and the vibrant coastal markets.', 'From GHS 1,200', 'GHS', 'All year round', 'Flexible weekend departures', 'Heritage sites, guided excursions, and coastal lodging.', 'Transport, accommodation, guided tours.', 'Lunch, visa fees, personal expenses.', '[]', 1, 1, NULL, 'published', '2026-03-30T08:00:00.000Z'),
('tour-mole', 'Mole National Park Safari', 'Mole National Park', '3 Days / 2 Nights', 'Safari drives, elephant encounters, Larabanga Mosque visit, and savannah lodge experience.', 'From GHS 2,800', 'GHS', 'November to April', 'Seasonal departures', 'Safari drives, wildlife encounters, cultural stopovers.', 'Transport, lodge stay, safari access.', 'Lunch, visa fees, personal spending.', '[]', 1, 1, NULL, 'published', '2026-03-30T08:00:00.000Z')
ON DUPLICATE KEY UPDATE title = VALUES(title), destination = VALUES(destination), updated_at = VALUES(updated_at);

INSERT INTO content_blocks (id, block_key, section_key, title, description, body, icon, display_order, is_visible, published, placement, cta_label, cta_href, updated_at)
VALUES
('content-nav-home', 'header_navigation.home', 'header_navigation', 'Home', 'Main navigation link', '/', NULL, 1, 1, 1, NULL, NULL, '/', '2026-03-30T08:00:00.000Z'),
('content-nav-about', 'header_navigation.about', 'header_navigation', 'About', 'Main navigation link', '/about', NULL, 2, 1, 1, NULL, NULL, '/about', '2026-03-30T08:00:00.000Z'),
('content-nav-services', 'header_navigation.services', 'header_navigation', 'Services', 'Main navigation link', '/services', NULL, 3, 1, 1, NULL, NULL, '/services', '2026-03-30T08:00:00.000Z'),
('content-nav-study', 'header_navigation.study_abroad', 'header_navigation', 'Study Abroad', 'Main navigation link', '/study-abroad', NULL, 4, 1, 1, NULL, NULL, '/study-abroad', '2026-03-30T08:00:00.000Z'),
('content-nav-visa', 'header_navigation.visa_help', 'header_navigation', 'Visa Help', 'Main navigation link', '/visa-assistance', NULL, 5, 1, 1, NULL, NULL, '/visa-assistance', '2026-03-30T08:00:00.000Z'),
('content-nav-tours', 'header_navigation.tours', 'header_navigation', 'Tours', 'Main navigation link', '/tours', NULL, 6, 1, 1, NULL, NULL, '/tours', '2026-03-30T08:00:00.000Z'),
('content-nav-blog', 'header_navigation.blog', 'header_navigation', 'Blog', 'Main navigation link', '/blog', NULL, 7, 1, 1, NULL, NULL, '/blog', '2026-03-30T08:00:00.000Z'),
('content-nav-contact', 'header_navigation.contact', 'header_navigation', 'Contact', 'Main navigation link', '/contact', NULL, 8, 1, 1, NULL, NULL, '/contact', '2026-03-30T08:00:00.000Z'),
('content-footer-quick-study', 'footer_quick_links.study_abroad', 'footer_quick_links', 'Study Abroad', NULL, '/study-abroad', NULL, 1, 1, 1, NULL, NULL, '/study-abroad', '2026-03-30T08:00:00.000Z'),
('content-footer-quick-visa', 'footer_quick_links.visa_assistance', 'footer_quick_links', 'Visa Assistance', NULL, '/visa-assistance', NULL, 2, 1, 1, NULL, NULL, '/visa-assistance', '2026-03-30T08:00:00.000Z'),
('content-footer-quick-tours', 'footer_quick_links.tour_packages', 'footer_quick_links', 'Tour Packages', NULL, '/tours', NULL, 3, 1, 1, NULL, NULL, '/tours', '2026-03-30T08:00:00.000Z'),
('content-footer-support-faq', 'footer_support_links.faq', 'footer_support_links', 'FAQ', NULL, '/faq', NULL, 1, 1, 1, NULL, NULL, '/faq', '2026-03-30T08:00:00.000Z'),
('content-footer-support-blog', 'footer_support_links.blog', 'footer_support_links', 'Blog', NULL, '/blog', NULL, 2, 1, 1, NULL, NULL, '/blog', '2026-03-30T08:00:00.000Z'),
('content-footer-support-contact', 'footer_support_links.contact', 'footer_support_links', 'Contact Us', NULL, '/contact', NULL, 3, 1, 1, NULL, NULL, '/contact', '2026-03-30T08:00:00.000Z')
ON DUPLICATE KEY UPDATE title = VALUES(title), body = VALUES(body), cta_href = VALUES(cta_href), updated_at = VALUES(updated_at);
