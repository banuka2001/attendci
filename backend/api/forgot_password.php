<?php
session_start();
header("Content-Type: application/json");

require __DIR__ . '/PHPMailer-6.10.0/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-6.10.0/src/SMTP.php';
require __DIR__ . '/PHPMailer-6.10.0/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$host = "localhost";
$user = "root";
$pass = "";
$db   = "attendci";
$conn = new mysqli($host, $user, $pass, $db);

// Check database connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$email = $data["Email"] ?? "";

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "message" => "Invalid email format"]);
    exit;
}

// Check if email is empty
if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Email is required"]);
    exit;
}

$stmt = $conn->prepare("SELECT id FROM clients_login WHERE Email = ?");
if (!$stmt) {
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    exit;
}

$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["success" => false, "message" => "Email not found"]);
    exit;
}

// Generate reset code
$resetCode = rand(100000, 999999);
$_SESSION['reset_code'] = $resetCode;
$_SESSION['reset_email'] = $email;

// Send email
$mail = new PHPMailer();
$mail->SMTPDebug = 0; // Set to 0 for production, 2 for debugging
$mail->Debugoutput = 'error_log'; // send debug output to PHP error log

$mail->isSMTP();
$mail->Host = 'smtp.gmail.com';
$mail->SMTPAuth = true;
$mail->Username = 'tharushagimhan01@gmail.com'; // Your Gmail address
$mail->Password = 'tqqlngkrrzpuswrm';   // Gmail App Password (not your Gmail password)
$mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
$mail->Port = 587;

$mail->setFrom('tharushagimhan01@gmail.com', 'attendci');
$mail->addAddress($email);
$mail->Subject = 'Password Reset Code';
$mail->Body    = "Your password reset code is: $resetCode";

if ($mail->send()) {
    echo json_encode(["success" => true, "message" => "Reset code sent to your email"]);
} else {
    error_log($mail->ErrorInfo); // Log error for debugging
    echo json_encode(["success" => false, "message" => "Failed to send reset email. Please try again later."]);
}

$stmt->close();
$conn->close();
?>