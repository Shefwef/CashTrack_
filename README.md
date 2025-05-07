# CashTrack  
**Backend Expense Management System**  

A RESTful API for tracking personal or business expenses, built with Node.js, Express, and MongoDB. Designed to handle CRUD operations, user authentication, and financial analytics.  

---

## Features  
- **JWT Authentication**: Secure user registration/login with token-based access.  
- **Expense Management**: Create, read, update, and delete expenses with filtering, sorting, and pagination.  
- **Data Validation**: Robust input validation using Express Validator.  
- **Analytics Endpoints**: Calculate total expenses, monthly summaries, and category-wise spending.  
- **Swagger Documentation**: Auto-generated API docs for easy testing.  

## Tech Stack  
- **Backend**: Node.js, Express  
- **Database**: MongoDB (Mongoose ODM)  
- **Authentication**: JWT  
- **Tools**: Postman (testing), Swagger (documentation), Docker (optional deployment)  

---

## Installation  
1. Clone the repository:  
   ```bash  
   git clone https://github.com/Shefwef/CashTrack_.git
2. Install dependencies:
   cd CashTrack_  
   npm install
3. Set up environment variables:
   Create a .env file in the root directory.
   Copy the template from .env.example and fill in your credentials:
   MONGODB_URI=your_mongodb_connection_string  
   JWT_SECRET=your_jwt_secret_key  
   PORT=3000  
5. Start the server:
   npm start
   The API will run on http://localhost:3000.
     
