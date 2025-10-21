<?php
// Simple file server for uploaded images
$requestUri = $_SERVER['REQUEST_URI'];
$filePath = parse_url($requestUri, PHP_URL_PATH);

// Remove /api/ prefix if present
$filePath = str_replace('/api/', '', $filePath);

// Security check - only allow files from uploads directory
if (strpos($filePath, 'uploads/') !== 0) {
    http_response_code(403);
    echo 'Access denied';
    exit;
}

$fullPath = __DIR__ . '/' . $filePath;

// Check if file exists
if (!file_exists($fullPath)) {
    http_response_code(404);
    echo 'File not found';
    exit;
}

// Get file extension
$extension = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

// Set appropriate content type
$contentTypes = [
    'jpg' => 'image/jpeg',
    'jpeg' => 'image/jpeg',
    'png' => 'image/png',
    'gif' => 'image/gif'
];

if (isset($contentTypes[$extension])) {
    header('Content-Type: ' . $contentTypes[$extension]);
    header('Content-Length: ' . filesize($fullPath));
    readfile($fullPath);
} else {
    http_response_code(415);
    echo 'Unsupported file type';
}
?>
