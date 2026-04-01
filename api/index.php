<?php

require_once __DIR__ . '/helpers.php';

boot_api();

$pdo = get_pdo();
$action = $_GET['action'] ?? '';
$body = json_input();

function fetch_rows(PDO $pdo, string $sql, array $params = []): array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    return $stmt->fetchAll();
}

function fetch_one(PDO $pdo, string $sql, array $params = []): ?array
{
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $row = $stmt->fetch();
    return $row ?: null;
}

function map_blog_post(array $row): array
{
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'slug' => $row['slug'],
        'category' => $row['category'],
        'excerpt' => $row['excerpt'],
        'content' => $row['content'],
        'author' => $row['author'],
        'imageUrl' => $row['image_url'] ?? null,
        'published' => (bool) $row['published'],
        'publishedAt' => $row['published_at'],
    ];
}

function map_document_row(array $row): array
{
    return [
        'id' => $row['id'],
        'userId' => $row['user_id'],
        'applicationId' => $row['application_id'],
        'fileName' => $row['file_name'],
        'fileType' => $row['file_type'],
        'mimeType' => $row['mime_type'] ?? $row['file_type'],
        'fileSize' => (int) $row['file_size'],
        'fileUrl' => $row['file_url'],
        'filePath' => $row['file_path'] ?? null,
        'originalFileName' => $row['original_filename'] ?? $row['file_name'],
        'category' => $row['category'],
        'status' => $row['status'],
        'clientNotes' => $row['client_notes'],
        'adminNotes' => $row['admin_notes'],
        'uploadedAt' => $row['uploaded_at'],
    ];
}

function map_payment_row(array $row): array
{
    return [
        'id' => $row['id'],
        'userId' => $row['user_id'],
        'applicationId' => $row['application_id'],
        'consultationId' => $row['consultation_id'],
        'serviceRequestId' => $row['service_request_id'],
        'category' => $row['category'],
        'reference' => $row['reference_code'],
        'amount' => (float) $row['amount'],
        'currency' => $row['currency'],
        'status' => $row['status'],
        'receiptUrl' => $row['receipt_url'],
        'createdAt' => $row['created_at'],
    ];
}

function map_message_thread_row(array $row): array
{
    return [
        'id' => $row['id'],
        'userId' => $row['user_id'],
        'subject' => $row['subject'],
        'channel' => $row['channel'] ?? 'secure-portal',
        'unreadCount' => (int) $row['unread_count'],
        'lastMessageAt' => $row['last_message_at'],
        'createdAt' => $row['created_at'],
    ];
}

function map_message_row(array $row): array
{
    return [
        'id' => $row['id'],
        'threadId' => $row['thread_id'],
        'sender' => $row['sender_role'] === 'agency' ? 'agency' : 'client',
        'senderName' => $row['sender_name'] ?? null,
        'senderRole' => $row['sender_role'] === 'agency' ? 'agency' : 'client',
        'body' => $row['body'],
        'attachmentName' => $row['attachment_name'],
        'attachmentUrl' => $row['attachment_url'],
        'readAt' => $row['read_at'],
        'createdAt' => $row['created_at'],
    ];
}

function map_notification_row(array $row): array
{
    return [
        'id' => $row['id'],
        'userId' => $row['user_id'],
        'type' => $row['type'],
        'title' => $row['title'],
        'body' => $row['body'],
        'actionPath' => $row['action_path'],
        'read' => (bool) $row['is_read'],
        'createdAt' => $row['created_at'],
    ];
}

