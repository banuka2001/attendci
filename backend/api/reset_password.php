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
    // Use shared DB connection
    require_once __DIR__ . "/../db.php";

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
    $stmt = $pdo->prepare("UPDATE clients_login SET Password = ? WHERE Email = ?");
    $stmt->bindParam(1, $hashedPassword, PDO::PARAM_STR);
    $stmt->bindParam(2, $email, PDO::PARAM_STR);
    $stmt->execute();   

    if ($stmt->rowCount() > 0) {
        // Clear session variables
        unset($_SESSION['reset_code']);
        unset($_SESSION['reset_email']);
        unset($_SESSION['last_reset_time']);
        
        $responseData = ["success" => true, "message" => "Password updated successfully"];
        echo json_encode($responseData);
    } else {
        throw new Exception("Failed to update password. Email not found or no changes made.");
    }

} catch (Exception $e) {
    // Exception will be caught by the exception handler
    throw $e;
}
?>