
const { Router } = require("express");
const multer = require("multer");
const path = require('path');
const Blog = require('../models/blog');
const Comment = require('../models/comment');
const router = Router();

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('./public/uploads')); // Save uploaded files to the 'uploads' folder
  },
  filename: function (req, file, cb) {
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename); // Save file with a unique name
  },
});

const upload = multer({ storage });

// Route to render the 'add new blog' page
router.get('/add-new', (req, res) => {
  res.render('addBlog', {
    user: req.user,
  });
});

// Route to display a single blog and its comments
router.get('/:id', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    if (!blog) {
      return res.status(404).render('404', { error: "Blog not found" });
    }

    const comments = await Comment.find({ blogId: req.params.id }).populate("createdBy");
    res.render('blog', {
      user: req.user,
      blog,
      comments,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).render('error', { error: "An error occurred while fetching the blog" });
  }
});

// Route to post a new comment on a blog
router.post('/comment/:blogId', async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.redirect(`/blog/${req.params.blogId}?error=Comment content is required`);
  }

  try {
    await Comment.create({
      content,
      blogId: req.params.blogId,
      createdBy: req.user._id,
    });
    return res.redirect(`/blog/${req.params.blogId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    return res.redirect(`/blog/${req.params.blogId}?error=Failed to post comment`);
  }
});

// Route to add a new blog post
router.post('/', upload.single('coverImage'), async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.redirect('/add-new?error=Title and body are required');
  }

  if (!req.file) {
    return res.redirect('/add-new?error=Cover image is required');
  }

  try {
    const blog = await Blog.create({
      body,
      title,
      createdBy: req.user._id,
      coverImageURL: `/uploads/${req.file.filename}`,
    });
    return res.redirect(`/blog/${blog._id}`);
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.redirect('/add-new?error=An error occurred while creating the blog');
  }
});

module.exports = router;
