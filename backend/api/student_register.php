
<?php
session_start();
header("Content-Type: application/json");
require_once __DIR__ . '/cors.php';

// Use shared DB connection
require_once __DIR__ . "/../db.php";

// Load QR library
require_once __DIR__ . "/vendor/phpqrcode/qrlib.php";

// Load PHPMailer
require __DIR__ . '/PHPMailer-6.10.0/src/PHPMailer.php';
require __DIR__ . '/PHPMailer-6.10.0/src/SMTP.php';
require __DIR__ . '/PHPMailer-6.10.0/src/Exception.php';
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 1);



// Get POST data
$data = json_decode(file_get_contents("php://input"), true);

// Validate JSON data
if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid JSON data']);
    exit();
}

// Extract and trim input data
$stID = trim($data["studentID"] ?? '');
$f_name = trim($data["FirstName"] ?? '');
$l_name = trim($data["LastName"] ?? '');
$tel = trim($data["ContactNum"] ?? '');
$email = trim($data["Email"] ?? '');
$dob = trim($data["DOB"] ?? '');
$address = trim($data["Address"] ?? '');
$p_name = trim($data["ParentName"] ?? '');
$p_tel = trim($data["ParentTelNum"] ?? '');
$relationship = trim($data["Relationship"] ?? '');
$photoBase64 = $data["Photo"] ?? null;

// Validate required fields
$requiredFields = [
    'studentID' => $stID,
    'FirstName' => $f_name,
    'LastName' => $l_name,
    'ContactNum' => $tel,
    'Email' => $email,
    'DOB' => $dob
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

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit();
}

// Validate Sri Lankan phone number format (student)
// Accepts formats: 0771234567, +94771234567, 0112345678, 011-234-5678
if (!preg_match('/^(\+94|0)?[0-9]{9}$/', $tel)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid contact number format. Use format: 0771234567 or +94771234567']);
    exit();
}

// Validate Sri Lankan parent phone number format (if provided)
if (!empty($p_tel) && !preg_match('/^(\+94|0)?[0-9]{9}$/', $p_tel)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid parent contact number format. Use format: 0771234567 or +94771234567']);
    exit();
}

// Validate name lengths
if (strlen($f_name) < 2 || strlen($f_name) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'First name must be between 2 and 50 characters']);
    exit();
}

if (strlen($l_name) < 2 || strlen($l_name) > 50) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Last name must be between 2 and 50 characters']);
    exit();
}

// Validate parent name length (if provided)
if (!empty($p_name) && (strlen($p_name) < 2 || strlen($p_name) > 50)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parent name must be between 2 and 50 characters']);
    exit();
}

// Validate date of birth format (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dob)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date of birth must be in YYYY-MM-DD format']);
    exit();
}

// Validate date is not in the future
if (strtotime($dob) > time()) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Date of birth cannot be in the future']);
    exit();
}

// Validate student ID format (numbers only, 3-20 characters)
if (!preg_match('/^[0-9]{3,20}$/', $stID)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Student ID must be 3-20 numbers only']);
    exit();
}

// Upload directory
$uploadDir = __DIR__ . "/uploads/";
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) {
        error_log("Failed to create uploads directory");
    }
}

// Save student photo if provided
$photoPath = null;
if ($photoBase64) {
    $imageData = base64_decode($photoBase64);
    $fileName = $stID . "_" . time() . ".jpg";
    $fullPath = $uploadDir . $fileName;
    if (file_put_contents($fullPath, $imageData)) {
        $photoPath = "uploads/" . $fileName; // save relative path
    }
}

// Generate QR Code
$qrFileName = "qr_" . $stID . "_" . time() . ".png";
$qrFullPath = $uploadDir . $qrFileName;
$qrPath = null;

try {
    // Create QR code image
    QRcode::png($stID, $qrFullPath, QR_ECLEVEL_L, 10, 2);
    $qrPath = "uploads/" . $qrFileName; // Save relative path for DB
} catch (Exception $e) {
    // If QR generation fails, continue without QR code
    error_log("QR generation failed: " . $e->getMessage());
    $qrPath = null;
}

