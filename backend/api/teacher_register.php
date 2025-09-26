<?php
header("Content-Type: application/json");
$host = "localhost";
$user = "root";
$pass = "";
$db   = "attendci";

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed: " . $conn->connect_error]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$tID = $data["TeacherID"];
$f_name = $data["FirstName"];
$l_name = $data["LastName"];
$subject = $data["Subject"];
$email = $data["Email"];
$tel = $data["ContactNumber"];

// Check for duplicate TeacherID
$stmtCheck = $conn->prepare("SELECT COUNT(*) FROM teacherregister WHERE TeacherID = ?");
$stmtCheck->bind_param("s", $tID);
$stmtCheck->execute();
$stmtCheck->bind_result($count);
$stmtCheck->fetch();
$stmtCheck->close();

if ($count > 0) {
    echo json_encode(["success" => false, "message" => "Teacher ID already exists"]);
    exit;
}

// Insert new teacher
$stmt = $conn->prepare("INSERT INTO teacherregister (TeacherID, FirstName, LastName, Subject, Email, ContactNumber) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssssss", $tID, $f_name, $l_name, $subject, $email, $tel);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Teacher registered successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error: " . $stmt->error]);
}
$stmt->close();
$conn->close();
?>