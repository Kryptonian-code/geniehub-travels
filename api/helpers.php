<?php

require_once __DIR__ . '/db.php';

function cors_headers(): void
{
    $config = require __DIR__ . '/config.php';
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowedOrigins = $config['allowed_origins'] ?? [];

    if ($origin && in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: $origin");
    } elseif (!headers_sent()) {
        header('Access-Control-Allow-Origin: http://127.0.0.1:8080');
    }

    header('Vary: Origin');
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Content-Type: application/json');
}

function boot_api(): void
{
    ini_set('display_errors', '0');
    ini_set('log_errors', '1');
    error_reporting(E_ALL);
    if (ob_get_level() === 0) {
        ob_start();
    }

    set_error_handler(static function (int $severity, string $message, string $file, int $line): bool {
        error_log(sprintf('[GenieHub API][PHP Warning] %s in %s:%d', $message, $file, $line));
        return true;
    });

    set_exception_handler(static function (Throwable $throwable): void {
        error_log(sprintf('[GenieHub API][Unhandled Exception] %s in %s:%d', $throwable->getMessage(), $throwable->getFile(), $throwable->getLine()));
        if (!headers_sent()) {
            header('Content-Type: application/json');
        }
        http_response_code(500);
        while (ob_get_level() > 0) {
            ob_end_clean();
        }
        echo json_encode([
            'success' => false,
            'error' => 'Server error. Please try again shortly.',
            'code' => 'server_error',
        ]);
        exit;
    });

    cors_headers();

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }

    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

function json_input(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) {
        return [];
    }

    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

function respond(array $payload, int $status = 200): void
{
    if (!headers_sent()) {
        header('Content-Type: application/json');
    }
    http_response_code($status);
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    if (!array_key_exists('success', $payload)) {
      $payload['success'] = $status < 400;
    }
    echo json_encode($payload);
    exit;
}

function current_user(): ?array
{
    if (!isset($_SESSION['user_id'])) {
        return null;
    }

    $stmt = get_pdo()->prepare('SELECT id, email, full_name, phone, role, admin_role, must_change_password, created_at FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    return $user ?: null;
}

function require_user(): array
{
    $user = current_user();
    if (!$user) {
        respond(['error' => 'Authentication required.'], 401);
    }

    return $user;
}

function require_admin(): array
{
    $user = require_user();
    if (($user['role'] ?? 'client') !== 'admin') {
        respond(['error' => 'Admin access required.'], 403);
    }

    return $user;
}

function require_super_admin(): array
{
    $user = require_admin();
    if (($user['admin_role'] ?? 'admin') !== 'super-admin') {
        respond(['error' => 'Super admin access required.'], 403);
    }

    return $user;
}

function require_admin_roles(array $roles): array
{
    $user = require_admin();
    $role = $user['admin_role'] ?? 'admin';
    if (!in_array($role, $roles, true)) {
        respond(['error' => 'You do not have permission for this action.'], 403);
    }

    return $user;
}

function map_user(array $row): array
{
    return [
        'id' => $row['id'],
        'email' => $row['email'],
        'fullName' => $row['full_name'],
        'phone' => $row['phone'],
        'role' => $row['role'],
        'adminRole' => $row['admin_role'] ?? null,
        'authProvider' => 'local',
        'mustChangePassword' => isset($row['must_change_password']) ? (bool) $row['must_change_password'] : false,
        'createdAt' => $row['created_at'],
    ];
}

function map_settings(array $row): array
{
    return [
        'id' => $row['id'],
        'brandName' => $row['brand_name'],
        'tagline' => $row['tagline'],
        'supportEmail' => $row['support_email'],
        'phone' => $row['phone'],
        'officeAddress' => $row['office_address'],
        'workingHours' => $row['working_hours'],
        'whatsappNumber' => $row['whatsapp_number'],
        'instagramUrl' => $row['instagram_url'] ?? '',
        'facebookUrl' => $row['facebook_url'] ?? '',
        'twitterUrl' => $row['twitter_url'] ?? '',
        'snapchatUrl' => $row['snapchat_url'] ?? '',
        'linkedinUrl' => $row['linkedin_url'] ?? '',
        'tiktokUrl' => $row['tiktok_url'] ?? '',
        'defaultCurrency' => $row['default_currency'] ?? 'GHS',
        'autoAssignChat' => isset($row['auto_assign_chat']) ? (bool) $row['auto_assign_chat'] : true,
        'tawkPropertyId' => $row['tawk_property_id'] ?? '',
        'tawkWidgetId' => $row['tawk_widget_id'] ?? '',
        'heroTitle' => $row['hero_title'],
        'heroSubtitle' => $row['hero_subtitle'],
    ];
}

function map_profile(array $row): array
{
    return [
        'userId' => $row['user_id'],
        'fullName' => $row['full_name'],
        'email' => $row['email'],
        'phone' => $row['phone'],
        'dateOfBirth' => $row['date_of_birth'],
        'nationality' => $row['nationality'],
        'passportNumber' => $row['passport_number'],
        'preferredContactMethod' => $row['preferred_contact_method'],
        'profilePhotoUrl' => $row['profile_photo_url'],
        'communicationPreferences' => [
            'email' => (bool) $row['comm_email'],
            'whatsapp' => (bool) $row['comm_whatsapp'],
            'sms' => (bool) $row['comm_sms'],
        ],
        'updatedAt' => $row['updated_at'],
    ];
}

function uploads_public_path(string $fileName): string
{
    $config = require __DIR__ . '/config.php';
    return rtrim($config['uploads_public_path'], '/') . '/' . $fileName;
}

function require_string(array $body, string $key, int $min = 1, int $max = 1000): string
{
    $value = trim((string) ($body[$key] ?? ''));
    $length = function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    if ($length < $min || $length > $max) {
        respond(['error' => "Invalid value supplied for {$key}."], 422);
    }

    return $value;
}

function require_email(array $body, string $key = 'email'): string
{
    $email = strtolower(trim((string) ($body[$key] ?? '')));
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(['error' => 'Enter a valid email address.'], 422);
    }

    return $email;
}

