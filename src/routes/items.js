const express = require('express');
const router = express.Router();
const database = require('../database');

// GET /items - Get all items with pagination, search, and sorting
router.get('/', (req, res) => {
  let { page = 1, limit = 10, search, sortBy = 'id', order = 'asc' } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);

  let items = [...database.items];

  // Search functionality
  if (search) {
    items = items.filter(item => 
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sorting
  items.sort((a, b) => {
    const compareValue = order === 'asc' ? 1 : -1;
    return a[sortBy] > b[sortBy] ? compareValue : -compareValue;
  });

  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);

  const paginatedItems = items.slice(startIndex, endIndex);

  res.json({
    items: paginatedItems,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages
    }
  });
});

// GET /items/:id - Get a specific item
router.get('/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const item = database.items.find(item => item.id === id);

  if (!item) {
    const error = new Error('Item not found');
    error.status = 404;
    return next(error);
  }

  res.json(item);
});

// POST /items - Create a new item
router.post('/', (req, res, next) => {
  const { name, description } = req.body;

  if (!name || !description) {
    const error = new Error('Name and description are required');
    error.status = 400;
    return next(error);
  }

  const newItem = {
    id: database.nextId++,
    name,
    description
  };

  database.items.push(newItem);
  res.status(201).json(newItem);
});

// PUT /items/:id - Update an item
router.put('/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const { name, description } = req.body;

  if (!name || !description) {
    const error = new Error('Name and description are required');
    error.status = 400;
    return next(error);
  }

  const itemIndex = database.items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    const error = new Error('Item not found');
    error.status = 404;
    return next(error);
  }

  database.items[itemIndex] = {
    ...database.items[itemIndex],
    name,
    description
  };

  res.json(database.items[itemIndex]);
});

// DELETE /items/:id - Delete an item
router.delete('/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  const itemIndex = database.items.findIndex(item => item.id === id);

  if (itemIndex === -1) {
    const error = new Error('Item not found');
    error.status = 404;
    return next(error);
  }

  database.items.splice(itemIndex, 1);
  res.status(204).send();
});

module.exports = router;