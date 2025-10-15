<?php
// Get the posted data first to check for rememberMe
$data = json_decode(file_get_contents("php://input"));

// Configure session based on rememberMe preference BEFORE starting session
if (isset($data->rememberMe) && $data->rememberMe) {
    // Set session cookie to expire in 24 hours for Remember Me
    ini_set('session.cookie_lifetime', 24 * 60 * 60); // 24 hours
} else {
    // Set session cookie to expire when browser closes
    ini_set('session.cookie_lifetime', 0);
}

session_start();
header('Content-Type: application/json');
require_once __DIR__ . '/cors.php';
include '../db.php';

// Vite proxy is configured to handle CORS

if (isset($data->username) && isset($data->password)) {
    $username = $data->username;
    $password = $data->password;

    if (empty($username) || empty($password)) {
        echo json_encode(['success' => false, 'message' => "Empty username or password."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("SELECT * FROM clients_login WHERE username = :username");
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->execute();
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
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['username'],
                        'role' => $user['role']
                    ]
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
