<?php
header('Content-Type: application/json');
session_start();
require_once('db.php');

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$user_id = $_SESSION['user_id'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Get user's watchlist
        $stmt = $conn->prepare("SELECT movie_id FROM watchlist WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $watchlist = [];
        while ($row = $result->fetch_assoc()) {
            $watchlist[] = intval($row['movie_id']);
        }
        
        echo json_encode(['watchlist' => $watchlist]);
        break;

    case 'POST':
        // Add movie to watchlist
        $data = json_decode(file_get_contents('php://input'), true);
        $movie_id = $data['movie_id'] ?? null;

        if ($movie_id === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Movie ID required']);
            exit;
        }

        $stmt = $conn->prepare("INSERT IGNORE INTO watchlist (user_id, movie_id) VALUES (?, ?)");
        $stmt->bind_param("ii", $user_id, $movie_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add movie to watchlist']);
        }
        break;

    case 'DELETE':
        // Remove movie from watchlist
        $movie_id = $_GET['movie_id'] ?? null;

        if ($movie_id === null) {
            http_response_code(400);
            echo json_encode(['error' => 'Movie ID required']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM watchlist WHERE user_id = ? AND movie_id = ?");
        $stmt->bind_param("ii", $user_id, $movie_id);
        
        if ($stmt->execute()) {
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to remove movie from watchlist']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}

$conn->close();
?>