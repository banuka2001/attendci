<?php
session_start();
header('Content-Type: application/json'); // Set the content type to JSON
include '../db.php';

// Vite proxy is configured to handle CORS


// Get the posted data.
$data = json_decode(file_get_contents("php://input"));

if (isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => "Empty username or password."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM clients_login WHERE username = :username");
        $stmt->execute(['username' => $username]);
        $user = $stmt->fetch();

        if ($user) {
            //  use password_verify()
            if (password_verify($password, $user['password'])) {
                $_SESSION['user_id'] = $user['id'];
                $_SESSION['username'] = $user['username'];
                $_SESSION['role'] = $user['role']; 
                echo json_encode([
                    'success' => true, 
                    'message' => "Login successful. Redirecting...",
                    'username' => $user['username'],
                    'role' => $user['role']
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => "Invalid password or Username."]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => "No user found with that username."]);
        }
    } catch(PDOException $e) {
        
        echo json_encode(['success' => false, 'message' => "Database error: " . $e->getMessage()]);
    }
  
} else {
    
    echo json_encode(['success' => false, 'message' => "Invalid input."]);
}


?>
