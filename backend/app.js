require('dotenv').config(); // env-variables

const express = require("express");
const morgan = require('morgan');
const helmet = require("helmet");
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoDriver = require("./connection/mongoose")

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());




require("./routes")(app);

module.exports = app;