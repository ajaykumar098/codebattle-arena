const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');

// GET /api/problems - list all problems (summary view, no test cases)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases -description');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/problems/:slug - get one full problem by its slug
router.get('/:slug', async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Only send visible test cases to the frontend - hidden ones stay server-side
    const problemData = problem.toObject();
    problemData.testCases = problemData.testCases.filter(tc => !tc.isHidden);

    res.json(problemData);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