// username is the student id
$username = $stID;

//password is : email first part + @ sign + first name + date of birth (without dashes)
$password = substr($email, 0, strpos($email, '@')) . '@' . $f_name . str_replace('-', '', $dob);

// example: email: example@gmail.com, first name: John, date of birth: 2000-01-01, password: example@John20000101
// pahan@Pahan20060601

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$role = 'Student';

// Check for duplicate StudentID before processing
try {
    $stmtCheckStudent = $pdo->prepare("SELECT COUNT(*) FROM studentregister WHERE studentID = ?");
    $stmtCheckStudent->bindParam(1, $stID, PDO::PARAM_STR);
    $stmtCheckStudent->execute();
    $studentExists = $stmtCheckStudent->fetchColumn();

    if ($studentExists > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Student ID already exists. Please use a different Student ID.']);
        exit();
    }

    // Check for duplicate email
    $stmtCheckEmail = $pdo->prepare("SELECT COUNT(*) FROM studentregister WHERE Email = ?");
    $stmtCheckEmail->bindParam(1, $email, PDO::PARAM_STR);
    $stmtCheckEmail->execute();
    $emailExists = $stmtCheckEmail->fetchColumn();

    if ($emailExists > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email is already registered. Please use a different email.']);
        exit();
    }

    // Check for duplicate email in clients_login table
    $stmtCheckEmailLogin = $pdo->prepare("SELECT COUNT(*) FROM clients_login WHERE Email = ?");
    $stmtCheckEmailLogin->bindParam(1, $email, PDO::PARAM_STR);
    $stmtCheckEmailLogin->execute();
    $emailExistsInLogin = $stmtCheckEmailLogin->fetchColumn();

    if ($emailExistsInLogin > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Email is already registered. Please use a different email.']);
        exit();
    }

    // Check for duplicate username in clients_login table
    $stmtCheckUsername = $pdo->prepare("SELECT COUNT(*) FROM clients_login WHERE username = ?");
    $stmtCheckUsername->bindParam(1, $username, PDO::PARAM_STR);
    $stmtCheckUsername->execute();
    $usernameExists = $stmtCheckUsername->fetchColumn();

    if ($usernameExists > 0) {
        http_response_code(409);
        echo json_encode(['success' => false, 'message' => 'Username (Student ID) is already registered. Please use a different Student ID.']);
        exit();
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Database validation error occurred. Please try again.'
    ]);
    exit();
}

// Convert DOB string to datetime format for database
$dob_datetime = $dob . ' 00:00:00'; // Convert YYYY-MM-DD to YYYY-MM-DD HH:MM:SS

// Start transaction
$pdo->beginTransaction();

