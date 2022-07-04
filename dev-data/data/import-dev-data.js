const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
require('colors');

// models
const Idea = require('../../models/Idea');
const User = require('../../models/User');

dotenv.config({ path: './config.env' });

// db local
const dbLocal = process.env.DATABASE_LOCAL;

// db atlas
const mongoURI = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

const devEnv = process.env !== 'production';

// mongoDB connection
mongoose
  .connect(`${devEnv ? dbLocal : mongoURI}`, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .then(() =>
    console.log(`Connected to MongoDB → ${devEnv ? dbLocal : mongoURI}`)
  )
  .catch((err) => console.log(`Couldn't connect to MongoDB → ${err}`));

// read JSON file
const ideas = JSON.parse(fs.readFileSync(`${__dirname}/ideas.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into DB
const importData = async () => {
  try {
    await Idea.create(ideas);
    await User.create(users, { validateBeforeSave: false });
    console.log(
      '👍👍👍👍👍👍 Data successfully loaded! 👍👍👍👍👍👍'.green.bold
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit();
  }
};

// delete all data from DB
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...'.green.bold);
    await Idea.deleteMany();
    await User.deleteMany();
    console.log(
      'Data successfully deleted! To load sample data, run\n\n\t npm run sample\n\n'
        .green.bold
    );
    process.exit();
  } catch (err) {
    console.log(
      '\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
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
