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
    
    // Get student profile data
    $stmt = $pdo->prepare("
        SELECT 
            studentID,
            FirstName,
            LastName,
            Email,
            ContactNum,
            PhotoPath,
            QRPath,
            DOB,
            Address,
            ParentName,
            ParentTelNum,
            Relationship
        FROM studentregister 
        WHERE studentID = ?
    ");
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$student) {
        echo json_encode([
            'success' => false,
            'message' => 'Student profile not found'
        ]);
        exit();
    }
    
    // Get enrolled classes count
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as enrolled_count
        FROM studentclasses 
        WHERE StudentID = ?
    ");
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->execute();
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'profile' => $student,
            'enrolled_classes_count' => $enrollment['enrolled_count']
        ]
    ]);
    
} catch (PDOException $e) {
    error_log("Database error in get_student_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred. Please try again.'
    ]);
} catch (Exception $e) {
    error_log("General error in get_student_profile.php: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred. Please try again.'
    ]);
}
?>
