WE can access the following routes and get output using postman after running our project locally-:

1. Register a User
Create an endpoint for registering a user.

[POST] /api/signup
Request Data : {
"username": "example_user",
"password": "example_password",
"email": "user@example.com"
}
Response Data : {
"status": "Account successfully created",
"status_code": 200,
"user_id": "123445"
}

2. Login User
[POST] /api/login
Request Data : {
"username": "example_user",
"password": "example_password"
}
For successful login
Response Data : {
"status": "Login successful",
"status_code": 200,
"user_id": "12345",
"access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
}
For failure
Response Data: {
"status": "Incorrect username/password provided. Please retry",
"status_code": 401
}

3. Add a New Train

[POST] /api/trains/create
Request Data : {
"train_name": "Express Train",
"source": "Station A",
"destination": "Station B",
"seat_capacity": 100,
"arrival_time_at_source": "14:00:00",
"arrival_time_at_destination": "20:30:00"
}
Response Data : {
"message": "Train added successfully",
"train_id": "9876543210"
}

4. Get Seat Availability
[GET] /api/trains/availability?source=SOURCE&destination=DESTINATION
Request Data : {}
Params: {
"source": str
"destination": str
}
Response Data : [
{"train_id": "9876543210",
"train_name": "Express Train",
"available_seats": 75
},
{
"train_id": "9876543211",
"train_name": "Express Train 2",
"available_seats": 0
}
]

5.Book a Seat

[POST] /api/trains/{train_id}/book
Headers : {
"Authorization": "Bearer {token}"
}
Request Data : {
"user_id": "1234567890",
"no_of_seats": 2
}
Response Data : {
"message": "Seat booked successfully",
"booking_id": "5432109876",
"seat_numbers": [5,6]
}

6.Get Specific Booking Details

[GET] /api/bookings/{booking_id}
Headers : {
"Authorization": "Bearer {token}"
}
Request Data : {}
Response Data : {
"booking_id": "5432109876",
"train_id": "9876543210",
"train_name": "Express Train",
"user_id": "1234567890",
"no_of_seats": 1
"seat_numbers": [7],
"arrival_time_at_source": "2023-01-01 14:00:00",
"arrival_time_at_destination": "2023-01-01 20:30:00"
}

