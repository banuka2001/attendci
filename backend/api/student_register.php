
<?php

session_start();

header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

// DB connection
$host = "localhost";
$user = "root";
$pass = "root";
$db   = "attendci";

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]);
    exit;
}

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

// Insert query
$sql = "INSERT INTO studentregister 
(studentID, FirstName, LastName, ContactNum, Email, DOB, Address, ParentName, ParentTelNum, 
 Relationship, PhotoPath, QRPath) 
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param(
    "ssssssssssss",
    $stID, $f_name, $l_name, $tel, $email, $dob, $address, $p_name, $p_tel, $relationship,
    $photoPath, $qrPath
);

if ($stmt->execute()) {
    echo json_encode([
        "success" => true,
        "message" => "Student registered successfully",
        "photo_url" => $photoPath,
        "qr_url" => $qrPath
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
