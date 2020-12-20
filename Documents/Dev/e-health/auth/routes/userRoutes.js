import express from 'express';
import User from '../models/userModel.js';
import { auth } from '../middlewares/auth.js';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';

const router = express.Router();

//@route    GET api/users/profile
//@desc     show user profile
//@access   Private
router.get(
  '/profile',
  auth,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user._id).select('-password');
      res.json(user);
    } catch (err) {
      console.log(err.message);
      res.status(500).json('Server Error');
    }
  })
);

//@route    POST api/users/signup
//@desc     Register user
//@access   Public
router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }
    const user = await User.create({ name, email, password });

    if (user) {
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        process.env.JWT_KEY,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
          });
        }
      );
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  })
);

//@route    POST api/auth
//@desc     Authenticate & return token
//@access   Public
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const payload = {
        user: {
          _id: user._id,
        },
      };
      jwt.sign(
        payload,
        process.env.JWT_KEY,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: token,
          });
        }
      );
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  })
);

//@desc Update user profile
//@route PUT /api/users/profile
//@access Private
router.put(
  '/profile',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password;
      }
      const updatedUser = await user.save();

      const payload = {
        user: {
          _id: user._id,
        },
      };
      jwt.sign(
        payload,
        process.env.JWT_KEY,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: token,
          });
        }
      );
    } else {
      res.status(400);
      throw new Error('User not found');
    }
  })
);

export default router;
