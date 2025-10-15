<?php
session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
include '../db.php';

// Check if user has an active session
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No active session found.',
        'authenticated' => false
    ]);
    exit();
}

try {
    $user_id = $_SESSION['user_id'];
    
    // Get user data from database
    $stmt = $pdo->prepare("SELECT id, username, role FROM clients_login WHERE id = :user_id");
    $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch();
    
    if (!$user) {
        // User no longer exists in database, destroy session
        session_destroy();
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'User account not found.',
            'authenticated' => false
        ]);
        exit();
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Session is valid.',
        'authenticated' => true,
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ]);
    
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error during session validation: ' . $e->getMessage(),
        'authenticated' => false
    ]);
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Session validation error: ' . $e->getMessage(),
        'authenticated' => false
    ]);
}
?>
