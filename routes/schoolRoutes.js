const express = require('express');
const router = express.Router();
const { addSchool, listSchools } = require('../controllers/schoolController');

// Routes that are to be hit by the client
router.post('/addSchool', addSchool);
router.get('/listSchools', listSchools);

module.exports = router;
