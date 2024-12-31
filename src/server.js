const express = require('express');
const morgan = require('morgan');
const cors = require('cors'); 
const itemsRouter = require('./routes/items');
const errorHandler = require('./middleware/errorHandler');

///console.log(window.location.href);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies
// Enable CORS
app.use(cors());

// Optionally, configure specific CORS options
/*const corsOptions = {
    origin: 'http://your-frontend-domain.com', // Replace with your frontend's URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
};*/

//app.use(cors(corsOptions));

// Routes
app.use('/items', itemsRouter);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
