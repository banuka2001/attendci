<?php

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "attendci";

try {
    $pdo = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);

    // set the PDO error mode to exception
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
} catch(PDOException $e) {
    header("Content-Type: application/json; charset=UTF-8");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => "Connection failed: " . $e->getMessage()]);
    exit();
}
?>
