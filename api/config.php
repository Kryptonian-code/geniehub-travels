<?php

return [
    'db_host' => '127.0.0.1',
    'db_name' => 'geniehub',
    'db_user' => 'root',
    'db_pass' => '',
    'uploads_dir' => __DIR__ . DIRECTORY_SEPARATOR . 'uploads',
    'uploads_public_path' => '/ghanaian-dream-travel-main/api/uploads/',
    'allowed_origins' => [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
    ],
    'allowed_upload_types' => [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    'max_upload_bytes' => 10 * 1024 * 1024,
    'password_reset_ttl_minutes' => 30,
    'auth_rate_limit_attempts' => 6,
    'auth_rate_limit_window_seconds' => 300,
];
