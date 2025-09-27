<?php
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

// Use shared DB connection
require_once __DIR__ . "/../db.php";

$data = json_decode(file_get_contents("php://input"), true);

// Validate JSON data
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Check if required fields exist
$requiredFields = ['TeacherID', 'FirstName', 'LastName', 'Subject', 'Email', 'ContactNumber'];
$missingFields = [];

foreach ($requiredFields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields: ' . implode(', ', $missingFields)]);
    exit();
}

$tID = trim($data["TeacherID"]);
$f_name = trim($data["FirstName"]);
$l_name = trim($data["LastName"]);
$subject = trim($data["Subject"]);
$email = trim($data["Email"]);
$tel = trim($data["ContactNumber"]);

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate phone number format
if (!preg_match('/^[0-9+\-\s()]{7,15}$/', $tel)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid phone number format']);
    exit();
}

// Validate name lengths
if (strlen($f_name) < 2 || strlen($f_name) > 50 || strlen($l_name) < 2 || strlen($l_name) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'First name and last name must be between 2 and 50 characters']);
    exit();
}

try {
    // Check for duplicate TeacherID
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM teacherregister WHERE TeacherID = ?");
    $stmtCheck->execute([$tID]);
    $count = $stmtCheck->fetchColumn();

    if ($count > 0) {
        echo json_encode(["success" => false, "message" => "Teacher ID already exists"]);
        exit;
    }

    // Insert new teacher
    $stmt = $pdo->prepare("INSERT INTO teacherregister (TeacherID, FirstName, LastName, Subject, Email, ContactNumber) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$tID, $f_name, $l_name, $subject, $email, $tel]);

    if ($stmt->rowCount() > 0) {
        echo json_encode(["success" => true, "message" => "Teacher registered successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to register teacher"]);
    }
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>