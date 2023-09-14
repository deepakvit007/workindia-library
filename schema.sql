CREATE DATABASE library_app;
USE library_app;

CREATE TABLE users (
  userid integer PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(255) NOT NULL,
  email TEXT NOT NULL,
  passwordU TEXT NOT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (username,email,passwordU)
VALUES 
('admin','admin@gmail.com','admin123');

INSERT INTO users (username,email,passwordU) VALUES ('Deepak','deepakvit@gmail.com','12345');

-- Book Table
CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(13) NOT NULL,
  `available` tinyint(1) DEFAULT 1,
  `next_available_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO `books` (`book_id`, `title`, `author`, `isbn`, `available`, `next_available_at`) VALUES
(1, 'The wake of Human', 'Jai Singh', 'abcde12345', 0, '2023-09-14 11:10:00'),
(2, 'Journey of Life', 'John Keevs', 'uidf12345', 1, NULL);

-- Book Reservation Table
CREATE TABLE `bookings` (
  `bookings_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `issue_time` datetime NOT NULL,
  `return_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
