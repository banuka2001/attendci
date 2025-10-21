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
    
    // Get student's enrolled classes
    $stmt = $pdo->prepare("
        SELECT 
            sc.ClassID,
            sc.RegisterDate, 
            cr.ClassName, 
            cr.ClassSubject, 
            cr.ClassPrice, 
            tr.FirstName 
        FROM
            studentclasses AS sc 
        LEFT JOIN 
            classregister AS cr 
        ON sc.ClassID = cr.ClassID 
        LEFT JOIN 
            teacherregister AS tr 
        ON cr.TeacherID = tr.TeacherID 
        WHERE sc.StudentID = ?
    ");
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->execute();
    $classes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $classes
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_student_classes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again.'
    ]);
} catch (Exception $e) {
    error_log("General error in get_student_classes.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred. Please try again.'
    ]);
}
?>