function map_lead_meta_row(array $row): array
{
    return [
        'leadId' => $row['lead_id'],
        'source' => $row['source'],
        'serviceType' => $row['service_type'],
        'destination' => $row['destination'],
        'assignedStaffId' => $row['assigned_staff_user_id'],
        'priority' => $row['priority'],
        'status' => $row['status'],
        'internalNotes' => $row['internal_notes'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_application_meta_row(array $row): array
{
    return [
        'applicationId' => $row['application_id'],
        'serviceType' => $row['application_type'],
        'assignedStaffId' => $row['assigned_staff_user_id'],
        'currentStage' => $row['stage'],
        'internalNotes' => $row['internal_notes'],
        'clientUpdates' => decode_json_array($row['client_updates_json'] ?? null),
        'linkedChecklist' => decode_json_array($row['linked_checklist_json'] ?? null),
        'updatedAt' => $row['updated_at'],
    ];
}

function map_consultation_meta_row(array $row): array
{
    return [
        'consultationId' => $row['consultation_id'],
        'assignedStaffId' => $row['assigned_staff_user_id'],
        'adminNotes' => $row['internal_notes'],
        'clientVisibleNote' => $row['client_note'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_service_request_meta_row(array $row): array
{
    return [
        'requestId' => $row['request_id'],
        'assignedStaffId' => $row['assigned_staff_user_id'],
        'internalNotes' => $row['internal_notes'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_admin_user_row(array $row): array
{
    return [
        'id' => $row['id'],
        'linkedUserId' => $row['linked_user_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'role' => $row['role'],
        'active' => (bool) $row['is_active'],
        'isChatAgent' => isset($row['is_chat_agent']) ? (bool) $row['is_chat_agent'] : false,
        'mustChangePassword' => isset($row['must_change_password']) ? (bool) $row['must_change_password'] : false,
        'lastPasswordResetAt' => $row['updated_at'],
        'createdAt' => $row['created_at'],
    ];
}

function map_admin_alert_row(array $row): array
{
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'body' => $row['body'],
        'actionPath' => $row['action_path'],
        'read' => (bool) $row['is_read'],
        'createdAt' => $row['created_at'],
    ];
}

function map_content_block_row(array $row): array
{
    return [
        'id' => $row['id'],
        'key' => $row['block_key'],
        'title' => $row['title'],
        'sectionKey' => $row['section_key'],
        'description' => $row['description'],
        'content' => $row['body'],
        'icon' => $row['icon'],
        'displayOrder' => (int) ($row['display_order'] ?? 0),
        'visible' => isset($row['is_visible']) ? (bool) $row['is_visible'] : true,
        'placement' => $row['placement'],
        'ctaLabel' => $row['cta_label'],
        'ctaHref' => $row['cta_href'],
        'published' => (bool) $row['published'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_service_pricing_row(array $row): array
{
    return [
        'id' => $row['id'],
        'name' => $row['name'],
        'description' => $row['description'],
        'price' => (float) $row['price'],
        'currency' => $row['currency'],
        'category' => $row['category'],
        'visible' => isset($row['is_visible']) ? (bool) $row['is_visible'] : true,
        'displayOrder' => (int) ($row['display_order'] ?? 0),
        'createdAt' => $row['created_at'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_tour_package_row(array $row): array
{
    return [
        'id' => $row['id'],
        'title' => $row['title'],
        'destination' => $row['destination'],
        'duration' => $row['duration'],
        'description' => $row['description'] ?? '',
        'startingPrice' => $row['starting_price'] ?? '',
        'currency' => $row['currency'] ?? 'GHS',
        'travelPeriod' => $row['travel_period'] ?? '',
        'travelDates' => $row['travel_dates'] ?? '',
        'itinerarySummary' => $row['itinerary_summary'] ?? '',
        'inclusions' => $row['inclusions'] ?? '',
        'exclusions' => $row['exclusions'] ?? '',
        'imageGallery' => decode_json_array($row['image_gallery'] ?? null),
        'featured' => (bool) $row['featured'],
        'visible' => isset($row['visible']) ? (bool) $row['visible'] : true,
        'imageUrl' => $row['image_url'],
        'status' => $row['status'],
        'updatedAt' => $row['updated_at'],
    ];
}

function map_chat_thread_row(array $row): array
{
    return [
        'id' => $row['id'],
        'userId' => $row['user_id'],
        'visitorName' => $row['visitor_name'],
        'visitorEmail' => $row['visitor_email'],
        'visitorPhone' => $row['visitor_phone'],
        'subject' => $row['subject'],
        'channel' => $row['channel'] ?? 'tawk',
        'assignedStaffId' => $row['assigned_staff_id'],
        'unreadCount' => (int) ($row['unread_count'] ?? 0),
        'status' => $row['status'] ?? 'open',
        'lastMessageAt' => $row['last_message_at'],
        'createdAt' => $row['created_at'],
    ];
}

function map_chat_message_row(array $row): array
{
    return [
        'id' => $row['id'],
        'threadId' => $row['thread_id'],
        'senderRole' => $row['sender_role'],
        'senderName' => $row['sender_name'],
        'body' => $row['body'],
        'createdAt' => $row['created_at'],
    ];
}

switch ($action) {
    case 'auth.session':
        $user = current_user();
        respond(['user' => $user ? map_user($user) : null]);

    case 'auth.signup':
        $config = require __DIR__ . '/config.php';
        rate_limit('auth_signup_' . ($_SERVER['REMOTE_ADDR'] ?? 'local'), (int) ($config['auth_rate_limit_attempts'] ?? 6), (int) ($config['auth_rate_limit_window_seconds'] ?? 300));
        $fullName = require_string($body, 'fullName', 2, 100);
        $email = require_email($body);
        $phone = trim((string) ($body['phone'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if (strlen($password) < 8) {
            respond(['error' => 'Password must be at least 8 characters.'], 422);
        }

        $check = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            respond(['error' => 'An account with that email already exists.'], 409);
        }

        $id = 'user-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $stmt = $pdo->prepare('INSERT INTO users (id, email, full_name, phone, role, admin_role, password_hash, must_change_password, password_updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([$id, $email, $fullName, $phone ?: null, 'client', null, password_hash($password, PASSWORD_BCRYPT), 0, $createdAt, $createdAt]);
        $profile = $pdo->prepare('INSERT INTO client_profiles (user_id, full_name, email, phone, preferred_contact_method, comm_email, comm_whatsapp, comm_sms, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $profile->execute([$id, $fullName, $email, $phone ?: null, 'whatsapp', 1, 1, 0, $createdAt]);
        $threadId = 'thread-' . bin2hex(random_bytes(8));
        $thread = $pdo->prepare('INSERT INTO message_threads (id, user_id, subject, channel, unread_count, last_message_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $thread->execute([$threadId, $id, 'Welcome to your GenieHub dashboard', 'secure-portal', 1, $createdAt, $createdAt]);
        $message = $pdo->prepare('INSERT INTO messages (id, thread_id, sender_role, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $message->execute([
            'msg-' . bin2hex(random_bytes(8)),
            $threadId,
            'agency',
            'GenieHub Team',
            'Welcome to GenieHub. Use this secure workspace to upload documents, track progress, and message our team.',
            $createdAt,
        ]);
        $checklist = $pdo->prepare('INSERT INTO checklist_items (id, user_id, title, description, status, action_label, action_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $checklist->execute([
            'todo-' . bin2hex(random_bytes(8)),
            $id,
            'Complete your profile',
            'Add your nationality, passport number, and preferred contact method.',
            'pending',
            'Update profile',
            '/dashboard/profile',
            $createdAt,
        ]);
        $notification = $pdo->prepare('INSERT INTO notifications (id, user_id, type, title, body, action_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        $notification->execute([
            'note-' . bin2hex(random_bytes(8)),
            $id,
            'application',
            'Your dashboard is ready',
            'Welcome to GenieHub. Complete your profile and book a consultation to get started.',
            '/dashboard',
            0,
            $createdAt,
        ]);
        $_SESSION['user_id'] = $id;
        clear_rate_limit('auth_signup_' . ($_SERVER['REMOTE_ADDR'] ?? 'local'));

        respond(['user' => [
            'id' => $id,
            'email' => $email,
            'fullName' => $fullName,
            'phone' => $phone ?: null,
            'role' => 'client',
            'createdAt' => $createdAt,
        ]], 201);

    case 'auth.login':
        $config = require __DIR__ . '/config.php';
        $email = require_email($body);
        $password = (string) ($body['password'] ?? '');
        rate_limit('auth_login_' . sha1($email . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'local')), (int) ($config['auth_rate_limit_attempts'] ?? 6), (int) ($config['auth_rate_limit_window_seconds'] ?? 300));

        $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            respond(['error' => 'Incorrect email or password.'], 401);
        }

        $_SESSION['user_id'] = $user['id'];
        clear_rate_limit('auth_login_' . sha1($email . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'local')));
        respond(['user' => map_user($user)]);

    case 'auth.logout':
        session_destroy();
        respond(['ok' => true]);

    case 'auth.password.update':
        $user = require_user();
        $newPassword = (string) ($body['newPassword'] ?? '');
        if (strlen($newPassword) < 8) {
            respond(['error' => 'Password must be at least 8 characters.'], 422);
        }
        $updatedAt = gmdate('c');
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, must_change_password = 0, password_updated_at = ? WHERE id = ?');
        $stmt->execute([password_hash($newPassword, PASSWORD_BCRYPT), $updatedAt, $user['id']]);
        if (($user['role'] ?? 'client') === 'admin') {
            $metaStmt = $pdo->prepare('UPDATE admin_users SET updated_at = ? WHERE linked_user_id = ? OR id = ?');
            $metaStmt->execute([$updatedAt, $user['id'], $user['id']]);
        }
        respond(['ok' => true]);

    case 'auth.password.request':
        $config = require __DIR__ . '/config.php';
        $email = require_email($body);
        rate_limit('password_request_' . sha1($email . '|' . ($_SERVER['REMOTE_ADDR'] ?? 'local')), (int) ($config['auth_rate_limit_attempts'] ?? 6), (int) ($config['auth_rate_limit_window_seconds'] ?? 300));
        $user = fetch_one($pdo, 'SELECT * FROM users WHERE email = ? LIMIT 1', [$email]);
        $response = ['ok' => true, 'message' => 'If that account exists, a secure recovery link is now ready.'];
        if ($user) {
            $token = create_password_reset_token($pdo, $user['id']);
            $response['resetUrl'] = sprintf('%s://%s/recover-password?token=%s', isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https' : 'http', $_SERVER['HTTP_HOST'] ?? '127.0.0.1:8080', $token);
        }
        respond($response);

    case 'auth.password.recover':
        $token = require_string($body, 'token', 20, 255);
        $newPassword = (string) ($body['newPassword'] ?? '');
        if (strlen($newPassword) < 8) {
            respond(['error' => 'Password must be at least 8 characters.'], 422);
        }

        $tokenRecord = consume_password_reset_token($pdo, $token);
        if (!$tokenRecord) {
            respond(['error' => 'This recovery link is no longer valid.'], 422);
        }

        $updatedAt = gmdate('c');
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, must_change_password = 0, password_updated_at = ? WHERE id = ?');
        $stmt->execute([password_hash($newPassword, PASSWORD_BCRYPT), $updatedAt, $tokenRecord['user_id']]);
        $markUsed = $pdo->prepare('UPDATE password_reset_tokens SET used_at = ? WHERE id = ?');
        $markUsed->execute([$updatedAt, $tokenRecord['id']]);
        $metaStmt = $pdo->prepare('UPDATE admin_users SET updated_at = ? WHERE linked_user_id = ? OR id = ?');
        $metaStmt->execute([$updatedAt, $tokenRecord['user_id'], $tokenRecord['user_id']]);
        respond(['ok' => true]);

    case 'settings.get':
        $stmt = $pdo->query("SELECT * FROM app_settings WHERE id = 'default' LIMIT 1");
        $settings = $stmt->fetch();
        respond(['settings' => $settings ? map_settings($settings) : null]);

    case 'content-blocks.list':
        $rows = fetch_rows($pdo, 'SELECT * FROM content_blocks WHERE published = 1 ORDER BY display_order ASC, updated_at DESC');
        respond(['contentBlocks' => array_map('map_content_block_row', $rows)]);

    case 'service-pricing.list':
        $rows = fetch_rows($pdo, 'SELECT * FROM service_pricing WHERE is_visible = 1 ORDER BY display_order ASC, updated_at DESC');
        respond(['services' => array_map('map_service_pricing_row', $rows)]);

    case 'tour-packages.list':
        $rows = fetch_rows($pdo, "SELECT * FROM tour_packages WHERE status = 'published' AND visible = 1 ORDER BY featured DESC, updated_at DESC");
        respond(['tours' => array_map('map_tour_package_row', $rows)]);

    case 'visa-services.list':
        $rows = fetch_rows($pdo, "SELECT * FROM visa_services WHERE status = 'published' ORDER BY updated_at DESC");
        respond(['services' => array_map(static fn(array $row): array => [
            'id' => $row['id'],
            'country' => $row['country'],
            'title' => $row['title'],
            'requirements' => $row['requirements'],
            'checklistContent' => $row['checklist_copy'] ?? '',
            'pricingNote' => $row['pricing_note'],
            'seoTitle' => $row['seo_title'],
            'seoDescription' => $row['seo_description'],
            'ctaEnabled' => (bool) $row['cta_visible'],
            'status' => $row['status'],
            'updatedAt' => $row['updated_at'],
        ], $rows)]);

    case 'study-abroad.list':
        $rows = fetch_rows($pdo, "SELECT * FROM study_abroad_records WHERE status = 'published' ORDER BY updated_at DESC");
        respond(['records' => array_map(static fn(array $row): array => [
            'id' => $row['id'],
            'country' => $row['country'],
            'title' => $row['title'],
            'programmes' => $row['programme_information'] ?? '',
            'intakeInfo' => $row['intake_information'] ?? '',
            'content' => $row['summary'],
            'ctaBanner' => $row['cta_text'],
            'status' => $row['status'],
            'updatedAt' => $row['updated_at'],
        ], $rows)]);

    case 'settings.save':
        $actor = require_super_admin();
        $settings = [
            'id' => 'default',
            'brandName' => require_string($body, 'brandName', 2, 100),
            'tagline' => require_string($body, 'tagline', 10, 300),
            'supportEmail' => require_email($body, 'supportEmail'),
            'phone' => require_string($body, 'phone', 7, 50),
            'officeAddress' => require_string($body, 'officeAddress', 5, 255),
            'workingHours' => require_string($body, 'workingHours', 5, 255),
            'whatsappNumber' => require_string($body, 'whatsappNumber', 7, 50),
            'instagramUrl' => optional_string($body, 'instagramUrl', 255) ?? '',
            'facebookUrl' => optional_string($body, 'facebookUrl', 255) ?? '',
            'twitterUrl' => optional_string($body, 'twitterUrl', 255) ?? '',
            'snapchatUrl' => optional_string($body, 'snapchatUrl', 255) ?? '',
            'linkedinUrl' => optional_string($body, 'linkedinUrl', 255) ?? '',
            'tiktokUrl' => optional_string($body, 'tiktokUrl', 255) ?? '',
            'defaultCurrency' => optional_string($body, 'defaultCurrency', 10) ?? 'GHS',
            'autoAssignChat' => bool_value($body['autoAssignChat'] ?? true),
            'tawkPropertyId' => optional_string($body, 'tawkPropertyId', 120) ?? '',
            'tawkWidgetId' => optional_string($body, 'tawkWidgetId', 120) ?? '',
            'heroTitle' => require_string($body, 'heroTitle', 10, 255),
            'heroSubtitle' => require_string($body, 'heroSubtitle', 20, 500),
        ];
        $stmt = $pdo->prepare(
            'UPDATE app_settings SET brand_name = ?, tagline = ?, support_email = ?, phone = ?, office_address = ?, working_hours = ?, whatsapp_number = ?, instagram_url = ?, facebook_url = ?, twitter_url = ?, snapchat_url = ?, linkedin_url = ?, tiktok_url = ?, default_currency = ?, auto_assign_chat = ?, tawk_property_id = ?, tawk_widget_id = ?, hero_title = ?, hero_subtitle = ? WHERE id = ?'
        );
        $stmt->execute([
            $settings['brandName'],
            $settings['tagline'],
            $settings['supportEmail'],
            $settings['phone'],
            $settings['officeAddress'],
            $settings['workingHours'],
            $settings['whatsappNumber'],
            $settings['instagramUrl'],
            $settings['facebookUrl'],
            $settings['twitterUrl'],
            $settings['snapchatUrl'],
            $settings['linkedinUrl'],
            $settings['tiktokUrl'],
            $settings['defaultCurrency'],
            $settings['autoAssignChat'] ? 1 : 0,
            $settings['tawkPropertyId'],
            $settings['tawkWidgetId'],
            $settings['heroTitle'],
            $settings['heroSubtitle'],
            'default',
        ]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'super-admin'), 'settings.save', 'settings', 'default', 'Updated shared application settings.');
        respond(['settings' => $settings]);

    case 'blog.list':
        $rows = fetch_rows($pdo, 'SELECT * FROM blog_posts WHERE published = 1 ORDER BY published_at DESC');
        respond(['posts' => array_map('map_blog_post', $rows)]);

    case 'testimonials.list':
        $rows = fetch_rows($pdo, "SELECT * FROM testimonials WHERE approval_status = 'approved' ORDER BY sort_order ASC, updated_at DESC");
        respond(['testimonials' => array_map(static fn(array $row): array => [
            'id' => $row['id'],
            'name' => $row['client_name'],
            'quote' => $row['quote_text'],
            'category' => str_replace('-', ' ', $row['category']),
            'featured' => (bool) $row['featured'],
            'displayOrder' => (int) $row['sort_order'],
            'status' => $row['approval_status'],
            'imageUrl' => $row['image_url'],
            'updatedAt' => $row['updated_at'],
        ], $rows)]);

    case 'faq.list':
        $rows = fetch_rows($pdo, 'SELECT * FROM faq_items WHERE published = 1 ORDER BY sort_order ASC, updated_at DESC');
        respond(['faqs' => array_map(static fn(array $row): array => [
            'id' => $row['id'],
            'question' => $row['question'],
            'answer' => $row['answer'],
            'category' => str_replace('-', ' ', $row['category']),
            'displayOrder' => (int) $row['sort_order'],
            'published' => (bool) $row['published'],
            'updatedAt' => $row['updated_at'],
        ], $rows)]);

    case 'blog.save':
        $actor = require_admin_roles(['super-admin', 'content-manager']);
        $post = [
            'id' => require_string($body, 'id', 3, 64),
            'title' => require_string($body, 'title', 3, 255),
            'slug' => require_string($body, 'slug', 3, 100),
            'category' => require_string($body, 'category', 2, 100),
            'excerpt' => require_string($body, 'excerpt', 10, 400),
            'content' => require_string($body, 'content', 20, 5000),
            'author' => require_string($body, 'author', 2, 255),
            'imageUrl' => optional_string($body, 'imageUrl', 255),
            'published' => !empty($body['published']),
            'publishedAt' => require_string($body, 'publishedAt', 8, 40),
        ];
        $stmt = $pdo->prepare(
            'INSERT INTO blog_posts (id, title, slug, category, excerpt, content, author, image_url, published, published_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), slug = VALUES(slug), category = VALUES(category), excerpt = VALUES(excerpt), content = VALUES(content), author = VALUES(author), image_url = VALUES(image_url), published = VALUES(published), published_at = VALUES(published_at)'
        );
        $stmt->execute([
            $post['id'],
            $post['title'],
            $post['slug'],
            $post['category'],
            $post['excerpt'],
            $post['content'],
            $post['author'],
            $post['imageUrl'],
            $post['published'] ? 1 : 0,
            $post['publishedAt'],
        ]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'content-manager'), 'blog.save', 'blog_post', $post['id'], 'Saved a blog post.');
        respond(['post' => $post]);

    case 'blog.delete':
        $actor = require_admin_roles(['super-admin', 'content-manager']);
        $postId = require_string($body, 'postId', 3, 64);
        $stmt = $pdo->prepare('DELETE FROM blog_posts WHERE id = ?');
        $stmt->execute([$postId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'content-manager'), 'blog.delete', 'blog_post', $postId, 'Deleted a blog post.');
        respond(['ok' => true]);

    case 'consultation.create':
        $id = 'consult-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $status = 'pending';
        $stmt = $pdo->prepare(
            'INSERT INTO consultation_bookings (id, user_id, name, email, phone, service, booking_date, booking_time, meeting_type, notes, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $body['userId'] ?? null,
            require_string($body, 'name', 2, 100),
            require_email($body),
            require_string($body, 'phone', 7, 30),
            require_string($body, 'service', 2, 255),
            require_string($body, 'date', 8, 40),
            require_string($body, 'time', 2, 40),
            require_string($body, 'meetingType', 2, 50),
            trim((string) ($body['notes'] ?? '')) ?: null,
            $status,
            $createdAt,
        ]);
        if (!empty($body['userId'])) {
            $checklist = $pdo->prepare('INSERT INTO checklist_items (id, user_id, application_id, title, description, status, action_label, action_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $checklist->execute([
                'todo-' . bin2hex(random_bytes(8)),
                $body['userId'],
                $id,
                'Prepare for your consultation',
                'Gather your questions and key documents before the session.',
                'pending',
                'View consultations',
                '/dashboard/consultations',
                $createdAt,
            ]);
            $payment = $pdo->prepare('INSERT INTO payments (id, user_id, consultation_id, category, reference_code, amount, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $payment->execute([
                'pay-' . bin2hex(random_bytes(8)),
                $body['userId'],
                $id,
                'consultation-fee',
                'CONS-' . strtoupper(substr($id, -6)),
                150.00,
                'GHS',
                'pending',
                $createdAt,
            ]);
        }
        $lead = $pdo->prepare(
            'INSERT INTO contact_leads (id, user_id, name, email, phone, subject, message, category, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $lead->execute([
            'lead-' . bin2hex(random_bytes(8)),
            $body['userId'] ?? null,
            require_string($body, 'name', 2, 100),
            require_email($body),
            require_string($body, 'phone', 7, 30),
            'Consultation: ' . require_string($body, 'service', 2, 255),
            trim((string) ($body['notes'] ?? '')) ?: require_string($body, 'meetingType', 2, 50),
            'consultation',
            $status,
            $createdAt,
        ]);
        respond(['record' => [
            'id' => $id,
            'userId' => $body['userId'] ?? null,
            'name' => require_string($body, 'name', 2, 100),
            'email' => require_email($body),
            'phone' => require_string($body, 'phone', 7, 30),
            'service' => require_string($body, 'service', 2, 255),
            'date' => require_string($body, 'date', 8, 40),
            'time' => require_string($body, 'time', 2, 40),
            'meetingType' => require_string($body, 'meetingType', 2, 50),
            'notes' => trim((string) ($body['notes'] ?? '')) ?: null,
            'status' => $status,
            'createdAt' => $createdAt,
            'updatedAt' => $createdAt,
        ]]);

    case 'contact.create':
        $id = 'lead-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $status = 'new';
        $stmt = $pdo->prepare(
            'INSERT INTO contact_leads (id, user_id, name, email, phone, subject, message, category, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $body['userId'] ?? null,
            require_string($body, 'name', 2, 100),
            require_email($body),
            trim((string) ($body['phone'] ?? '')) ?: null,
            require_string($body, 'subject', 3, 200),
            require_string($body, 'message', 10, 2000),
            'contact',
            $status,
            $createdAt,
        ]);
        respond(['record' => [
            'id' => $id,
            'userId' => $body['userId'] ?? null,
            'name' => require_string($body, 'name', 2, 100),
            'email' => require_email($body),
            'phone' => require_string($body, 'phone', 7, 30),
            'destination' => require_string($body, 'destination', 2, 255),
            'departure' => require_string($body, 'departure', 8, 40),
            'returnDate' => require_string($body, 'returnDate', 8, 40),
            'passengers' => require_string($body, 'passengers', 1, 20),
            'budget' => trim((string) ($body['budget'] ?? '')) ?: null,
            'notes' => trim((string) ($body['notes'] ?? '')) ?: null,
            'status' => $status,
            'createdAt' => $createdAt,
            'updatedAt' => $createdAt,
        ]]);

    case 'tour.create':
        $id = 'tour-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $status = 'submitted';
        $stmt = $pdo->prepare(
            'INSERT INTO tour_enquiries (id, user_id, name, email, phone, destination, departure, return_date, passengers, budget, notes, status, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $body['userId'] ?? null,
            require_string($body, 'name', 2, 100),
            require_email($body),
            require_string($body, 'phone', 7, 30),
            require_string($body, 'destination', 2, 255),
            require_string($body, 'departure', 8, 40),
            require_string($body, 'returnDate', 8, 40),
            require_string($body, 'passengers', 1, 20),
            trim((string) ($body['budget'] ?? '')) ?: null,
            trim((string) ($body['notes'] ?? '')) ?: null,
            $status,
            $createdAt,
        ]);
        if (!empty($body['userId'])) {
            $notification = $pdo->prepare('INSERT INTO notifications (id, user_id, type, title, body, action_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $notification->execute([
                'note-' . bin2hex(random_bytes(8)),
                $body['userId'],
                'application',
                'Travel request received',
                'Your travel request is now in review.',
                '/dashboard/applications',
                0,
                $createdAt,
            ]);
        }
        respond(['record' => ['id' => $id, 'status' => $status, 'createdAt' => $createdAt]]);

    case 'visa.create':
        $id = 'visa-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $status = 'documents-pending';
        $timelineStep = 'Documents requested';
        $stmt = $pdo->prepare(
            'INSERT INTO visa_applications (id, user_id, full_name, email, phone, visa_type, destination_country, purpose, travel_date, notes, status, timeline_step, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            require_string($body, 'userId', 3, 64),
            require_string($body, 'fullName', 2, 100),
            require_email($body),
            require_string($body, 'phone', 7, 30),
            require_string($body, 'visaType', 2, 100),
            require_string($body, 'destinationCountry', 2, 100),
            require_string($body, 'purpose', 20, 5000),
            require_string($body, 'travelDate', 8, 40),
            trim((string) ($body['notes'] ?? '')) ?: null,
            $status,
            $timelineStep,
            $createdAt,
            $createdAt,
        ]);
        $checklist = $pdo->prepare('INSERT INTO checklist_items (id, user_id, application_id, title, description, status, action_label, action_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $checklist->execute([
            'todo-' . bin2hex(random_bytes(8)),
            $body['userId'],
            $id,
            'Upload your passport',
            'Upload the bio-data page of your passport so the team can begin review.',
            'pending',
            'Upload document',
            '/dashboard/documents',
            $createdAt,
        ]);
        $payment = $pdo->prepare('INSERT INTO payments (id, user_id, application_id, category, reference_code, amount, currency, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $payment->execute([
            'pay-' . bin2hex(random_bytes(8)),
            $body['userId'],
            $id,
            'application-fee',
            'APP-' . strtoupper(substr($id, -6)),
            500.00,
            'GHS',
            'pending',
            $createdAt,
        ]);
        respond(['record' => [
            'id' => $id,
            'userId' => require_string($body, 'userId', 3, 64),
            'fullName' => require_string($body, 'fullName', 2, 100),
            'email' => require_email($body),
            'phone' => require_string($body, 'phone', 7, 30),
            'visaType' => require_string($body, 'visaType', 2, 100),
            'destinationCountry' => require_string($body, 'destinationCountry', 2, 100),
            'purpose' => require_string($body, 'purpose', 20, 5000),
            'travelDate' => require_string($body, 'travelDate', 8, 40),
            'notes' => trim((string) ($body['notes'] ?? '')) ?: null,
            'status' => $status,
            'timelineStep' => $timelineStep,
            'createdAt' => $createdAt,
            'updatedAt' => $createdAt,
        ]]);

    case 'document.upload':
        $user = require_user();
        if (!isset($_FILES['file'])) {
            respond(['error' => 'No file uploaded.'], 422);
        }

        $applicationId = trim((string) ($_POST['applicationId'] ?? ''));
        if ($applicationId === '') {
            $applicationId = null;
        }

        $config = require __DIR__ . '/config.php';
        if (!is_dir($config['uploads_dir'])) {
            mkdir($config['uploads_dir'], 0777, true);
        }

        $file = $_FILES['file'];
        validate_upload($file);
        $safeName = time() . '-' . preg_replace('/[^A-Za-z0-9._-]/', '-', $file['name']);
        $target = $config['uploads_dir'] . DIRECTORY_SEPARATOR . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            respond(['error' => 'The uploaded file could not be stored.'], 500);
        }

        $id = 'doc-' . bin2hex(random_bytes(8));
        $uploadedAt = gmdate('c');
        $stmt = $pdo->prepare(
            'INSERT INTO documents (id, user_id, application_id, file_name, file_type, mime_type, file_size, file_url, file_path, original_filename, category, status, client_notes, admin_notes, uploaded_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $id,
            $user['id'],
            $applicationId,
            $file['name'],
            $file['type'] ?: 'application/octet-stream',
            $file['type'] ?: 'application/octet-stream',
            (int) $file['size'],
            uploads_public_path($safeName),
            $safeName,
            $file['name'],
            $_POST['category'] ?: 'other',
            'pending-review',
            trim((string) ($_POST['clientNotes'] ?? '')) ?: null,
            null,
            $uploadedAt,
        ]);
        respond(['record' => [
            'id' => $id,
            'userId' => $user['id'],
            'applicationId' => $applicationId,
            'fileName' => $file['name'],
            'fileType' => $file['type'] ?: 'application/octet-stream',
            'mimeType' => $file['type'] ?: 'application/octet-stream',
            'fileSize' => (int) $file['size'],
            'fileUrl' => uploads_public_path($safeName),
            'filePath' => $safeName,
            'originalFileName' => $file['name'],
            'category' => $_POST['category'] ?: 'other',
            'status' => 'pending-review',
            'clientNotes' => trim((string) ($_POST['clientNotes'] ?? '')) ?: null,
            'adminNotes' => null,
            'uploadedAt' => $uploadedAt,
        ]]);

    case 'admin.media.upload':
        require_admin_roles(['super-admin', 'admin', 'content-manager', 'operations-staff']);
        if (!isset($_FILES['file'])) {
            respond(['error' => 'No file uploaded.'], 422);
        }

        $config = require __DIR__ . '/config.php';
        if (!is_dir($config['uploads_dir'])) {
            mkdir($config['uploads_dir'], 0777, true);
        }

        $file = $_FILES['file'];
        validate_upload($file);
        $mimeType = (string) ($file['type'] ?: 'application/octet-stream');
        if (strpos($mimeType, 'image/') !== 0) {
            respond(['error' => 'Only image uploads are allowed for package media.'], 422);
        }

        $safeName = 'media-' . time() . '-' . preg_replace('/[^A-Za-z0-9._-]/', '-', $file['name']);
        $target = $config['uploads_dir'] . DIRECTORY_SEPARATOR . $safeName;
        if (!move_uploaded_file($file['tmp_name'], $target)) {
            respond(['error' => 'The uploaded image could not be stored.'], 500);
        }

        respond(['asset' => [
            'fileName' => $file['name'],
            'mimeType' => $mimeType,
            'fileSize' => (int) $file['size'],
            'fileUrl' => uploads_public_path($safeName),
            'filePath' => $safeName,
        ]]);

    case 'client.workspace':
        $user = require_user();

        $profileStmt = $pdo->prepare('SELECT * FROM client_profiles WHERE user_id = ? LIMIT 1');
        $profileStmt->execute([$user['id']]);
        $profile = $profileStmt->fetch();
        if (!$profile) {
            $profile = [
                'user_id' => $user['id'],
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'date_of_birth' => null,
                'nationality' => null,
                'passport_number' => null,
                'preferred_contact_method' => 'whatsapp',
                'profile_photo_url' => null,
                'comm_email' => 1,
                'comm_whatsapp' => 1,
                'comm_sms' => 0,
                'updated_at' => $user['created_at'],
            ];
        }

        $consultations = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, service, booking_date AS date, booking_time AS time, meeting_type AS meetingType, notes, status, created_at AS createdAt, created_at AS updatedAt FROM consultation_bookings WHERE user_id = ? ORDER BY created_at DESC');
        $consultations->execute([$user['id']]);

        $visaApplications = $pdo->prepare('SELECT id, user_id AS userId, full_name AS fullName, email, phone, visa_type AS visaType, destination_country AS destinationCountry, purpose, travel_date AS travelDate, notes, status, timeline_step AS timelineStep, created_at AS createdAt, updated_at AS updatedAt FROM visa_applications WHERE user_id = ? ORDER BY created_at DESC');
        $visaApplications->execute([$user['id']]);

        $tourEnquiries = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, destination, departure, return_date AS returnDate, passengers, budget, notes, status, created_at AS createdAt, created_at AS updatedAt FROM tour_enquiries WHERE user_id = ? ORDER BY created_at DESC');
        $tourEnquiries->execute([$user['id']]);

        $documents = $pdo->prepare('SELECT id, user_id AS userId, application_id AS applicationId, file_name AS fileName, file_type AS fileType, file_size AS fileSize, file_url AS fileUrl, category, status, client_notes AS clientNotes, admin_notes AS adminNotes, uploaded_at AS uploadedAt FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC');
        $documents->execute([$user['id']]);

        $requests = $pdo->prepare('SELECT id, user_id AS userId, request_type AS requestType, destination, travel_date AS travelDate, budget, travellers, urgency, notes, status, created_at AS createdAt, updated_at AS updatedAt FROM service_requests WHERE user_id = ? ORDER BY created_at DESC');
        $requests->execute([$user['id']]);

        $payments = $pdo->prepare('SELECT id, user_id AS userId, application_id AS applicationId, consultation_id AS consultationId, service_request_id AS serviceRequestId, category, reference_code AS reference, amount, currency, status, receipt_url AS receiptUrl, created_at AS createdAt FROM payments WHERE user_id = ? ORDER BY created_at DESC');
        $payments->execute([$user['id']]);

        $checklist = $pdo->prepare('SELECT id, user_id AS userId, application_id AS applicationId, title, description, status, due_date AS dueDate, action_label AS actionLabel, action_path AS actionPath, created_at AS createdAt FROM checklist_items WHERE user_id = ? ORDER BY created_at DESC');
        $checklist->execute([$user['id']]);

        $threads = $pdo->prepare('SELECT id, user_id AS userId, subject, channel, unread_count AS unreadCount, last_message_at AS lastMessageAt, created_at AS createdAt FROM message_threads WHERE user_id = ? ORDER BY last_message_at DESC');
        $threads->execute([$user['id']]);

        $messages = $pdo->prepare('SELECT m.id, m.thread_id AS threadId, m.sender_role AS sender, m.body, m.attachment_name AS attachmentName, m.attachment_url AS attachmentUrl, m.read_at AS readAt, m.created_at AS createdAt FROM messages m INNER JOIN message_threads t ON t.id = m.thread_id WHERE t.user_id = ? ORDER BY m.created_at DESC');
        $messages->execute([$user['id']]);

        $notifications = $pdo->prepare('SELECT id, user_id AS userId, type, title, body, action_path AS actionPath, is_read AS isRead, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC');
        $notifications->execute([$user['id']]);

        respond([
            'workspace' => [
                'profile' => $profile ? map_profile($profile) : null,
                'applications' => [],
                'consultations' => $consultations->fetchAll(),
                'visaApplications' => $visaApplications->fetchAll(),
                'tourEnquiries' => $tourEnquiries->fetchAll(),
                'documents' => $documents->fetchAll(),
                'serviceRequests' => $requests->fetchAll(),
                'payments' => $payments->fetchAll(),
                'checklistItems' => $checklist->fetchAll(),
                'messageThreads' => $threads->fetchAll(),
                'messages' => $messages->fetchAll(),
                'notifications' => array_map(static function (array $row): array {
                    $row['read'] = (bool) ($row['isRead'] ?? false);
                    unset($row['isRead']);
                    return $row;
                }, $notifications->fetchAll()),
            ],
        ]);

    case 'document.delete':
        $user = require_user();
        $config = require __DIR__ . '/config.php';
        $documentId = require_string($body, 'documentId', 3, 64);
        $stmt = $pdo->prepare('SELECT * FROM documents WHERE id = ? LIMIT 1');
        $stmt->execute([$documentId]);
        $document = $stmt->fetch();

        if (!$document) {
            respond(['error' => 'Document not found.'], 404);
        }

        if (($user['role'] ?? 'client') !== 'admin' && $document['user_id'] !== $user['id']) {
            respond(['error' => 'You cannot delete this document.'], 403);
        }

        $filePath = basename((string) $document['file_url']);
        $absolutePath = $config['uploads_dir'] . DIRECTORY_SEPARATOR . $filePath;
        if (is_file($absolutePath)) {
            unlink($absolutePath);
        }

        $delete = $pdo->prepare('DELETE FROM documents WHERE id = ?');
        $delete->execute([$documentId]);
        respond(['ok' => true]);

    case 'client.service-request.create':
        $user = require_user();
        $id = 'request-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $stmt = $pdo->prepare('INSERT INTO service_requests (id, user_id, request_type, destination, travel_date, budget, travellers, urgency, notes, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $stmt->execute([
            $id,
            $user['id'],
            require_string($body, 'requestType', 3, 80),
            trim((string) ($body['destination'] ?? '')) ?: null,
            trim((string) ($body['travelDate'] ?? '')) ?: null,
            trim((string) ($body['budget'] ?? '')) ?: null,
            trim((string) ($body['travellers'] ?? '')) ?: null,
            trim((string) ($body['urgency'] ?? '')) ?: 'standard',
            trim((string) ($body['notes'] ?? '')) ?: null,
            'received',
            $createdAt,
            $createdAt,
        ]);
        respond(['record' => [
            'id' => $id,
            'userId' => $user['id'],
            'requestType' => $body['requestType'],
            'destination' => trim((string) ($body['destination'] ?? '')) ?: null,
            'travelDate' => trim((string) ($body['travelDate'] ?? '')) ?: null,
            'budget' => trim((string) ($body['budget'] ?? '')) ?: null,
            'travellers' => trim((string) ($body['travellers'] ?? '')) ?: null,
            'urgency' => trim((string) ($body['urgency'] ?? '')) ?: 'standard',
            'notes' => trim((string) ($body['notes'] ?? '')) ?: null,
            'status' => 'received',
            'createdAt' => $createdAt,
            'updatedAt' => $createdAt,
        ]]);

    case 'client.profile.save':
        $user = require_user();
        $updatedAt = gmdate('c');
        $fullName = require_string($body, 'fullName', 2, 255);
        $email = require_email($body);
        $phone = trim((string) ($body['phone'] ?? '')) ?: null;
        $dateOfBirth = trim((string) ($body['dateOfBirth'] ?? '')) ?: null;
        $nationality = trim((string) ($body['nationality'] ?? '')) ?: null;
        $passportNumber = trim((string) ($body['passportNumber'] ?? '')) ?: null;
        $preferredContactMethod = require_string($body, 'preferredContactMethod', 3, 30);
        $commEmail = !empty($body['communicationPreferences']['email']) ? 1 : 0;
        $commWhatsapp = !empty($body['communicationPreferences']['whatsapp']) ? 1 : 0;
        $commSms = !empty($body['communicationPreferences']['sms']) ? 1 : 0;
        $stmt = $pdo->prepare(
            'INSERT INTO client_profiles (user_id, full_name, email, phone, date_of_birth, nationality, passport_number, preferred_contact_method, comm_email, comm_whatsapp, comm_sms, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), phone = VALUES(phone), date_of_birth = VALUES(date_of_birth), nationality = VALUES(nationality), passport_number = VALUES(passport_number), preferred_contact_method = VALUES(preferred_contact_method), comm_email = VALUES(comm_email), comm_whatsapp = VALUES(comm_whatsapp), comm_sms = VALUES(comm_sms), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $user['id'],
            $fullName,
            $email,
            $phone,
            $dateOfBirth,
            $nationality,
            $passportNumber,
            $preferredContactMethod,
            $commEmail,
            $commWhatsapp,
            $commSms,
            $updatedAt,
        ]);
        $userUpdate = $pdo->prepare('UPDATE users SET full_name = ?, email = ?, phone = ? WHERE id = ?');
        $userUpdate->execute([$fullName, $email, $phone, $user['id']]);
        $updatedProfileStmt = $pdo->prepare('SELECT * FROM client_profiles WHERE user_id = ? LIMIT 1');
        $updatedProfileStmt->execute([$user['id']]);
        respond(['profile' => map_profile($updatedProfileStmt->fetch())]);

    case 'client.message.send':
        $user = require_user();
        $threadId = trim((string) ($body['threadId'] ?? ''));
        $subject = trim((string) ($body['subject'] ?? '')) ?: 'Support request';
        $now = gmdate('c');
        if (!$threadId) {
            $threadId = 'thread-' . bin2hex(random_bytes(8));
            $thread = $pdo->prepare('INSERT INTO message_threads (id, user_id, subject, channel, unread_count, last_message_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $thread->execute([$threadId, $user['id'], $subject, 'secure-portal', 0, $now, $now]);
        } else {
            $threadCheck = $pdo->prepare('SELECT id FROM message_threads WHERE id = ? AND user_id = ? LIMIT 1');
            $threadCheck->execute([$threadId, $user['id']]);
            if (!$threadCheck->fetch()) {
                respond(['error' => 'Conversation not found.'], 404);
            }
        }
        $messageId = 'msg-' . bin2hex(random_bytes(8));
        $createdAt = $now;
        $messageBody = require_string($body, 'body', 2, 5000);
        $message = $pdo->prepare('INSERT INTO messages (id, thread_id, sender_role, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $message->execute([$messageId, $threadId, 'client', $user['full_name'] ?? 'Client', $messageBody, $createdAt]);
        $threadUpdate = $pdo->prepare('UPDATE message_threads SET last_message_at = ? WHERE id = ?');
        $threadUpdate->execute([$createdAt, $threadId]);
        $threadRead = $pdo->prepare('SELECT id, user_id AS userId, subject, channel, unread_count AS unreadCount, last_message_at AS lastMessageAt, created_at AS createdAt FROM message_threads WHERE id = ? LIMIT 1');
        $threadRead->execute([$threadId]);
        respond(['thread' => $threadRead->fetch(), 'message' => [
            'id' => $messageId,
            'threadId' => $threadId,
            'sender' => 'client',
            'senderName' => $user['full_name'] ?? 'Client',
            'senderRole' => 'client',
            'body' => $messageBody,
            'createdAt' => $createdAt,
        ]]);

    case 'client.notifications.read':
        $user = require_user();
        $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?');
        $stmt->execute([require_string($body, 'notificationId', 3, 64), $user['id']]);
        respond(['ok' => true]);

    case 'client.notifications.read-all':
        $user = require_user();
        $stmt = $pdo->prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?');
        $stmt->execute([$user['id']]);
        respond(['ok' => true]);

    case 'client.consultation.update':
        $user = require_user();
        $fields = [
            trim((string) ($body['status'] ?? '')),
            trim((string) ($body['date'] ?? '')),
            trim((string) ($body['time'] ?? '')),
            trim((string) ($body['meetingType'] ?? '')),
            trim((string) ($body['notes'] ?? '')),
        ];
        $currentStmt = $pdo->prepare('SELECT * FROM consultation_bookings WHERE id = ? AND user_id = ? LIMIT 1');
        $currentStmt->execute([require_string($body, 'consultationId', 3, 64), $user['id']]);
        $currentConsultation = $currentStmt->fetch();
        if (!$currentConsultation) {
            respond(['error' => 'Consultation not found.'], 404);
        }
        $stmt = $pdo->prepare('UPDATE consultation_bookings SET status = ?, booking_date = ?, booking_time = ?, meeting_type = ?, notes = ? WHERE id = ? AND user_id = ?');
        $stmt->execute([
            $fields[0] ?: $currentConsultation['status'],
            $fields[1] ?: $currentConsultation['booking_date'],
            $fields[2] ?: $currentConsultation['booking_time'],
            $fields[3] ?: $currentConsultation['meeting_type'],
            $fields[4] ?: $currentConsultation['notes'],
            $body['consultationId'],
            $user['id'],
        ]);
        if (($fields[0] ?: $currentConsultation['status']) === 'rescheduled') {
            $notification = $pdo->prepare('INSERT INTO notifications (id, user_id, type, title, body, action_path, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
            $notification->execute([
                'note-' . bin2hex(random_bytes(8)),
                $user['id'],
                'consultation',
                'Consultation update received',
                'Your consultation change request has been saved. We will confirm the next available slot shortly.',
                '/dashboard/consultations',
                0,
                gmdate('c'),
            ]);
        }
        $updatedStmt = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, service, booking_date AS date, booking_time AS time, meeting_type AS meetingType, notes, status, created_at AS createdAt, created_at AS updatedAt FROM consultation_bookings WHERE id = ? LIMIT 1');
        $updatedStmt->execute([$body['consultationId']]);
        respond(['consultation' => $updatedStmt->fetch()]);

    case 'dashboard.get':
        $isAdmin = isset($_GET['admin']) && $_GET['admin'] === '1';
        $current = $isAdmin ? require_admin() : require_user();
        $userId = $isAdmin ? ($_GET['userId'] ?? null) : $current['id'];

        $userFilter = $userId ? ' WHERE user_id = ?' : '';
        $params = $userId ? [$userId] : [];

        $consultations = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, service, booking_date AS date, booking_time AS time, meeting_type AS meetingType, notes, status, created_at AS createdAt FROM consultation_bookings' . $userFilter . ' ORDER BY created_at DESC');
        $consultations->execute($params);

        $visaApplications = $pdo->prepare('SELECT id, user_id AS userId, full_name AS fullName, email, phone, visa_type AS visaType, destination_country AS destinationCountry, purpose, travel_date AS travelDate, notes, status, timeline_step AS timelineStep, created_at AS createdAt, updated_at AS updatedAt FROM visa_applications' . $userFilter . ' ORDER BY created_at DESC');
        $visaApplications->execute($params);

        $tourEnquiries = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, destination, departure, return_date AS returnDate, passengers, budget, notes, status, created_at AS createdAt FROM tour_enquiries' . $userFilter . ' ORDER BY created_at DESC');
        $tourEnquiries->execute($params);

        $documents = $pdo->prepare('SELECT id, user_id AS userId, application_id AS applicationId, file_name AS fileName, file_type AS fileType, file_size AS fileSize, file_url AS fileUrl, uploaded_at AS uploadedAt FROM documents' . $userFilter . ' ORDER BY uploaded_at DESC');
        $documents->execute($params);

        $leads = $pdo->prepare('SELECT id, user_id AS userId, name, email, phone, subject, message, category, status, created_at AS createdAt FROM contact_leads' . $userFilter . ' ORDER BY created_at DESC');
        $leads->execute($params);

        respond([
            'snapshot' => [
                'consultations' => $consultations->fetchAll(),
                'visaApplications' => $visaApplications->fetchAll(),
                'tourEnquiries' => $tourEnquiries->fetchAll(),
                'documents' => $documents->fetchAll(),
                'leads' => $leads->fetchAll(),
            ],
        ]);

    case 'destinations.list':
        $destinations = fetch_rows($pdo, 'SELECT * FROM destination_options WHERE is_active = 1 ORDER BY category ASC, name ASC');
        respond([
            'destinations' => array_map(static fn(array $row): array => [
                'id' => $row['id'],
                'name' => $row['name'],
                'category' => $row['category'],
                'active' => (bool) $row['is_active'],
                'updatedAt' => $row['updated_at'],
            ], $destinations),
        ]);

    case 'admin.workspace':
        require_admin();
        $users = fetch_rows($pdo, 'SELECT id, email, full_name, phone, role, admin_role, must_change_password, created_at FROM users ORDER BY created_at DESC');
        $profiles = fetch_rows($pdo, 'SELECT * FROM client_profiles ORDER BY updated_at DESC');
        $consultations = fetch_rows($pdo, 'SELECT * FROM consultation_bookings ORDER BY created_at DESC');
        $visaApplications = fetch_rows($pdo, 'SELECT * FROM visa_applications ORDER BY created_at DESC');
        $tourEnquiries = fetch_rows($pdo, 'SELECT * FROM tour_enquiries ORDER BY created_at DESC');
        $documents = fetch_rows($pdo, 'SELECT * FROM documents ORDER BY uploaded_at DESC');
        $leads = fetch_rows($pdo, 'SELECT * FROM contact_leads ORDER BY created_at DESC');
        $serviceRequests = fetch_rows($pdo, 'SELECT * FROM service_requests ORDER BY created_at DESC');
        $payments = fetch_rows($pdo, 'SELECT * FROM payments ORDER BY created_at DESC');
        $threads = fetch_rows($pdo, 'SELECT * FROM message_threads ORDER BY last_message_at DESC');
        $messages = fetch_rows($pdo, 'SELECT * FROM messages ORDER BY created_at DESC');
        $notifications = fetch_rows($pdo, 'SELECT * FROM notifications ORDER BY created_at DESC');
        $blogPosts = fetch_rows($pdo, 'SELECT * FROM blog_posts ORDER BY published_at DESC');
        $settings = fetch_one($pdo, "SELECT * FROM app_settings WHERE id = 'default' LIMIT 1");
        $leadMeta = fetch_rows($pdo, 'SELECT * FROM lead_meta ORDER BY updated_at DESC');
        $applicationMeta = fetch_rows($pdo, 'SELECT * FROM application_meta ORDER BY updated_at DESC');
        $consultationMeta = fetch_rows($pdo, 'SELECT * FROM consultation_meta ORDER BY updated_at DESC');
        $serviceRequestMeta = fetch_rows($pdo, 'SELECT * FROM service_request_meta ORDER BY updated_at DESC');
        $visaServices = fetch_rows($pdo, 'SELECT * FROM visa_services ORDER BY updated_at DESC');
        $studyAbroadRecords = fetch_rows($pdo, 'SELECT * FROM study_abroad_records ORDER BY updated_at DESC');
        $tourPackages = fetch_rows($pdo, 'SELECT * FROM tour_packages ORDER BY updated_at DESC');
        $destinationOptions = fetch_rows($pdo, 'SELECT * FROM destination_options ORDER BY category ASC, name ASC');
        $testimonials = fetch_rows($pdo, 'SELECT * FROM testimonials ORDER BY sort_order ASC, updated_at DESC');
        $faqs = fetch_rows($pdo, 'SELECT * FROM faq_items ORDER BY sort_order ASC, updated_at DESC');
        $contentBlocks = fetch_rows($pdo, 'SELECT * FROM content_blocks ORDER BY display_order ASC, updated_at DESC');
        $servicePricing = fetch_rows($pdo, 'SELECT * FROM service_pricing ORDER BY display_order ASC, updated_at DESC');
        $adminUsers = fetch_rows($pdo, 'SELECT admin_users.*, users.must_change_password FROM admin_users LEFT JOIN users ON users.id = admin_users.linked_user_id ORDER BY admin_users.created_at DESC');
        $adminAlerts = fetch_rows($pdo, 'SELECT * FROM admin_alerts ORDER BY created_at DESC');
        $chatThreads = fetch_rows($pdo, 'SELECT * FROM chat_threads ORDER BY last_message_at DESC');
        $chatMessages = fetch_rows($pdo, 'SELECT * FROM chat_messages ORDER BY created_at DESC');
        $auditLogs = fetch_rows($pdo, 'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');

        respond([
            'workspace' => [
                'users' => array_map('map_user', $users),
                'profiles' => array_map('map_profile', $profiles),
                'leadsBase' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'userId' => $row['user_id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'subject' => $row['subject'],
                    'message' => $row['message'],
                    'category' => $row['category'],
                    'status' => $row['status'],
                    'createdAt' => $row['created_at'],
                ], $leads),
                'consultations' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'userId' => $row['user_id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'service' => $row['service'],
                    'date' => $row['booking_date'],
                    'time' => $row['booking_time'],
                    'meetingType' => $row['meeting_type'],
                    'notes' => $row['notes'],
                    'status' => $row['status'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['created_at'],
                ], $consultations),
                'visaApplications' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'userId' => $row['user_id'],
                    'fullName' => $row['full_name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'visaType' => $row['visa_type'],
                    'destinationCountry' => $row['destination_country'],
                    'purpose' => $row['purpose'],
                    'travelDate' => $row['travel_date'],
                    'notes' => $row['notes'],
                    'status' => $row['status'],
                    'timelineStep' => $row['timeline_step'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at'],
                ], $visaApplications),
                'tourEnquiries' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'userId' => $row['user_id'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'phone' => $row['phone'],
                    'destination' => $row['destination'],
                    'departure' => $row['departure'],
                    'returnDate' => $row['return_date'],
                    'passengers' => $row['passengers'],
                    'budget' => $row['budget'],
                    'notes' => $row['notes'],
                    'status' => $row['status'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['created_at'],
                ], $tourEnquiries),
                'documents' => array_map('map_document_row', $documents),
                'serviceRequests' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'userId' => $row['user_id'],
                    'requestType' => $row['request_type'],
                    'destination' => $row['destination'],
                    'travelDate' => $row['travel_date'],
                    'budget' => $row['budget'],
                    'travellers' => $row['travellers'],
                    'urgency' => $row['urgency'],
                    'notes' => $row['notes'],
                    'status' => $row['status'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at'],
                ], $serviceRequests),
                'payments' => array_map('map_payment_row', $payments),
                'messageThreads' => array_map('map_message_thread_row', $threads),
                'messages' => array_map('map_message_row', $messages),
                'notifications' => array_map('map_notification_row', $notifications),
                'blogPosts' => array_map('map_blog_post', $blogPosts),
                'settings' => $settings ? map_settings($settings) : null,
                'leadMeta' => array_map('map_lead_meta_row', $leadMeta),
                'applicationMeta' => array_map('map_application_meta_row', $applicationMeta),
                'consultationMeta' => array_map('map_consultation_meta_row', $consultationMeta),
                'serviceRequestMeta' => array_map('map_service_request_meta_row', $serviceRequestMeta),
                'visaServices' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'country' => $row['country'],
                    'title' => $row['title'],
                    'requirements' => $row['requirements'],
                    'checklistContent' => $row['checklist_copy'] ?? '',
                    'pricingNote' => $row['pricing_note'],
                    'seoTitle' => $row['seo_title'],
                    'seoDescription' => $row['seo_description'],
                    'ctaEnabled' => (bool) $row['cta_visible'],
                    'status' => $row['status'],
                    'updatedAt' => $row['updated_at'],
                ], $visaServices),
                'studyAbroadRecords' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'country' => $row['country'],
                    'title' => $row['title'],
                    'programmes' => $row['programme_information'] ?? '',
                    'intakeInfo' => $row['intake_information'] ?? '',
                    'content' => $row['summary'],
                    'ctaBanner' => $row['cta_text'],
                    'status' => $row['status'],
                    'updatedAt' => $row['updated_at'],
                ], $studyAbroadRecords),
                'tourPackages' => array_map('map_tour_package_row', $tourPackages),
                'destinationOptions' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'name' => $row['name'],
                    'category' => $row['category'],
                    'active' => (bool) $row['is_active'],
                    'updatedAt' => $row['updated_at'],
                ], $destinationOptions),
                'testimonials' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'name' => $row['client_name'],
                    'quote' => $row['quote_text'],
                    'category' => str_replace('-', ' ', $row['category']),
                    'featured' => (bool) $row['featured'],
                    'displayOrder' => (int) $row['sort_order'],
                    'status' => $row['approval_status'],
                    'imageUrl' => $row['image_url'],
                    'updatedAt' => $row['updated_at'],
                ], $testimonials),
                'faqs' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'question' => $row['question'],
                    'answer' => $row['answer'],
                    'category' => str_replace('-', ' ', $row['category']),
                    'displayOrder' => (int) $row['sort_order'],
                    'published' => (bool) $row['published'],
                    'updatedAt' => $row['updated_at'],
                ], $faqs),
                'contentBlocks' => array_map('map_content_block_row', $contentBlocks),
                'servicePricing' => array_map('map_service_pricing_row', $servicePricing),
                'adminUsers' => array_map('map_admin_user_row', $adminUsers),
                'auditLogs' => array_map(static fn(array $row): array => [
                    'id' => $row['id'],
                    'actorUserId' => $row['actor_user_id'],
                    'actorRole' => $row['actor_role'],
                    'actionKey' => $row['action_key'],
                    'targetType' => $row['target_type'],
                    'targetId' => $row['target_id'],
                    'summary' => $row['summary'],
                    'createdAt' => $row['created_at'],
                ], $auditLogs),
                'adminAlerts' => array_map('map_admin_alert_row', $adminAlerts),
                'chatThreads' => array_map('map_chat_thread_row', $chatThreads),
                'chatMessages' => array_map('map_chat_message_row', $chatMessages),
            ],
        ]);

    case 'admin.lead-meta.save':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $leadId = require_string($body, 'leadId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM lead_meta WHERE lead_id = ? LIMIT 1', [$leadId]);
        $updatedAt = gmdate('c');
        $stmt = $pdo->prepare(
            'INSERT INTO lead_meta (lead_id, source, service_type, destination, assigned_staff_user_id, priority, status, internal_notes, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE source = VALUES(source), service_type = VALUES(service_type), destination = VALUES(destination), assigned_staff_user_id = VALUES(assigned_staff_user_id), priority = VALUES(priority), status = VALUES(status), internal_notes = VALUES(internal_notes), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $leadId,
            array_key_exists('source', $body) ? optional_string($body, 'source', 120) : ($existing['source'] ?? null),
            array_key_exists('serviceType', $body) ? optional_string($body, 'serviceType', 120) : ($existing['service_type'] ?? null),
            array_key_exists('destination', $body) ? optional_string($body, 'destination', 120) : ($existing['destination'] ?? null),
            array_key_exists('assignedStaffId', $body) ? optional_string($body, 'assignedStaffId', 64) : ($existing['assigned_staff_user_id'] ?? null),
            array_key_exists('priority', $body) ? require_string($body, 'priority', 2, 20) : ($existing['priority'] ?? 'medium'),
            array_key_exists('status', $body) ? require_string($body, 'status', 2, 50) : ($existing['status'] ?? 'new'),
            array_key_exists('internalNotes', $body) ? optional_string($body, 'internalNotes', 5000) : ($existing['internal_notes'] ?? null),
            $updatedAt,
        ]);
        if (array_key_exists('status', $body)) {
            $statusUpdate = $pdo->prepare('UPDATE contact_leads SET status = ? WHERE id = ?');
            $statusUpdate->execute([$body['status'], $leadId]);
        }
        $saved = fetch_one($pdo, 'SELECT * FROM lead_meta WHERE lead_id = ? LIMIT 1', [$leadId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'lead.update', 'lead', $leadId, 'Updated lead workflow details.');
        respond(['meta' => map_lead_meta_row($saved)]);

    case 'admin.application-meta.save':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $applicationId = require_string($body, 'applicationId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM application_meta WHERE application_id = ? LIMIT 1', [$applicationId]);
        $clientUpdates = array_key_exists('clientUpdates', $body) && is_array($body['clientUpdates']) ? $body['clientUpdates'] : decode_json_array($existing['client_updates_json'] ?? null);
        $linkedChecklist = array_key_exists('linkedChecklist', $body) && is_array($body['linkedChecklist']) ? $body['linkedChecklist'] : decode_json_array($existing['linked_checklist_json'] ?? null);
        $stmt = $pdo->prepare(
            'INSERT INTO application_meta (application_id, application_type, destination_country, assigned_staff_user_id, stage, status, next_action, internal_notes, client_updates_json, linked_checklist_json, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE application_type = VALUES(application_type), destination_country = VALUES(destination_country), assigned_staff_user_id = VALUES(assigned_staff_user_id), stage = VALUES(stage), status = VALUES(status), next_action = VALUES(next_action), internal_notes = VALUES(internal_notes), client_updates_json = VALUES(client_updates_json), linked_checklist_json = VALUES(linked_checklist_json), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $applicationId,
            array_key_exists('serviceType', $body) ? require_string($body, 'serviceType', 2, 80) : ($existing['application_type'] ?? 'travel-support'),
            array_key_exists('destinationCountry', $body) ? optional_string($body, 'destinationCountry', 120) : ($existing['destination_country'] ?? null),
            array_key_exists('assignedStaffId', $body) ? optional_string($body, 'assignedStaffId', 64) : ($existing['assigned_staff_user_id'] ?? null),
            array_key_exists('currentStage', $body) ? require_string($body, 'currentStage', 2, 120) : ($existing['stage'] ?? 'Enquiry received'),
            array_key_exists('status', $body) ? require_string($body, 'status', 2, 60) : ($existing['status'] ?? 'in-progress'),
            array_key_exists('nextAction', $body) ? optional_string($body, 'nextAction', 255) : ($existing['next_action'] ?? null),
            array_key_exists('internalNotes', $body) ? optional_string($body, 'internalNotes', 5000) : ($existing['internal_notes'] ?? null),
            json_encode($clientUpdates),
            json_encode($linkedChecklist),
            gmdate('c'),
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM application_meta WHERE application_id = ? LIMIT 1', [$applicationId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'application.update', 'application', $applicationId, 'Updated application workflow metadata.');
        respond(['meta' => map_application_meta_row($saved)]);

    case 'admin.application-update.add':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $applicationId = require_string($body, 'applicationId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM application_meta WHERE application_id = ? LIMIT 1', [$applicationId]);
        $updates = decode_json_array($existing['client_updates_json'] ?? null);
        $updates[] = [
            'id' => 'client-update-' . bin2hex(random_bytes(6)),
            'message' => require_string($body, 'message', 2, 5000),
            'createdAt' => gmdate('c'),
        ];
        $stmt = $pdo->prepare(
            'INSERT INTO application_meta (application_id, application_type, destination_country, assigned_staff_user_id, stage, status, next_action, internal_notes, client_updates_json, linked_checklist_json, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE client_updates_json = VALUES(client_updates_json), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $applicationId,
            $existing['application_type'] ?? 'travel-support',
            $existing['destination_country'] ?? null,
            $existing['assigned_staff_user_id'] ?? null,
            $existing['stage'] ?? 'Enquiry received',
            $existing['status'] ?? 'in-progress',
            $existing['next_action'] ?? null,
            $existing['internal_notes'] ?? null,
            json_encode($updates),
            $existing['linked_checklist_json'] ?? json_encode([]),
            gmdate('c'),
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM application_meta WHERE application_id = ? LIMIT 1', [$applicationId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'application.client_update', 'application', $applicationId, 'Added a client-facing application update.');
        respond(['meta' => map_application_meta_row($saved)]);

    case 'admin.document.review':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $documentId = require_string($body, 'documentId', 3, 64);
        $stmt = $pdo->prepare('UPDATE documents SET status = ?, admin_notes = ? WHERE id = ?');
        $stmt->execute([
            require_string($body, 'status', 2, 50),
            optional_string($body, 'adminNotes', 5000),
            $documentId,
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM documents WHERE id = ? LIMIT 1', [$documentId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'document.review', 'document', $documentId, 'Reviewed an uploaded document.');
        respond(['document' => $saved ? map_document_row($saved) : null]);

    case 'admin.consultation-meta.save':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $consultationId = require_string($body, 'consultationId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM consultation_meta WHERE consultation_id = ? LIMIT 1', [$consultationId]);
        $stmt = $pdo->prepare(
            'INSERT INTO consultation_meta (consultation_id, assigned_staff_user_id, internal_notes, client_note, updated_at)
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE assigned_staff_user_id = VALUES(assigned_staff_user_id), internal_notes = VALUES(internal_notes), client_note = VALUES(client_note), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $consultationId,
            array_key_exists('assignedStaffId', $body) ? optional_string($body, 'assignedStaffId', 64) : ($existing['assigned_staff_user_id'] ?? null),
            array_key_exists('adminNotes', $body) ? optional_string($body, 'adminNotes', 5000) : ($existing['internal_notes'] ?? null),
            array_key_exists('clientVisibleNote', $body) ? optional_string($body, 'clientVisibleNote', 5000) : ($existing['client_note'] ?? null),
            gmdate('c'),
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM consultation_meta WHERE consultation_id = ? LIMIT 1', [$consultationId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'consultation.update', 'consultation', $consultationId, 'Updated consultation notes or assignment.');
        respond(['meta' => map_consultation_meta_row($saved)]);

    case 'admin.service-request-meta.save':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $requestId = require_string($body, 'requestId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM service_request_meta WHERE request_id = ? LIMIT 1', [$requestId]);
        $stmt = $pdo->prepare(
            'INSERT INTO service_request_meta (request_id, assigned_staff_user_id, internal_notes, updated_at)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE assigned_staff_user_id = VALUES(assigned_staff_user_id), internal_notes = VALUES(internal_notes), updated_at = VALUES(updated_at)'
        );
        $stmt->execute([
            $requestId,
            array_key_exists('assignedStaffId', $body) ? optional_string($body, 'assignedStaffId', 64) : ($existing['assigned_staff_user_id'] ?? null),
            array_key_exists('internalNotes', $body) ? optional_string($body, 'internalNotes', 5000) : ($existing['internal_notes'] ?? null),
            gmdate('c'),
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM service_request_meta WHERE request_id = ? LIMIT 1', [$requestId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'service_request.update', 'service_request', $requestId, 'Updated service request notes or assignment.');
        respond(['meta' => map_service_request_meta_row($saved)]);

    case 'admin.service-request.update':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $requestId = require_string($body, 'requestId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM service_requests WHERE id = ? LIMIT 1', [$requestId]);
        if (!$existing) {
            respond(['error' => 'Service request not found.'], 404);
        }
        $stmt = $pdo->prepare('UPDATE service_requests SET status = ?, destination = ?, travel_date = ?, budget = ?, travellers = ?, urgency = ?, notes = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([
            array_key_exists('status', $body) ? require_string($body, 'status', 2, 60) : $existing['status'],
            array_key_exists('destination', $body) ? optional_string($body, 'destination', 255) : $existing['destination'],
            array_key_exists('travelDate', $body) ? optional_string($body, 'travelDate', 40) : $existing['travel_date'],
            array_key_exists('budget', $body) ? optional_string($body, 'budget', 100) : $existing['budget'],
            array_key_exists('travellers', $body) ? optional_string($body, 'travellers', 20) : $existing['travellers'],
            array_key_exists('urgency', $body) ? optional_string($body, 'urgency', 20) : $existing['urgency'],
            array_key_exists('notes', $body) ? optional_string($body, 'notes', 5000) : $existing['notes'],
            gmdate('c'),
            $requestId,
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM service_requests WHERE id = ? LIMIT 1', [$requestId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'service_request.status', 'service_request', $requestId, 'Updated a service request record.');
        respond(['record' => [
            'id' => $saved['id'],
            'userId' => $saved['user_id'],
            'requestType' => $saved['request_type'],
            'destination' => $saved['destination'],
            'travelDate' => $saved['travel_date'],
            'budget' => $saved['budget'],
            'travellers' => $saved['travellers'],
            'urgency' => $saved['urgency'],
            'notes' => $saved['notes'],
            'status' => $saved['status'],
            'createdAt' => $saved['created_at'],
            'updatedAt' => $saved['updated_at'],
        ]]);

    case 'admin.payment.update':
        $actor = require_admin_roles(['super-admin', 'admin', 'finance-staff']);
        $paymentId = require_string($body, 'paymentId', 3, 64);
        $existing = fetch_one($pdo, 'SELECT * FROM payments WHERE id = ? LIMIT 1', [$paymentId]);
        if (!$existing) {
            respond(['error' => 'Payment not found.'], 404);
        }
        $stmt = $pdo->prepare('UPDATE payments SET status = ?, receipt_url = ? WHERE id = ?');
        $stmt->execute([
            array_key_exists('status', $body) ? require_string($body, 'status', 2, 40) : $existing['status'],
            array_key_exists('receiptUrl', $body) ? optional_string($body, 'receiptUrl', 255) : $existing['receipt_url'],
            $paymentId,
        ]);
        $saved = fetch_one($pdo, 'SELECT * FROM payments WHERE id = ? LIMIT 1', [$paymentId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'finance-staff'), 'payment.update', 'payment', $paymentId, 'Updated payment status or receipt details.');
        respond(['payment' => map_payment_row($saved)]);

    case 'admin.message.reply':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff', 'finance-staff']);
        $threadId = require_string($body, 'threadId', 3, 64);
        $thread = fetch_one($pdo, 'SELECT * FROM message_threads WHERE id = ? LIMIT 1', [$threadId]);
        if (!$thread) {
            respond(['error' => 'Thread not found.'], 404);
        }
        $messageId = 'msg-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $senderName = trim((string) ($actor['full_name'] ?? 'GenieHub Team'));
        $messageBody = require_string($body, 'body', 2, 5000);
        $stmt = $pdo->prepare('INSERT INTO messages (id, thread_id, sender_role, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$messageId, $threadId, 'agency', $senderName, $messageBody, $createdAt]);
        $threadUpdate = $pdo->prepare('UPDATE message_threads SET last_message_at = ?, unread_count = unread_count + 1 WHERE id = ?');
        $threadUpdate->execute([$createdAt, $threadId]);
        $savedThread = fetch_one($pdo, 'SELECT * FROM message_threads WHERE id = ? LIMIT 1', [$threadId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'admin'), 'message.reply', 'thread', $threadId, 'Sent an admin reply in a secure client thread.');
        respond([
            'thread' => map_message_thread_row($savedThread),
            'message' => [
                'id' => $messageId,
                'threadId' => $threadId,
                'sender' => 'agency',
                'senderName' => $senderName,
                'senderRole' => 'agency',
                'body' => $messageBody,
                'createdAt' => $createdAt,
            ],
        ]);

    case 'admin.alert.read':
        require_admin();
        $alertId = require_string($body, 'alertId', 3, 64);
        $stmt = $pdo->prepare('UPDATE admin_alerts SET is_read = 1 WHERE id = ?');
        $stmt->execute([$alertId]);
        respond(['ok' => true]);

    case 'admin.alert.read-all':
        require_admin();
        $stmt = $pdo->prepare('UPDATE admin_alerts SET is_read = 1');
        $stmt->execute();
        respond(['ok' => true]);

    case 'admin.staff.create':
        $actor = require_super_admin();
        $fullName = require_string($body, 'fullName', 2, 255);
        $email = require_email($body);
        $phone = optional_string($body, 'phone', 50);
        $adminRole = require_string($body, 'adminRole', 2, 40);

        $existingUser = fetch_one($pdo, 'SELECT id FROM users WHERE email = ? LIMIT 1', [$email]);
        if ($existingUser) {
            respond(['error' => 'An account with that email already exists.'], 409);
        }

        $userId = 'staff-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $tempPassword = 'Genie' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4)) . random_int(100, 999) . '!';

        $userStmt = $pdo->prepare('INSERT INTO users (id, email, full_name, phone, role, admin_role, password_hash, must_change_password, password_updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $userStmt->execute([
            $userId,
            $email,
            $fullName,
            $phone,
            'admin',
            $adminRole,
            password_hash($tempPassword, PASSWORD_BCRYPT),
            1,
            $createdAt,
            $createdAt,
        ]);

        $isChatAgent = bool_value($body['isChatAgent'] ?? false);
        $adminStmt = $pdo->prepare('INSERT INTO admin_users (id, linked_user_id, full_name, email, phone, role, is_active, is_chat_agent, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        $adminStmt->execute([
            $userId,
            $userId,
            $fullName,
            $email,
            $phone,
            $adminRole,
            1,
            $isChatAgent ? 1 : 0,
            $createdAt,
            $createdAt,
        ]);

        $saved = fetch_one($pdo, 'SELECT admin_users.*, users.must_change_password FROM admin_users LEFT JOIN users ON users.id = admin_users.linked_user_id WHERE admin_users.id = ? LIMIT 1', [$userId]);
        write_audit_log($pdo, $actor['id'], 'super-admin', 'staff.create', 'admin_user', $userId, 'Created a new staff login.');
        respond(['adminUser' => map_admin_user_row($saved), 'tempPassword' => $tempPassword], 201);

    case 'admin.staff.reset-password':
        $actor = require_super_admin();
        $staffUserId = require_string($body, 'staffUserId', 3, 64);
        $existingUser = fetch_one($pdo, 'SELECT * FROM users WHERE id = ? AND role = ? LIMIT 1', [$staffUserId, 'admin']);
        if (!$existingUser) {
            respond(['error' => 'Staff account not found.'], 404);
        }

        $tempPassword = 'Genie' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 4)) . random_int(100, 999) . '!';
        $updatedAt = gmdate('c');
        $userStmt = $pdo->prepare('UPDATE users SET password_hash = ?, must_change_password = 1, password_updated_at = ? WHERE id = ?');
        $userStmt->execute([password_hash($tempPassword, PASSWORD_BCRYPT), $updatedAt, $staffUserId]);
        $adminStmt = $pdo->prepare('UPDATE admin_users SET updated_at = ? WHERE linked_user_id = ? OR id = ?');
        $adminStmt->execute([$updatedAt, $staffUserId, $staffUserId]);

        write_audit_log($pdo, $actor['id'], 'super-admin', 'staff.reset_password', 'admin_user', $staffUserId, 'Issued a staff password reset.');
        respond(['tempPassword' => $tempPassword, 'ok' => true]);

    case 'admin.chat.assign':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $threadId = require_string($body, 'threadId', 3, 64);
        $assignedStaffId = array_key_exists('assignedStaffId', $body) ? optional_string($body, 'assignedStaffId', 64) : null;
        $stmt = $pdo->prepare('UPDATE chat_threads SET assigned_staff_id = ? WHERE id = ?');
        $stmt->execute([$assignedStaffId, $threadId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'chat.assign', 'chat_thread', $threadId, 'Updated live chat assignment.');
        $saved = fetch_one($pdo, 'SELECT * FROM chat_threads WHERE id = ? LIMIT 1', [$threadId]);
        respond(['thread' => $saved ? map_chat_thread_row($saved) : null]);

    case 'admin.chat.reply':
        $actor = require_admin_roles(['super-admin', 'admin', 'operations-staff']);
        $threadId = require_string($body, 'threadId', 3, 64);
        $thread = fetch_one($pdo, 'SELECT * FROM chat_threads WHERE id = ? LIMIT 1', [$threadId]);
        if (!$thread) {
            respond(['error' => 'Live chat thread not found.'], 404);
        }
        $messageId = 'chat-message-' . bin2hex(random_bytes(8));
        $createdAt = gmdate('c');
        $senderName = optional_string($body, 'senderName', 255) ?? (string) ($actor['full_name'] ?? 'GenieHub Team');
        $messageBody = require_string($body, 'body', 2, 5000);
        $stmt = $pdo->prepare('INSERT INTO chat_messages (id, thread_id, sender_role, sender_name, body, created_at) VALUES (?, ?, ?, ?, ?, ?)');
        $stmt->execute([$messageId, $threadId, 'staff', $senderName, $messageBody, $createdAt]);
        $updateThread = $pdo->prepare('UPDATE chat_threads SET unread_count = 0, last_message_at = ? WHERE id = ?');
        $updateThread->execute([$createdAt, $threadId]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'operations-staff'), 'chat.reply', 'chat_thread', $threadId, 'Replied to a synced live chat thread.');
        respond([
            'message' => [
                'id' => $messageId,
                'threadId' => $threadId,
                'senderRole' => 'staff',
                'senderName' => $senderName,
                'body' => $messageBody,
                'createdAt' => $createdAt,
            ],
        ]);

    case 'admin.collection.save':
        $actor = require_admin();
        $collection = require_string($body, 'collection', 2, 64);
        $item = is_array($body['item'] ?? null) ? $body['item'] : null;
        if (!$item) {
            respond(['error' => 'Collection item is required.'], 422);
        }

        switch ($collection) {
            case 'visaServices':
                require_admin_roles(['super-admin', 'content-manager', 'operations-staff']);
                $stmt = $pdo->prepare(
                    'INSERT INTO visa_services (id, country, title, requirements, checklist_copy, pricing_note, seo_title, seo_description, cta_visible, status, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE country = VALUES(country), title = VALUES(title), requirements = VALUES(requirements), checklist_copy = VALUES(checklist_copy), pricing_note = VALUES(pricing_note), seo_title = VALUES(seo_title), seo_description = VALUES(seo_description), cta_visible = VALUES(cta_visible), status = VALUES(status), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'country', 2, 120),
                    require_string($item, 'title', 2, 255),
                    require_string($item, 'requirements', 2, 20000),
                    optional_string($item, 'checklistContent', 20000) ?? '',
                    optional_string($item, 'pricingNote', 5000),
                    optional_string($item, 'seoTitle', 255),
                    optional_string($item, 'seoDescription', 5000),
                    bool_value($item['ctaEnabled'] ?? false) ? 1 : 0,
                    require_string($item, 'status', 4, 20),
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'studyAbroadRecords':
                require_admin_roles(['super-admin', 'content-manager', 'operations-staff']);
                $stmt = $pdo->prepare(
                    'INSERT INTO study_abroad_records (id, country, title, summary, intake_information, programme_information, cta_text, status, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE country = VALUES(country), title = VALUES(title), summary = VALUES(summary), intake_information = VALUES(intake_information), programme_information = VALUES(programme_information), cta_text = VALUES(cta_text), status = VALUES(status), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'country', 2, 120),
                    require_string($item, 'title', 2, 255),
                    require_string($item, 'content', 2, 20000),
                    optional_string($item, 'intakeInfo', 5000),
                    optional_string($item, 'programmes', 20000),
                    optional_string($item, 'ctaBanner', 255),
                    require_string($item, 'status', 4, 20),
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'tourPackages':
                require_admin_roles(['super-admin', 'content-manager', 'operations-staff']);
                $stmt = $pdo->prepare(
                    'INSERT INTO tour_packages (id, title, destination, duration, description, starting_price, currency, travel_period, travel_dates, itinerary_summary, inclusions, exclusions, image_gallery, image_url, featured, visible, status, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE title = VALUES(title), destination = VALUES(destination), duration = VALUES(duration), description = VALUES(description), starting_price = VALUES(starting_price), currency = VALUES(currency), travel_period = VALUES(travel_period), travel_dates = VALUES(travel_dates), itinerary_summary = VALUES(itinerary_summary), inclusions = VALUES(inclusions), exclusions = VALUES(exclusions), image_gallery = VALUES(image_gallery), image_url = VALUES(image_url), featured = VALUES(featured), visible = VALUES(visible), status = VALUES(status), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'title', 2, 255),
                    require_string($item, 'destination', 2, 120),
                    require_string($item, 'duration', 2, 100),
                    optional_string($item, 'description', 20000) ?? '',
                    optional_string($item, 'startingPrice', 120) ?? '',
                    optional_string($item, 'currency', 10) ?? 'GHS',
                    optional_string($item, 'travelPeriod', 120) ?? '',
                    optional_string($item, 'travelDates', 255) ?? '',
                    optional_string($item, 'itinerarySummary', 20000) ?? '',
                    optional_string($item, 'inclusions', 20000) ?? '',
                    optional_string($item, 'exclusions', 20000) ?? '',
                    json_encode(is_array($item['imageGallery'] ?? null) ? $item['imageGallery'] : []),
                    optional_string($item, 'imageUrl', 255),
                    bool_value($item['featured'] ?? false) ? 1 : 0,
                    bool_value($item['visible'] ?? true) ? 1 : 0,
                    require_string($item, 'status', 4, 20),
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'destinationOptions':
                require_admin_roles(['super-admin', 'content-manager', 'operations-staff']);
                $stmt = $pdo->prepare(
                    'INSERT INTO destination_options (id, name, category, is_active, updated_at)
                     VALUES (?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE name = VALUES(name), category = VALUES(category), is_active = VALUES(is_active), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'name', 2, 120),
                    require_string($item, 'category', 2, 40),
                    bool_value($item['active'] ?? true) ? 1 : 0,
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'testimonials':
                require_admin_roles(['super-admin', 'content-manager']);
                $stmt = $pdo->prepare(
                    'INSERT INTO testimonials (id, client_name, category, quote_text, image_url, featured, sort_order, approval_status, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE client_name = VALUES(client_name), category = VALUES(category), quote_text = VALUES(quote_text), image_url = VALUES(image_url), featured = VALUES(featured), sort_order = VALUES(sort_order), approval_status = VALUES(approval_status), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'name', 2, 255),
                    str_replace(' ', '-', require_string($item, 'category', 2, 40)),
                    require_string($item, 'quote', 2, 10000),
                    optional_string($item, 'imageUrl', 255),
                    bool_value($item['featured'] ?? false) ? 1 : 0,
                    (int) ($item['displayOrder'] ?? 0),
                    require_string($item, 'status', 4, 20),
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'faqs':
                require_admin_roles(['super-admin', 'content-manager']);
                $stmt = $pdo->prepare(
                    'INSERT INTO faq_items (id, category, question, answer, sort_order, published, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE category = VALUES(category), question = VALUES(question), answer = VALUES(answer), sort_order = VALUES(sort_order), published = VALUES(published), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    str_replace(' ', '-', require_string($item, 'category', 2, 40)),
                    require_string($item, 'question', 2, 255),
                    require_string($item, 'answer', 2, 20000),
                    (int) ($item['displayOrder'] ?? 0),
                    bool_value($item['published'] ?? false) ? 1 : 0,
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'contentBlocks':
                require_admin_roles(['super-admin', 'content-manager']);
                $stmt = $pdo->prepare(
                    'INSERT INTO content_blocks (id, block_key, title, section_key, description, body, icon, display_order, is_visible, placement, cta_label, cta_href, published, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE block_key = VALUES(block_key), title = VALUES(title), section_key = VALUES(section_key), description = VALUES(description), body = VALUES(body), icon = VALUES(icon), display_order = VALUES(display_order), is_visible = VALUES(is_visible), placement = VALUES(placement), cta_label = VALUES(cta_label), cta_href = VALUES(cta_href), published = VALUES(published), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'key', 2, 120),
                    require_string($item, 'title', 2, 255),
                    optional_string($item, 'sectionKey', 120),
                    optional_string($item, 'description', 5000),
                    require_string($item, 'content', 2, 20000),
                    optional_string($item, 'icon', 80),
                    (int) ($item['displayOrder'] ?? 0),
                    bool_value($item['visible'] ?? true) ? 1 : 0,
                    optional_string($item, 'placement', 120),
                    optional_string($item, 'ctaLabel', 120),
                    optional_string($item, 'ctaHref', 255),
                    bool_value($item['published'] ?? false) ? 1 : 0,
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'servicePricing':
                require_admin_roles(['super-admin', 'content-manager', 'finance-staff']);
                $createdAt = optional_string($item, 'createdAt', 40) ?? gmdate('c');
                $stmt = $pdo->prepare(
                    'INSERT INTO service_pricing (id, name, description, price, currency, category, is_visible, display_order, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price), currency = VALUES(currency), category = VALUES(category), is_visible = VALUES(is_visible), display_order = VALUES(display_order), updated_at = VALUES(updated_at)'
                );
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    require_string($item, 'name', 2, 255),
                    require_string($item, 'description', 2, 5000),
                    (float) ($item['price'] ?? 0),
                    optional_string($item, 'currency', 10) ?? 'GHS',
                    require_string($item, 'category', 2, 80),
                    bool_value($item['visible'] ?? true) ? 1 : 0,
                    (int) ($item['displayOrder'] ?? 0),
                    $createdAt,
                    require_string($item, 'updatedAt', 8, 40),
                ]);
                break;
            case 'adminUsers':
                require_super_admin();
                $stmt = $pdo->prepare(
                    'INSERT INTO admin_users (id, linked_user_id, full_name, email, phone, role, is_active, is_chat_agent, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE linked_user_id = VALUES(linked_user_id), full_name = VALUES(full_name), email = VALUES(email), phone = VALUES(phone), role = VALUES(role), is_active = VALUES(is_active), is_chat_agent = VALUES(is_chat_agent), updated_at = VALUES(updated_at)'
                );
                $linkedUserId = optional_string($item, 'linkedUserId', 64) ?? require_string($item, 'id', 3, 64);
                $stmt->execute([
                    require_string($item, 'id', 3, 64),
                    $linkedUserId,
                    require_string($item, 'fullName', 2, 255),
                    require_email($item),
                    optional_string($item, 'phone', 50),
                    require_string($item, 'role', 2, 40),
                    bool_value($item['active'] ?? true) ? 1 : 0,
                    bool_value($item['isChatAgent'] ?? false) ? 1 : 0,
                    require_string($item, 'createdAt', 8, 40),
                    gmdate('c'),
                ]);
                $userStmt = $pdo->prepare('UPDATE users SET email = ?, full_name = ?, phone = ?, admin_role = ? WHERE id = ?');
                $userStmt->execute([
                    require_email($item),
                    require_string($item, 'fullName', 2, 255),
                    optional_string($item, 'phone', 50),
                    require_string($item, 'role', 2, 40),
                    $linkedUserId,
                ]);
                break;
            default:
                respond(['error' => 'Unknown admin collection.'], 404);
        }

        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'admin'), 'collection.save', $collection, (string) ($item['id'] ?? $collection), 'Saved an admin collection item.');
        respond(['ok' => true]);

    case 'admin.collection.delete':
        $actor = require_admin();
        $collection = require_string($body, 'collection', 2, 64);
        $id = require_string($body, 'id', 3, 64);
        if ($collection === 'adminUsers') {
            require_super_admin();
            $deleteAdmin = $pdo->prepare('DELETE FROM admin_users WHERE id = ?');
            $deleteAdmin->execute([$id]);
            $deleteUser = $pdo->prepare('DELETE FROM users WHERE id = ?');
            $deleteUser->execute([$id]);
            write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'super-admin'), 'collection.delete', $collection, $id, 'Deleted an admin user record.');
            respond(['ok' => true]);
        }
        if (in_array($collection, ['visaServices', 'studyAbroadRecords', 'tourPackages', 'destinationOptions'], true)) {
            require_admin_roles(['super-admin', 'content-manager', 'operations-staff']);
        }
        if (in_array($collection, ['testimonials', 'faqs', 'contentBlocks'], true)) {
            require_admin_roles(['super-admin', 'content-manager']);
        }
        if ($collection === 'servicePricing') {
            require_admin_roles(['super-admin', 'content-manager', 'finance-staff']);
        }
        $table = match ($collection) {
            'visaServices' => 'visa_services',
            'studyAbroadRecords' => 'study_abroad_records',
            'tourPackages' => 'tour_packages',
            'destinationOptions' => 'destination_options',
            'testimonials' => 'testimonials',
            'faqs' => 'faq_items',
            'contentBlocks' => 'content_blocks',
            'servicePricing' => 'service_pricing',
            default => null,
        };
        if (!$table) {
            respond(['error' => 'Unknown admin collection.'], 404);
        }
        $stmt = $pdo->prepare("DELETE FROM {$table} WHERE id = ?");
        $stmt->execute([$id]);
        write_audit_log($pdo, $actor['id'], (string) ($actor['admin_role'] ?? 'admin'), 'collection.delete', $collection, $id, 'Deleted an admin collection item.');
        respond(['ok' => true]);

    case 'visa.update':
        require_admin();
        $stmt = $pdo->prepare('UPDATE visa_applications SET status = ?, timeline_step = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([
            require_string($body, 'status', 3, 50),
            require_string($body, 'timelineStep', 3, 255),
            gmdate('c'),
            require_string($body, 'applicationId', 3, 64),
        ]);
        respond(['ok' => true]);

    case 'lead.update':
        require_admin();
        $stmt = $pdo->prepare('UPDATE contact_leads SET status = ? WHERE id = ?');
        $stmt->execute([
            require_string($body, 'status', 3, 50),
            require_string($body, 'leadId', 3, 64),
        ]);
        respond(['ok' => true]);

    case 'consultation.update':
        require_admin();
        $stmt = $pdo->prepare('UPDATE consultation_bookings SET status = ? WHERE id = ?');
        $stmt->execute([
            require_string($body, 'status', 3, 50),
            require_string($body, 'consultationId', 3, 64),
        ]);
        respond(['ok' => true]);

    case 'tour.update':
        require_admin();
        $stmt = $pdo->prepare('UPDATE tour_enquiries SET status = ? WHERE id = ?');
        $stmt->execute([
            require_string($body, 'status', 3, 50),
            require_string($body, 'tourId', 3, 64),
        ]);
        respond(['ok' => true]);

    default:
        respond(['error' => 'Unknown action.'], 404);
}
