<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . '/cors.php';

// Check if the user is logged in and has the 'Admin' role.
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'Admin') {
    http_response_code(403); // Forbidden
    echo json_encode([
        'success' => false,
        'message' => 'Access denied. You do not have permission to view this content.'
    ]);
    exit();
}

// If the user is an admin, return some protected data.
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Welcome, Admin! Here is the secret data.',
    'data' => [
        'total_users' => '...',
        'monthly_revenue' => '...'
    ]
]);
?>
