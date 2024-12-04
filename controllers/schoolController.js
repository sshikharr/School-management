const db = require('../config/dbConfig');
const distanceCalculator = require("../utils/distanceCalculator");

// Controller for adding schools
exports.addSchool = (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    // Validating name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid or missing "name". It must be a non-empty string.' });
    }

    // Validating address
    if (!address || typeof address !== 'string' || address.trim().length === 0) {
        return res.status(400).json({ message: 'Invalid or missing "address". It must be a non-empty string.' });
    }

    // Validating latitude
    if (
        latitude === undefined || 
        typeof latitude !== 'number' || 
        latitude < -90 || 
        latitude > 90
    ) {
        return res.status(400).json({ message: 'Invalid or missing "latitude". It must be a number between -90 and 90.' });
    }

    // Validating longitude
    if (
        longitude === undefined || 
        typeof longitude !== 'number' || 
        longitude < -180 || 
        longitude > 180
    ) {
        return res.status(400).json({ message: 'Invalid or missing "longitude". It must be a number between -180 and 180.' });
    }

    // Query to be run in the db
    const query = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';

    // Executing the query
    db.execute(query, [name, address, latitude, longitude], (err) => {
        if (err) {
            console.error('Database error during school insertion:', err);
            return res.status(500).json({ message: 'Database error.', error: err });
        }
        console.log('School added successfully:', { name, address, latitude, longitude });
        res.status(201).json({ message: 'School added successfully.' });
    });
};

// Controller for getting all the schools sorted through proximity of the user
exports.listSchools = (req, res) => {
    const { latitude, longitude } = req.query;

    // Validating latitude
    if (
        latitude === undefined || 
        isNaN(latitude) || 
        parseFloat(latitude) < -90 || 
        parseFloat(latitude) > 90
    ) {
        return res.status(400).json({ message: 'Invalid or missing "latitude". It must be a number between -90 and 90.' });
    }

    // Validating longitude
    if (
        longitude === undefined || 
        isNaN(longitude) || 
        parseFloat(longitude) < -180 || 
        parseFloat(longitude) > 180
    ) {
        return res.status(400).json({ message: 'Invalid or missing "longitude". It must be a number between -180 and 180.' });
    }

    // Parsing latitude and longitude as floating-point numbers
    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    // Querying the database
    const query = 'SELECT * FROM schools';
    db.execute(query, (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Database error.', error: err });
        }

        // Sorting all the schools with respect to proximity of the user
        const sortedSchools = results.map(school => ({
            ...school,
            distance: distanceCalculator(userLat, userLon, school.latitude, school.longitude)
        })).sort((a, b) => a.distance - b.distance);

        res.json(sortedSchools);
    });
};
