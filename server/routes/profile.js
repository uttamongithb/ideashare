const express = require('express')
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
    req.user = await User.findById(decoded.id).select('-password')
    next()
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

// multer storage to save avatars under /uploads/avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'avatars')
    fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname.replace(/\s+/g,'-')
    cb(null, name)
  }
})
const upload = multer({ storage })

router.get('/', auth, async (req, res) => {
  res.json(req.user)
})

// accept multipart/form-data for avatar upload (field name: avatar)
router.put('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { name, bio } = req.body
    const user = await User.findById(req.user._id)
    if (!user) return res.status(404).json({ message: 'User not found' })
    user.name = name ?? user.name
    if (bio !== undefined) user.bio = bio
    if (req.file) {
      // set avatar URL
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`
    } else if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar
    }
    await user.save()
    res.json({ id: user._id, name: user.name, email: user.email, avatar: user.avatar, bio: user.bio })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
