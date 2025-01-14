
const { Router } = require('express');
const User = require('../models/user');
const router = Router();

// Signin Route - Render Signin Page
router.get('/signin', (req, res) => {
  res.render("signin");
});

// Signin Route - Handle Login Form Submission
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate email and password
    if (!email || !password) {
      return res.render("signin", {
        error: "Email and Password are required."
      });
    }

    // Authenticate user and generate token
    const token = await User.matchPasswordAndGenerateToken(email, password);

    // Store the token in a cookie and redirect to the homepage
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    return res.redirect("/");
  } catch (error) {
    console.error("Error during signin:", error);
    return res.render("signin", {
      error: "Incorrect Email or Password"
    });
  }
});

// Logout Route - Clear Authentication Token
router.get('/logout', (req, res) => {
  res.clearCookie("token").redirect('/');
});

// Signup Route - Render Signup Page
router.get('/signup', (req, res) => {
  res.render("signup");
});

// Signup Route - Handle Signup Form Submission
router.post('/signup', async (req, res) => {
  const { fullname, email, password } = req.body;

  try {
    // Validate input fields
    if (!fullname || !email || !password) {
      return res.render("signup", {
        error: "All fields are required."
      });
    }

    // Check if the email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("signup", {
        error: "Email already exists. Please use a different email."
      });
    }

    // Create a new user
    await User.create({ fullname, email, password });

    // Redirect to signin page after successful signup
    return res.redirect("/signin");
  } catch (error) {
    console.error("Error during signup:", error);
    return res.render("signup", {
      error: "An error occurred during signup. Please try again."
    });
  }
});

module.exports = router;
