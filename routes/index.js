var express = require('express');
var router = express.Router();
require("dotenv").config();
const nodemailer = require('nodemailer');
const { config } = require('dotenv');
const multer = require('multer')
const path = require('path');
const User = require("./users")
const Gallery = require("../models/gallerySchema")
const Vlog = require("../models/vlogSchema")
const Admin = require('../models/admin');



// all security code
function security() {
  // security
  const bcrypt = require('bcryptjs');
  const session = require('express-session');
  const passport = require('passport');
  const LocalStrategy = require('passport-local').Strategy;


  // all about admin
  router.use(express.urlencoded({ extended: false }));
  router.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
  }));
  router.use(passport.initialize());
  router.use(passport.session());

  // Passport configuration
  passport.use(new LocalStrategy(
    async (username, password, done) => {
      try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, admin);
      } catch (err) {
        return done(err);
      }
    }
  ));

  passport.serializeUser((admin, done) => {
    done(null, admin.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const admin = await Admin.findById(id);
      done(null, admin);
    } catch (err) {
      done(err);
    }
  });


  // Middleware to ensure the admin is authenticated
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  }



  // Route to create an admin (one-time setup)
  // Create-admin route
  router.get('/create-admin', async (req, res) => {
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.send('Admin already exists.');
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Create Admin</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f0f0f0;
        }
        .form-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 300px;
          text-align: center;
        }
        .form-container h2 {
          margin-bottom: 20px;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
        }
        .form-btn {
          width: 100%;
          padding: 10px;
          background: #007bff;
          border: none;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
        }
        .form-btn:hover {
          background: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="form-container">
        <h2>Create Admin</h2>
        <form method="post" action="/create-admin">
          <input type="text" name="username" class="form-input" placeholder="Username" required />
          <input type="password" name="password" class="form-input" placeholder="Password" required />
          <button type="submit" class="form-btn">Create Admin</button>
        </form>
      </div>
    </body>
    </html>
  `);
  });


  // Create-admin route
  router.post('/create-admin', async (req, res) => {
    const { username, password } = req.body;
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      return res.send('<div class="message">Admin already exists.</div>');
    }

    const admin = new Admin({ username, password });
    await admin.save();
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Created</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f0f0f0;
        }
        .message-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .message {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .login-link {
          color: #007bff;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .login-link:hover {
          color: #0056b3;
        }
      </style>
    </head>
    <body>
      <div class="message-container">
        <div class="message">Admin created successfully.</div>
        <p>You can now <a href="/login" class="login-link">login</a>.</p>
      </div>
    </body>
    </html>
  `);
  });

  // Login route
  router.get('/login', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Login</title>
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          font-family: Arial, sans-serif;
          background: #000;
          color:#fff;
        }
        .login-container {
          background: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          width: 300px;
          text-align: center;
           background: #111;
        }
        .login-container h2 {
          margin-bottom: 20px;
        }
        .form-input {
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
          box-sizing: border-box;
          background: #000;
           outline: none;
          border: none;
          color:#fff;

        }
        .form-btn {
          width: 100%;
          padding: 10px;
          border: none;
          color: white;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.3s ease;
            background: hsl(348, 60%, 40%);
        }
        .form-btn:hover {
 background: hsl(348, 60%, 30%);
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h2>Admin Login</h2>
        <form method="post" action="/login">
          <input type="text" name="username" class="form-input" placeholder="Username" required />
          <input type="password" name="password" class="form-input" placeholder="Password" required />
          <button type="submit" class="form-btn">Login</button>
        </form>
      </div>
    </body>
    </html>
  `);
  });

  // login
  router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
  }));


  // Logout route
  router.post('/logout', (req, res) => {
    req.logout(err => {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

  router.post('/admin-update', ensureAuthenticated, async (req, res) => {
    const { username, password } = req.body;

    try {
      const admin = await Admin.findById(req.user._id);

      if (username) {
        admin.username = username;
      }

      if (password) {
        admin.password = password; // Only set the password, pre-save hook will hash it
      }

      await admin.save();
      res.redirect('/');
    } catch (err) {
      res.status(500).send('Error updating admin information.');
    }
  });
}
security();


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// / Define file filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const imageTypes = /jpeg|jpg|png/;
  const videoTypes = /mp4|avi|mkv/;

  // Check file types based on file extension and mimetype
  if (file.fieldname === 'galleryImages') {
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
    }
  } else if (file.fieldname === 'galleryVideos') {
    const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = videoTypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only .mp4, .avi, and .mkv files are allowed!'));
    }
  } else {
    cb(new Error('Invalid file fieldname!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter
}).fields([
  { name: 'galleryImages', maxCount: 10 }, // Adjust maxCount as needed
  { name: 'galleryVideos', maxCount: 5 }   // Adjust maxCount as needed
]);



// Upload endpoint for GALLERY
router.post('/api/galleryPost', (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send(`Error: ${err.message}`);
    }

    const galleryImages = req.files['galleryImages'] || [];
    const galleryVideos = req.files['galleryVideos'] || [];

    const imageDocuments = galleryImages.map(image => ({
      imageUrl: `/uploads/${image.filename}`,
      originalFilename: image.originalname
    }));

    const videoDocuments = galleryVideos.map(video => ({
      videoUrl: `/uploads/${video.filename}`,
      originalFilename: video.originalname
    }));

    const newBlog = new Gallery({
      title: req.body.title,
      paragraph: req.body.paragraph,
      images: imageDocuments,
      videos: videoDocuments
    });

    try {
      await newBlog.save();
      res.redirect('back');
    } catch (error) {
      res.status(500).send(`Error saving to database: ${error.message}`);
    }
  });
});



// // / Set up multer for file uploads
// const vlogStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/uploads');
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   }
// });

// // Define file filter function
// const vlogFileFilter = (req, file, cb) => {
//   const videoTypes = /mp4|avi|mkv/;
//   const extname = videoTypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = videoTypes.test(file.mimetype);
//   if (mimetype && extname) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only .mp4, .avi, and .mkv files are allowed!'));
//   }
// };

// // Configure multer
// const vlogVideoUpload = multer({
//   storage: vlogStorage,
//   fileFilter: vlogFileFilter
// }).array('vlogVideos', 5); //

// // Handle POST request for uploading vlog items
// router.post('/api/vlogPost', (req, res) => {
//   vlogVideoUpload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).send(`Error: ${err.message}`);
//     }
//     const vlogVideos = req.files;
//     const videoDocuments = vlogVideos.map(video => ({
//       videoUrl: `/uploads/${video.filename}`,
//       originalFilename: video.originalname
//     }));
//     const newVlog = new Vlog({
//       title: req.body.title,
//       paragraph: req.body.paragraph,
//       videos: videoDocuments
//     });
//     try {
//       await newVlog.save();
//       res.redirect('back');
//     } catch (error) {
//       res.status(500).send(`Error saving to database: ${error.message}`);
//     }
//   });
// });


// HOME PAGE
router.get('/', async function (req, res, next) {
  try {
    const blogs = await Gallery.find().sort({ createdAt: -1 });
    const vlogs = await Vlog.find().sort({ createdAt: -1 });

    // Format the date before passing to the template
    const formattedBlogs = blogs.map(blog => {
      return {
        ...blog.toObject(),
        formattedDate: new Date(blog.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    });

    const formattedVlogs = vlogs.map(vlog => {
      return {
        ...vlog.toObject(),
        formattedDate: new Date(vlog.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      };
    });

    res.render('index', { title: 'Khambya', formattedBlogs, formattedVlogs, isAuthenticated: req.isAuthenticated() });
  } catch (error) {
    next(error);
  }
});




// GALLERY PAGE
router.get('/gallery/:id', async function (req, res, next) {
  try {
    const blog = await Gallery.findById(req.params.id);

    if (!blog) {
      return res.status(404).send('Blog or Vlog not found');
    }

    // Format the dates
    const formattedBlog = {
      ...blog.toObject(),
      formattedDate: new Date(blog.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    res.render('gallery', { title: 'Gallery', blog: formattedBlog });
  } catch (error) {
    next(error);
  }
});

// DELETEING GALLERY
router.delete('/api/deleteGallery/:id', async (req, res) => {
  try {
    const galleryId = req.params.id;
    await Gallery.findByIdAndDelete(galleryId);
    res.status(200).send({ message: 'Gallery item deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting the gallery item: ' + error.message });
  }
});



// VLOG PAGE
router.get('/vlog/:id', async function (req, res, next) {
  try {
    const vlog = await Vlog.findById(req.params.id);

    if (!vlog) {
      return res.status(404).send('Blog or Vlog not found');
    }

    // Format the dates
    const formattedBlog = {
      ...vlog.toObject(),
      formattedDate: new Date(vlog.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    };
    res.render('vlog', { title: 'Gallery', vlog: formattedBlog });
  } catch (error) {
    next(error);
  }
});


// DELETEING GALLERY
router.delete('/api/deleteVlog/:id', async (req, res) => {
  try {
    const vlogId = req.params.id;
    await Vlog.findByIdAndDelete(vlogId);
    res.status(200).send({ message: 'Vlog item deleted successfully.' });
  } catch (error) {
    res.status(500).send({ message: 'Error deleting the Vlog item: ' + error.message });
  }
});

// THIS WILL SEND EMAIL
router.post("/getForm", async (req, res) => {
  const formData = await User.create({
    name: req.body.name,
    email: req.body.email,
    message: req.body.message
  })
  if (formData) {
    await formData.save();

    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    var mailOptions = {
      from: process.env.EMAIL,
      to: 'sautaboy@gmail.com',
      subject: 'Got Mail from Sautaboy Website',
      html: `
    <h1>Name: ${req.body.name}</h1>
    <h3>Message: ${req.body.message}</h3>
    <h4>Email: ${req.body.email}</h4>
  `
    };


    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    // after 
    res.redirect("back");
  }
})
module.exports = router;
