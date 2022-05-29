const mongoose = require('mongoose');

mongoose.connect(process.env.MONDODB_URI || 'mongodb://localhost/googlebooks', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = mongoose.connection;