
<?php

session_start();

header("Content-Type: application/json");

// Allow requests from any origin
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Use shared DB connection
require_once __DIR__ . "/../db.php";

// Load QR library
require_once __DIR__ . "/vendor/phpqrcode/qrlib.php";

// Get POST data
$data = json_decode(file_get_contents("php://input"), true);
$stID = $data["studentID"];
$f_name = $data["FirstName"];
$l_name = $data["LastName"];
$tel = $data["ContactNum"];
$email = $data["Email"];
$dob = $data["DOB"];
$address = $data["Address"];
$p_name = $data["ParentName"];
$p_tel = $data["ParentTelNum"];
$relationship = $data["Relationship"];
$photoBase64 = $data["Photo"] ?? null;

// Upload directory
$uploadDir = __DIR__ . "/uploads/";
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
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

// Create QR code image
QRcode::png($stID, $qrFullPath, QR_ECLEVEL_L, 10, 2);
$qrPath = "uploads/" . $qrFileName; // Save relative path for DB

// username is the student id
$username = $stID;

//password is : email first part + @ sign + first name + date of birth (without dashes)
$password = substr($email, 0, strpos($email, '@')) . '@' . $f_name . str_replace('-', '', $dob);

// example: email: example@gmail.com, first name: John, date of birth: 2000-01-01, password: example@John20000101

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$role = 'Student';

// Validate required fields
if (empty($stID) || empty($f_name) || empty($l_name) || empty($email) || empty($dob)) {
    echo json_encode(["success" => false, "message" => "Required fields are missing"]);
    exit();
}

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
    $stmtRegister->bindParam(6, $dob, PDO::PARAM_STR);
    $stmtRegister->bindParam(7, $address, PDO::PARAM_STR);
    $stmtRegister->bindParam(8, $p_name, PDO::PARAM_STR);
    $stmtRegister->bindParam(9, $p_tel, PDO::PARAM_STR);
    $stmtRegister->bindParam(10, $relationship, PDO::PARAM_STR);
    $stmtRegister->bindParam(11, $photoPath, PDO::PARAM_STR);
    $stmtRegister->bindParam(12, $qrPath, PDO::PARAM_STR);
    $stmtRegister->execute();

    // Insert into clients_login table
    $sqlLogin = "INSERT INTO clients_login (username, Email, password, role) VALUES (?, ?, ?, ?)";  
    $stmtLogin = $pdo->prepare($sqlLogin);
    $stmtLogin->bindParam(1, $username, PDO::PARAM_STR);
    $stmtLogin->bindParam(2, $email, PDO::PARAM_STR);
    $stmtLogin->bindParam(3, $hashedPassword, PDO::PARAM_STR);
    $stmtLogin->bindParam(4, $role, PDO::PARAM_STR);
    $stmtLogin->execute();

    // Commit transaction
    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Student registered successfully",
        "photo_url" => $photoPath,
        "qr_url" => $qrPath
    ]);
} catch (PDOException $e) {
    // Rollback transaction on error
    $pdo->rollback();
    
    $errorInfo = isset($e->errorInfo) ? $e->errorInfo : null;
    $sqlState = $errorInfo[0] ?? null;
    $driverCode = $errorInfo[1] ?? null;
    $driverMessage = $errorInfo[2] ?? $e->getMessage();

    if ($sqlState === '23000' && (int)$driverCode === 1062) {
        $message = "A record with the same value already exists.";
        if (strpos($driverMessage, "Email") !== false) {
            $message = "Email is already registered.";
        } elseif (strpos($driverMessage, "studentID") !== false) {
            $message = "Student ID is already registered.";
        } elseif (strpos($driverMessage, "ContactNum") !== false) {
            $message = "Contact number is already registered.";
        } elseif (strpos($driverMessage, "username") !== false) {
            $message = "Username is already taken.";
        }
        echo json_encode(["success" => false, "message" => $message]);
    } else {
        echo json_encode(["success" => false, "message" => "Something went wrong. Please try again."]);
    }

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
$pdo = null;
?>
