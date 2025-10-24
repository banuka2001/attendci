<?php
session_start();
header("Content-Type: application/json");
require_once __DIR__ . '/cors.php';
require_once __DIR__ . "/../db.php";

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized access'
    ]);
    exit();
}

try {
    $user_id = $_SESSION['user_id'];
    
    // Get user data from clients_login table
    $stmt = $pdo->prepare("SELECT username, role FROM clients_login WHERE id = ?");
    $stmt->bindParam(1, $user_id, PDO::PARAM_INT);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || $user['role'] !== 'Student') {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'message' => 'Access denied. Student role required.'
        ]);
        exit();
    }
    
    $studentID = $user['username']; // username is the student ID
    
    // Check if we need to fetch all payments or just the latest 3
    $fetchAll = isset($_GET['all']) && $_GET['all'] === 'true';
    
    if ($fetchAll) {
        // Get all payment history with ClassID
        $stmt = $pdo->prepare("
            SELECT 
                p.PaymentID,
                p.ClassID,
                p.Payment as Amount,
                p.PaymentDate,
                p.Year,
                p.Month,
                c.ClassName,
                c.ClassSubject
            FROM payment p
            LEFT JOIN classregister c ON p.ClassID = c.ClassID
            WHERE p.StudentID = ?
            ORDER BY p.PaymentDate DESC
        ");
    } else {
        // Get payment history (newest 3 entries)
        $stmt = $pdo->prepare("
            SELECT 
                p.PaymentID,
                p.Payment as Amount,
                p.PaymentDate,
                p.Year,
                p.Month,
                c.ClassName,
                c.ClassSubject
            FROM payment p
            LEFT JOIN classregister c ON p.ClassID = c.ClassID
            WHERE p.StudentID = ?
            ORDER BY p.PaymentDate DESC
            LIMIT 3
        ");
    }
    
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->execute();
    $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $payments
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_payment_history.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again.'
    ]);
} catch (Exception $e) {
    error_log("General error in get_payment_history.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred. Please try again.'
    ]);
}
?>
