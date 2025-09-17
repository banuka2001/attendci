<?php

session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Use shared DB connection
require_once __DIR__ . "/../db.php";

try {
    // Get POST data
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate that we have data
    if (!$data) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
        exit();
    }

    // Extract and validate required fields
    $classID = trim($data["ClassID"] ?? '');
    $className = trim($data["ClassName"] ?? '');
    $classSubject = trim($data["ClassSubject"] ?? '');
    $classBatch = trim($data["ClassBatch"] ?? '');
    $classPrice = $data["ClassPrice"] ?? '';
    $teacherID = trim($data["TeacherID"] ?? '');

    // Validate required fields
    $requiredFields = [
        'ClassID' => $classID,
        'ClassName' => $className,
        'ClassSubject' => $classSubject,
        'ClassBatch' => $classBatch,
        'ClassPrice' => $classPrice,
        'TeacherID' => $teacherID
    ];

    $missingFields = [];
    foreach ($requiredFields as $field => $value) {
        if (empty($value)) {
            $missingFields[] = $field;
        }
    }

    if (!empty($missingFields)) {
        http_response_code(400);
        echo json_encode([
            'success' => false, 
            'message' => 'Missing required fields: ' . implode(', ', $missingFields)
        ]);
        exit();
    }

    // Validate ClassPrice is a valid number
    if (!is_numeric($classPrice) || floatval($classPrice) < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Class Price must be a valid positive number']);
        exit();
    }

    // Check if ClassID already exists
    $stmtCheckClass = $pdo->prepare("SELECT COUNT(*) FROM classregister WHERE ClassID = ?");
    $stmtCheckClass->bindParam(1, $classID, PDO::PARAM_STR);
    $stmtCheckClass->execute();
    $classExists = $stmtCheckClass->fetchColumn();

    if ($classExists > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Class ID already exists. Please use a different Class ID.']);
        exit();
    }

    // Check if TeacherID exists in teacherregister table
    $stmtCheckTeacher = $pdo->prepare("SELECT COUNT(*) FROM teacherregister WHERE TeacherID = ?");
    $stmtCheckTeacher->bindParam(1, $teacherID, PDO::PARAM_STR);
    $stmtCheckTeacher->execute();
    $teacherExists = $stmtCheckTeacher->fetchColumn();

    if ($teacherExists == 0) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Teacher ID does not exist. Please register the teacher first.']);
        exit();
    }

    // Insert class record
    $stmt = $pdo->prepare("INSERT INTO classregister (ClassID, ClassName, ClassSubject, ClassBatch, ClassPrice, TeacherID) VALUES (?, ?, ?, ?, ?, ?)");
    
    $price = floatval($classPrice);
    $stmt->bindParam(1, $classID, PDO::PARAM_STR);
    $stmt->bindParam(2, $className, PDO::PARAM_STR);
    $stmt->bindParam(3, $classSubject, PDO::PARAM_STR);
    $stmt->bindParam(4, $classBatch, PDO::PARAM_STR);
    $stmt->bindParam(5, $price, PDO::PARAM_STR);
    $stmt->bindParam(6, $teacherID, PDO::PARAM_STR);
    
    $result = $stmt->execute();

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Class registered successfully',
            'data' => [
                'ClassID' => $classID,
                'ClassName' => $className,
                'ClassSubject' => $classSubject,
                'ClassBatch' => $classBatch,
                'ClassPrice' => floatval($classPrice),
                'TeacherID' => $teacherID
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Failed to register class. Please try again.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error occurred. Please try again.']);
    
    // Log error for debugging (in production, use proper logging)
    error_log("Class registration error: " . $e->getMessage());
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'An unexpected error occurred. Please try again.']);
    
    // Log error for debugging
    error_log("Class registration error: " . $e->getMessage());
}

// Cleanup
$stmt = null;
$pdo = null;
?>
