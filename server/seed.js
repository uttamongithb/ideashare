require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Idea = require('./models/Idea')

async function seed(){
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ideas-app')
  console.log('Connected')
  await User.deleteMany({})
  await Idea.deleteMany({})

  const users = []
  users.push(await User.create({ name: 'Uttam', email: 'uttam@example.com', password: 'password' }))
  users.push(await User.create({ name: 'Priya', email: 'priya@example.com', password: 'password' }))

  const ideas = [
    { author: users[0]._id, title: 'Campus Food App', description: 'Order and share meals on campus. Build quick menus and track favourites.', tags: ['food','campus','app'] },
    { author: users[1]._id, title: 'Study Group Finder', description: 'Find peers based on subject and availability.', tags: ['study','productivity'] },
    { author: users[0]._id, title: 'Event Planner', description: 'Organize meetups with shared to-do lists and RSVPs.', tags: ['events','organizer'] }
  ]

  for (const i of ideas) await Idea.create(i)

  console.log('Seeded users and ideas')
  process.exit(0)
}

seed().catch(err=>{ console.error(err); process.exit(1) })
