require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const publicRoutes = require('./src/routes/public.routes.js');
const authRoutes = require('./src/routes/auth.routes.js');
const adminRoutes = require('./src/routes/admin.routes.js');

const app = express();


app.use(cors()); 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


connectDB();


app.get('/', (req, res) => {
  res.json({ message: 'Painter Guys API!' });
});



app.use('/api', publicRoutes);


const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});