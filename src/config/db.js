const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Połączono z MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Błąd połączenia z bazą: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
