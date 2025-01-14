

require('dotenv').config(); // Load environment variables

const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const Blog = require('./models/blog');

const userRoute = require('./routes/user');
const blogRoute = require('./routes/blog');

const path = require('path');
const { checkForAuthenticationCookie } = require('./middlewares/authentication');

const app = express();

const PORT = process.env.PORT || 8000;

// Database Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Database connected successfully'))
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1); // Exit the application if the database connection fails
  });

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(checkForAuthenticationCookie('token'));
app.use(express.static(path.resolve('./public')));

// Routes
app.get('/', async (req, res) => {
  try {
    const allBlogs = await Blog.find({}); // Fetch all blogs
    res.render('home', {
      user: req.user || null, // Ensure `req.user` is handled safely
      blogs: allBlogs,
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).send('Internal Server Error'); // Send a friendly error message to the user
  }
});

app.use('/user', userRoute);
app.use('/blog', blogRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