function optional_string(array $body, string $key, int $max = 5000): ?string
{
    $value = trim((string) ($body[$key] ?? ''));
    if ($value === '') {
        return null;
    }

    $length = function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    if ($length > $max) {
        respond(['error' => "Invalid value supplied for {$key}."], 422);
    }

    return $value;
}

function bool_value(mixed $value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    if (is_numeric($value)) {
        return (int) $value === 1;
    }

    $normalized = strtolower(trim((string) $value));
    return in_array($normalized, ['1', 'true', 'yes', 'on'], true);
}

function decode_json_array(?string $value): array
{
    if (!$value) {
        return [];
    }

    $decoded = json_decode($value, true);
    return is_array($decoded) ? $decoded : [];
}

function validate_upload(array $file): void
{
    $config = require __DIR__ . '/config.php';
    $allowedTypes = $config['allowed_upload_types'] ?? [];
    $maxUploadBytes = (int) ($config['max_upload_bytes'] ?? 0);
    $allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'docx'];

    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        respond(['error' => 'The file could not be uploaded.'], 422);
    }

    if ($maxUploadBytes > 0 && (int) ($file['size'] ?? 0) > $maxUploadBytes) {
        respond(['error' => 'Uploaded files are too large.'], 422);
    }

    $type = (string) ($file['type'] ?? '');
    if ($type && !in_array($type, $allowedTypes, true)) {
        respond(['error' => 'This file type is not allowed.'], 422);
    }

    $extension = strtolower(pathinfo((string) ($file['name'] ?? ''), PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        respond(['error' => 'The file extension is not allowed.'], 422);
    }

    if (function_exists('finfo_open') && is_uploaded_file((string) ($file['tmp_name'] ?? ''))) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $detectedType = $finfo ? finfo_file($finfo, $file['tmp_name']) : false;
        if ($finfo) {
            finfo_close($finfo);
        }

        if ($detectedType && !in_array($detectedType, $allowedTypes, true)) {
            respond(['error' => 'The uploaded file content does not match an allowed type.'], 422);
        }
    }
}

function rate_limit(string $key, int $maxAttempts, int $windowSeconds): void
{
    $bucketKey = 'rate_limit_' . $key;
    $bucket = $_SESSION[$bucketKey] ?? ['count' => 0, 'first' => time()];
    $now = time();

    if (($now - (int) $bucket['first']) > $windowSeconds) {
        $bucket = ['count' => 0, 'first' => $now];
    }

    if ((int) $bucket['count'] >= $maxAttempts) {
        respond(['error' => 'Too many attempts. Please wait and try again.'], 429);
    }

    $bucket['count'] = (int) $bucket['count'] + 1;
    $_SESSION[$bucketKey] = $bucket;
}

function clear_rate_limit(string $key): void
{
    unset($_SESSION['rate_limit_' . $key]);
}

function create_password_reset_token(PDO $pdo, string $userId): string
{
    $config = require __DIR__ . '/config.php';
    $ttlMinutes = (int) ($config['password_reset_ttl_minutes'] ?? 30);
    $token = bin2hex(random_bytes(32));
    $expiresAt = gmdate('c', time() + ($ttlMinutes * 60));
    $stmt = $pdo->prepare('INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        'reset-' . bin2hex(random_bytes(8)),
        $userId,
        password_hash($token, PASSWORD_BCRYPT),
        $expiresAt,
        gmdate('c'),
    ]);

    return $token;
}

function consume_password_reset_token(PDO $pdo, string $token): ?array
{
    $stmt = $pdo->query('SELECT * FROM password_reset_tokens WHERE used_at IS NULL ORDER BY created_at DESC');
    $records = $stmt->fetchAll();
    foreach ($records as $record) {
        if (password_verify($token, $record['token_hash'])) {
            if (strtotime((string) $record['expires_at']) < time()) {
                return null;
            }
            return $record;
        }
    }

    return null;
}

function write_audit_log(PDO $pdo, ?string $actorUserId, string $actorRole, string $action, string $targetType, ?string $targetId, string $summary): void
{
    $stmt = $pdo->prepare('INSERT INTO audit_logs (id, actor_user_id, actor_role, action_key, target_type, target_id, summary, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        'audit-' . bin2hex(random_bytes(8)),
        $actorUserId,
        $actorRole,
        $action,
        $targetType,
        $targetId,
        $summary,
        gmdate('c'),
    ]);
}
