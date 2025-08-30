<?php
include '../db.php';


// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(0);
}


$data = json_decode(file_get_contents("php://input"));

$username = $data->username;
$email = $data->email;
$password = $data->password;
$role = $data->role ?? 'Student'; // Default to 'Student' if not provided

// Security enhancement: Prevent Admin registration from this public endpoint
if ($role === 'Admin') {
    http_response_code(403); // Forbidden
    echo json_encode(['success' => false, 'message' => 'Admin registration is not allowed from this form.']);
    exit();
}

$email = filter_var($email, FILTER_VALIDATE_EMAIL);
$password = password_hash($password, PASSWORD_DEFAULT);

// Validate role
$allowed_roles = ['Employee', 'Student']; // Admin is intentionally omitted
if (!in_array($role, $allowed_roles)) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => "Invalid role specified."]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO clients_login (username, Email, password, role) VALUES (:username, :email, :password, :role)");
    $stmt->execute(['username' => $username, 'email' => $email, 'password' => $password, 'role' => $role]);

    if ($stmt->rowCount()) {

        echo json_encode(['success' => true, 'message' => "Registration successful. Redirecting..."]);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => "Registration failed. Could not create user."]);
    }
} catch (PDOException $e) {
    // Check if it's a duplicate entry error (error code 1062)
    if ($e->errorInfo[1] == 1062) {
        http_response_code(409); // Conflict
        echo json_encode(['success' => false, 'message' => "This email is already registered."]);
    } else {
        http_response_code(500); // Internal Server Error
        echo json_encode(['success' => false, 'message' => "Registration failed due to a server error."]);
    }
}

?>