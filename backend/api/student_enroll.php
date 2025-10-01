<?php

session_start();
header("Content-Type: application/json");

// error handling for debugging
// error_reporting(E_ALL);
// ini_set('display errors',1);

require_once __DIR__ . "/../db.php";

$data = json_decode(file_get_contents("php://input"), true);

// validate required fields
if(!isset($data["studentID"]) && !isset($data["classID"])) {
    echo json_encode([
        "success" => false,
        "message" =>  "Student ID and Class ID are required"

    ]);
    exit;
}

// trim input data
$studentID = trim($data["studentID"]);
$classID = trim($data["classID"]);

// validate if fields empty or not
if(empty($studentID) || empty($classID)) {
    echo  json_encode([
        "success" => false,
        "message" => "Student ID and Class ID cannot be empty"
        ]);
        exit;
}

try {
    // Check if student exists in studentregister table
    $checkStudentSql = "SELECT studentID, FirstName, LastName FROM studentregister WHERE studentID = ?";
    $stmt = $pdo->prepare($checkStudentSql);
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->execute();
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        echo json_encode([
            "success" => false,
            "message" => "Student not found. Please register the student first."
        ]);
        exit;
    }

    // Check if class exists in classregister table
    $checkClassSql = "SELECT ClassID, ClassName FROM classregister WHERE ClassID = ?";
    $stmt = $pdo->prepare($checkClassSql);
    $stmt->bindParam(1, $classID, PDO::PARAM_STR);
    $stmt->execute();
    $class = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$class) {
        echo json_encode([
            "success" => false,
            "message" => "Class not found. Please check the Class ID."
        ]);
        exit;
    }

    // Check if student is already enrolled in this class
    $checkEnrollmentSql = "SELECT StudentID, ClassID FROM studentclasses WHERE StudentID = ? AND ClassID = ?";
    $stmt = $pdo->prepare($checkEnrollmentSql);
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->bindParam(2, $classID, PDO::PARAM_STR);
    $stmt->execute();
    $existingEnrollment = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($existingEnrollment) {
        echo json_encode([
            "success" => false,
            "message" => "Student is already enrolled in this class."
        ]);
        exit;
    }

    // Insert enrollment into studentclasses table
    $currentDateTime = date('Y-m-d H:i:s');
    $enrollSql = "INSERT INTO studentclasses (StudentID, ClassID, RegisterDate) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($enrollSql);
    $stmt->bindParam(1, $studentID, PDO::PARAM_STR);
    $stmt->bindParam(2, $classID, PDO::PARAM_STR);
    $stmt->bindParam(3, $currentDateTime, PDO::PARAM_STR);
    $stmt->execute();

    echo json_encode([
        "success" => true,
        "message" => "Student enrolled successfully in class",
        "data" => [
            "studentID" => $studentID,
            "studentName" => $student["FirstName"] . " " . $student["LastName"],
            "classID" => $classID,
            "className" => $class["ClassName"],
            "registerDate" => $currentDateTime
        ]
    ]);

} catch (PDOException $e) {
    error_log("Database error in student_enroll.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Database error occurred. Please try again."
    ]);
} catch (Exception $e) {
    error_log("General error in student_enroll.php: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "An unexpected error occurred. Please try again."
    ]);
}