try {
    // Insert into studentregister table
    $sqlRegister = "INSERT INTO studentregister 
    (studentID, FirstName, LastName, ContactNum, Email, DOB, Address, ParentName, ParentTelNum, 
     Relationship, PhotoPath, QRPath) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmtRegister = $pdo->prepare($sqlRegister);
    $stmtRegister->bindParam(1, $stID, PDO::PARAM_STR);
    $stmtRegister->bindParam(2, $f_name, PDO::PARAM_STR);
    $stmtRegister->bindParam(3, $l_name, PDO::PARAM_STR);
    $stmtRegister->bindParam(4, $tel, PDO::PARAM_STR);
    $stmtRegister->bindParam(5, $email, PDO::PARAM_STR);
    $stmtRegister->bindParam(6, $dob_datetime, PDO::PARAM_STR);
    $stmtRegister->bindParam(7, $address, PDO::PARAM_STR);
    $stmtRegister->bindParam(8, $p_name, PDO::PARAM_STR);
    $stmtRegister->bindParam(9, $p_tel, PDO::PARAM_STR);
    $stmtRegister->bindParam(10, $relationship, PDO::PARAM_STR);
    $stmtRegister->bindParam(11, $photoPath, PDO::PARAM_STR);
    $stmtRegister->bindParam(12, $qrPath, PDO::PARAM_STR);
    
    if (!$stmtRegister->execute()) {
        throw new Exception("Failed to insert into studentregister table");
    }

    // Insert into clients_login table
    $sqlLogin = "INSERT INTO clients_login (username, Email, password, role) VALUES (?, ?, ?, ?)";  
    $stmtLogin = $pdo->prepare($sqlLogin);
    $stmtLogin->bindParam(1, $username, PDO::PARAM_STR);
    $stmtLogin->bindParam(2, $email, PDO::PARAM_STR);
    $stmtLogin->bindParam(3, $hashedPassword, PDO::PARAM_STR);
    $stmtLogin->bindParam(4, $role, PDO::PARAM_STR);
    
    if (!$stmtLogin->execute()) {
        throw new Exception("Failed to insert into clients_login table");
    }

    // Commit transaction
    $pdo->commit();

    // Send welcome email (silently - don't output anything)
    try {
        $mail = new PHPMailer(true);
        
        //Server settings
        $mail->SMTPDebug = 0;                      // Disable debug output
        $mail->isSMTP();                           //Send using SMTP
        $mail->Host       = 'smtp.gmail.com';      //Set the SMTP server to send through
        $mail->SMTPAuth   = true;                  //Enable SMTP authentication
        $mail->Username   = 'shippysally@gmail.com';  //SMTP username
        $mail->Password   = 'tukkzfmyzeabvglr';    //SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;  //Enable implicit TLS encryption
        $mail->Port       = 587;                   //TCP port to connect to

        //Recipients
        $mail->setFrom('shippysally@gmail.com', 'Attendci Registration');
        $mail->addAddress($email, $f_name . ' ' . $l_name);  //Send to student
        
        //Attachments
        $mail->addAttachment($qrFullPath, 'Student_QR.png');
        

        //Content
        $mail->isHTML(true);                       //Set email format to HTML
        $mail->Subject = 'Welcome to Attendci';
        
        // Create email body using HEREDOC for cleaner syntax
        $mail->Body = <<<EOT
                <h3>Dear {$f_name} {$l_name},</h3>

                <p>Your registration has been successfully completed. Your login credentials are as follows:</p>

                <p>Username: {$username}</p>
                <p>Password: {$password}</p>

                <p>Please use these credentials to login to your account.</p>
                <br>
                <p>Attached is your unique QR code. Please keep it safe for attendance and identification purposes.</p>
                <br>
                <p>Regards,<br>Attendci Team</p>
EOT;
        
        $mail->send();
    } catch (Exception $e) {
        // Log error but don't fail the registration
        error_log("Email sending failed: " . $e->getMessage());
    }

    echo json_encode([
        "success" => true,
        "message" => "Student registered successfully",
        "photo_url" => $photoPath,
        "qr_url" => $qrPath
    ]);

} catch (PDOException $e) {
    // Rollback transaction on error
    $pdo->rollback();
    
    // Log error for debugging
    error_log("Student registration PDO error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error occurred: ' . $e->getMessage()
    ]);

    // Cleanup any created files on failure
    if (!empty($photoPath)) {
        $photoFile = $uploadDir . basename($photoPath);
        if (file_exists($photoFile)) {
            @unlink($photoFile);
        }
    }
    if (!empty($qrPath)) {
        $qrFile = $uploadDir . basename($qrPath);
        if (file_exists($qrFile)) {
            @unlink($qrFile);
        }
    }
} catch (Exception $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollback();
    }
    
    // Log error for debugging
    error_log("Student registration error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An unexpected error occurred: ' . $e->getMessage()
    ]);

    // Cleanup any created files on failure
    if (!empty($photoPath)) {
        $photoFile = $uploadDir . basename($photoPath);
        if (file_exists($photoFile)) {
            @unlink($photoFile);
        }
    }
    if (!empty($qrPath)) {
        $qrFile = $uploadDir . basename($qrPath);
        if (file_exists($qrFile)) {
            @unlink($qrFile);
        }
    }
}

// Cleanup
if (isset($stmtRegister)) $stmtRegister = null;
if (isset($stmtLogin)) $stmtLogin = null;
if (isset($pdo)) $pdo = null;
?>
