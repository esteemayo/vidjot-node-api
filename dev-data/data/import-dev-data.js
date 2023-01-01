/* eslint-disable */
import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import 'colors';

// models
import Idea from '../../models/Idea.js';
import User from '../../models/User.js';
import connectDB from '../../startup/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: './config.env' });

// mongoDB connection
connectDB();

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
