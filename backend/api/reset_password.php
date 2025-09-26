<?php
// Disable HTML error output and enable JSON-only responses
ini_set('display_errors', 0);
ini_set('html_errors', 0);
error_reporting(E_ALL);

// Start session
session_start();

// Set JSON header immediately
header("Content-Type: application/json");

// Custom error handler to return JSON errors
function handleError($errno, $errstr, $errfile, $errline) {
    $errorData = [
        "success" => false,
        "message" => "Server error occurred",
        "error" => $errstr,
        "file" => basename($errfile),
        "line" => $errline,
        "type" => "PHP Error",
        "debug_info" => [
            "session_status" => session_status(),
            "session_data" => isset($_SESSION) ? array_keys($_SESSION) : [],
            "post_data" => file_get_contents("php://input"),
            "request_method" => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
        ]
    ];
    echo json_encode($errorData);
    exit;
}

// Set custom error handler
set_error_handler('handleError');

// Custom exception handler
function handleException($exception) {
    $errorData = [
        "success" => false,
        "message" => "Server error occurred",
        "error" => $exception->getMessage(),
        "file" => basename($exception->getFile()),
        "line" => $exception->getLine(),
        "type" => "Exception",
        "debug_info" => [
            "session_status" => session_status(),
            "session_data" => isset($_SESSION) ? array_keys($_SESSION) : [],
            "post_data" => file_get_contents("php://input"),
            "request_method" => $_SERVER['REQUEST_METHOD'] ?? 'unknown'
        ]
    ];
    echo json_encode($errorData);
    exit;
}

// Set custom exception handler
set_exception_handler('handleException');

try {
    $host = "localhost";
    $user = "root";
    $pass = "";
    $db   = "attendci";
    $conn = new mysqli($host, $user, $pass, $db);

    // Check database connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // Get the raw POST data
    $raw_data = file_get_contents("php://input");
    
    $data = json_decode($raw_data, true);

    // Check if JSON decoding was successful
    if ($data === null) {
        throw new Exception("Invalid request data: " . json_last_error_msg());
    }

    $resetCode = $data["resetCode"] ?? "";
    $newPassword = $data["newPassword"] ?? "";
    $confirmPassword = $data["confirmPassword"] ?? "";

    // Debug: Log incoming data
    error_log("Reset password attempt - Code: $resetCode, Email: " . ($_SESSION['reset_email'] ?? 'not set'));

    // Validate input
    if (empty($resetCode) || empty($newPassword) || empty($confirmPassword)) {
        throw new Exception("All fields are required");
    }

    // Check if passwords match
    if ($newPassword !== $confirmPassword) {
        throw new Exception("Passwords do not match");
    }

    // Validate password length (minimum 6 characters)
    if (strlen($newPassword) < 6) {
        throw new Exception("Password must be at least 6 characters long");
    }

    // Check if reset code exists in session
    if (!isset($_SESSION['reset_code']) || !isset($_SESSION['reset_email'])) {
        throw new Exception("Invalid or expired reset session. Please request a new reset code.");
    }

    // Verify reset code
    if ($_SESSION['reset_code'] != $resetCode) {
        throw new Exception("Invalid reset code. Please check your email and try again.");
    }

    $email = $_SESSION['reset_email'];

    // Hash the new password
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // Update password in database
    $stmt = $conn->prepare("UPDATE clients_login SET Password = ? WHERE Email = ?");
    if (!$stmt) {
        throw new Exception("Database error occurred: " . $conn->error);
    }

    $stmt->bind_param("ss", $hashedPassword, $email);

    if ($stmt->execute()) {
        // Clear session variables
        unset($_SESSION['reset_code']);
        unset($_SESSION['reset_email']);
        
        $responseData = ["success" => true, "message" => "Password updated successfully"];
        echo json_encode($responseData);
    } else {
        throw new Exception("Failed to update password: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // Exception will be caught by the exception handler
    throw $e;
}
?>