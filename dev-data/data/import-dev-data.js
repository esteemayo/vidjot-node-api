const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');

// models
const Idea = require('../../models/Idea');
const User = require('../../models/User');

dotenv.config({ path: './config.env' });

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// db atlas
const db = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// mongoDB connection
mongoose
  .connect(db, {
    // .connect(dbLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Connected to MongoDB → ${db}`));
// .then(() => console.log(`Connected to MongoDB → ${dbLocal}`));

// read JSON file
const ideas = JSON.parse(fs.readFileSync(`${__dirname}/ideas.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into DB
const importData = async () => {
  try {
    await Idea.create(ideas);
    await User.create(users, { validateBeforeSave: false });

    console.log('👍👍👍👍👍👍 Data successfully loaded! 👍👍👍👍👍👍');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...');

    await Idea.deleteMany();
    await User.deleteMany();

    console.log(
      'Data successfully deleted! To load sample data, run\n\n\t npm run sample\n\n'
    );
    process.exit();
  } catch (err) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
    );
    console.error(err);
    process.exit();
  }
};

if (process.argv.includes('--delete')) {
  deleteData();
} else {
  importData();
}
