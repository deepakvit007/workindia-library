require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const pool = mysql
  .createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  })
  .promise();

const result = async () => {
  return await pool.query("SELECT * FROM users");
};

app.use(bodyParser.json());

// Define a route
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

function generate10DigitUID() {
  const min = 1000000000; // Smallest 10-digit number (10^9)
  const max = 9999999999; // Largest 10-digit number (10^10 - 1)

  // Generate a random number between min and max
  const uid = Math.floor(Math.random() * (max - min + 1)) + min;

  return uid.toString();
}

function generateAccessToken(length = 32) {
  // Generate a random hexadecimal string of the specified length
  return crypto.randomBytes(length).toString("hex");
}

function generateUID() {
  const timestamp = Date.now().toString(36); // Convert timestamp to base36 string
  const randomBytes = crypto.randomBytes(8).toString("hex"); // Generate random bytes and convert to hexadecimal

  // Combine timestamp and random bytes
  const uid = timestamp + randomBytes;

  // Hash the combined string to ensure uniqueness
  const hashedUID = crypto.createHash("sha1").update(uid).digest("hex");

  return hashedUID;
}

async function findOrCreateUser(username, email, password, uid) {
  try {
    // Check if the user with the provided username or email exists
    const query =
      "SELECT * FROM users WHERE username = '" +
      username +
      "' OR email = '" +
      email +
      "';";
    const result = await pool.query(query);
    console.log(result);

    // If the user doesn't exist, create a new user
    if (result[0].length === 0) {
      const createUserQuery =
        "INSERT INTO users (userid,username,email,passwordU) VALUES ('" +
        uid +
        "','" +
        username +
        "','" +
        email +
        "','" +
        password +
        "');";
      await pool.query(createUserQuery);
      console.log("User created successfully");
      return true;
    } else {
      console.log("User already exists");
      return false;
    }
  } catch (err) {
    console.error("Error:", err);
    return false;
  }
}

app.post("/api/signup", async (req, res) => {
  // Get user registration data from the request body
  const { username, password, email } = req.body;

  // Basic validation: Check if required fields are provided
  if (!username || !password || !email) {
    return res.status(400).json({ status: "Bad Request", status_code: 400 });
  }
  const salt = await bcrypt.genSalt(Number(process.env.SALT));
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const uid = generateUID();
  if (findOrCreateUser(username, email, hashPassword, uid)) {
    res.status(200).json({
      status: "Account successfully created",
      status_code: 200,
      user_id: uid,
    });
  } else {
    res.status(500).json({ status: "User Already exists", status_code: 500 });
  }
});

app.post("/api/login", async (req, res) => {
  // Get user registration data from the request body
  const { username, password } = req.body;

  // Basic validation: Check if required fields are provided
  if (!username || !password) {
    return res.status(400).json({ status: "Bad Request", status_code: 400 });
  }

  const user = await pool.query(
    "SELECT * FROM users WHERE username = '" + username + "';"
  );
  const validPassword = await bcrypt.compare(
    req.body.password,
    user[0][0].passwordU
  );
  if (!validPassword)
    return res
      .status(401)
      .send({ message: "Incorrect username/password provided. Please retry" });

  const token = generateAccessToken(64);
  return res.status(200).send({
    message: "Login successful",
    access_token: token,
    user_id: user[0][0].user_id,
  });
});

const Avail = true;
app.post("/api/books/create", async (req, res) => {
  const {
    title,
    author,
    isbin
  } = req.body;
  const bookID = generate10DigitUID();
  try {
    const createBookQuery =
      "INSERT INTO books (book_id,title,author,isbin,available) VALUES ('" +
      bookID +
      "','" +
      title +
      "','" +
      author +
      "','" +
      isbin +
       "','" +
       Avail +
      "');";
    await pool.query(createBookQuery);
    console.log(" added successfully");
    res
      .status(200)
      .send({ message: "Book added successfully", book_id: bookID });
  } catch (error) {
    console.log(error);
  }
});

//GET REQUEST
app.get("/api/books", async (req, res) => {
  try {
    const { title } = req.query;
    // SQL query to retrieve train availability information
    const sql =
      "SELECT book_id,title,author,isbin FROM books WHERE title = '" +
      title +
      "';";

    // Execute the SQL query
    const [rows] = await pool.query(sql);

    // Send the retrieved data as a JSON response
    res.json({ data: rows });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.post('/api/books/borrow',  (req, res) => {
  const { book_id, user_id, issue_time, return_time } = req.body;
  const query = 'SELECT * FROM books WHERE book_id = ?';
  pool.query(query, [book_id], (err, result) => {
    if (err) {
      console.error('Error checking book availability: ', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ error: 'Book not found' });
    } else {
      const book = result[0];
      if (book.available) {
        // Update book availability and insert booking into the database
        const updateQuery = 'UPDATE books SET available = false, next_available_at = ? WHERE book_id = ?';
        pool.query(updateQuery, [return_time, book_id], (err, updateResult) => {
          if (err) {
            console.error('Error booking the book: ', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
          }
          const bookingQuery = 'INSERT INTO bookings (book_id, user_id, issue_time, return_time) VALUES (?, ?, ?, ?)';
          pool.query(bookingQuery, [book_id, user_id, issue_time, return_time], (err, bookingResult) => {
            if (err) {
              console.error('Error booking the book: ', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
            res.json({
              status: 'Book booked successfully',
              status_code: 200,
              booking_id: bookingResult.booking_id
            });
          });
        });
      } else {
        res.status(400).json({ status: 'Book is not available at this moment' });
      }
    }
  });
});


app.get("/api/books/:book_id/availability", async (req, res) => {
    try {
        const bid = req.params.book_id;
        const result = await pool.query("SELECT * FROM books WHERE book_id= ?",[bid])
        res.status(200).send({message:result[0]});
    } catch (error) {
        res.status(500).send({message:"Internal Server Error"});
    }
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
