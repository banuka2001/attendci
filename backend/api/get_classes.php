<?php
session_start();
header("Content-Type: application/json");
require_once __DIR__ . '/cors.php';

// Only allow GET requests (or CLI for testing)
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Use shared DB connection
require_once __DIR__ . "/../db.php";

try {
    // SQL query to get classes with teacher names using LEFT JOIN
    $sql = "
        SELECT 
            c.ClassID, 
            c.ClassName, 
            c.ClassSubject, 
            c.ClassBatch, 
            c.ClassPrice, 
            CONCAT(t.FirstName, ' ', t.LastName) AS TeacherName
        FROM classregister c
        LEFT JOIN teacherregister t ON c.TeacherID = t.TeacherID
    ";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($classes)) {
        echo json_encode([
            "success" => true, 
            "data" => $classes
        ]);
    } else {
        echo json_encode([
            "success" => false, 
            "message" => "No classes found"
        ]);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database error occurred. Please try again.'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'An unexpected error occurred. Please try again.'
    ]);
}

// Cleanup
$stmt = null;
$pdo = null;
?>
