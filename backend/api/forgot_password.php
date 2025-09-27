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

require __DIR__ . '/../db.php';
require __DIR__ . '/PHPMailer-6.10.0/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-6.10.0/src/SMTP.php';
require __DIR__ . '/PHPMailer-6.10.0/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

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

// Check for 30-second cooldown
if (isset($_SESSION['last_reset_time']) && isset($_SESSION['reset_email']) && $_SESSION['reset_email'] === $email) {
    $timeDiff = time() - $_SESSION['last_reset_time'];
    if ($timeDiff < 60) {
        $remainingTime = 60 - $timeDiff;
        echo json_encode(["success" => false, "message" => "Please wait {$remainingTime} seconds before requesting another reset code"]);
        exit;
    }
}

try {
    $stmt = $pdo->prepare("SELECT id FROM clients_login WHERE Email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->rowCount() === 0) {
        echo json_encode(["success" => false, "message" => "Email not found"]);
        exit;
    }
} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error occurred"]);
    exit;
}

// Generate reset code
$resetCode = rand(100000, 999999);
$_SESSION['reset_code'] = $resetCode;
$_SESSION['reset_email'] = $email;
$_SESSION['last_reset_time'] = time();

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
?>