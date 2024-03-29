const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const config = require('./config/db');
const helmet = require('helmet')

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(helmet());

app.use(express.static('public'))

mongoose
  .connect(config.db_url, { useNewUrlParser: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch(err => {
    console.log({ database_error: err });
  });

cloudinary.config({ 
  cloud_name: config.cloud_name, 
  api_key: config.api_key, 
  api_secret: config.api_secret 
});

app.get('/', (req, res) => {
    console.log("hello world")
    res.send('Hello!')
});

const userRoutes = require("./api/user/route/user");
app.use("/user", userRoutes);

const questionRoutes = require("./api/question/route/questions");
app.use("/questions", questionRoutes);

const configRoutes = require("./api/palpoll-config/route/configRoutes");
app.use("/config", configRoutes);

const guessRoutes = require("./api/guess/route/guesses");
app.use("/guess", guessRoutes);

const statsRoutes = require("./api/stats/route/stats");
app.use("/stats/", statsRoutes);

const passwordRoutes = require("./api/password-reset/route/passwordReset");
app.use("/password-reset/", passwordRoutes);

const port = process.env.PORT || 3030;
app.listen(port, () => {
  console.log(`App listening at ${port}`);
});