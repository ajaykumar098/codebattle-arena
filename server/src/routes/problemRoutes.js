const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { gradeSubmission } = require('../utils/judge');
const { verifyToken } = require('../middleware/auth');

// GET /api/problems - list all problems (summary view, no test cases)
router.get('/', async (req, res) => {
  try {
    const problems = await Problem.find().select('-testCases -description');
    res.json(problems);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/problems/random-set — picks 1 Easy, 1 Medium, 1 Hard at random
// IMPORTANT: this must be defined ABOVE router.get('/:slug', ...) or it will never be reached
router.get('/random-set', async (req, res) => {
  try {
    const getRandom = async (difficulty) => {
      const count = await Problem.countDocuments({ difficulty });
      if (count === 0) return null;
      const skip = Math.floor(Math.random() * count);
      return Problem.findOne({ difficulty }).skip(skip).select('-testCases');
    };

    const [easy, medium, hard] = await Promise.all([
      getRandom('Easy'),
      getRandom('Medium'),
      getRandom('Hard'),
    ]);

    const problems = [easy, medium, hard].filter(Boolean);

    if (problems.length < 3) {
      return res.status(500).json({ message: 'Not enough problems in each difficulty tier.' });
    }

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

    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/problems/:slug/submit - submit code for judging
router.post('/:slug/submit', verifyToken, async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'No code submitted' });
    }

    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const gradeResult = await gradeSubmission(problem, code, language || 'python');
    const passedTests = gradeResult.passedTests;
    const totalTests = gradeResult.totalTests;
    const allPassed = gradeResult.passed;

    // Save submission
    const submission = await Submission.create({
      userId: req.userId,
      problemId: problem._id,
      slug: problem.slug,
      passed: allPassed,
      passedTests,
      totalTests
    });

    // Check if this is the first passing submission for this problem
    let xpAwarded = null;
    if (allPassed) {
      const existingPass = await Submission.findOne({
        userId: req.userId,
        problemId: problem._id,
        passed: true,
        _id: { $ne: submission._id }
      });

      if (!existingPass) {
        // First pass - award XP and coins based on difficulty
        const xpValues = { Easy: 10, Medium: 25, Hard: 50 };
        const coinValues = { Easy: 5, Medium: 10, Hard: 20 };
        const xpToAdd = xpValues[problem.difficulty] || 0;
        const coinsToAdd = coinValues[problem.difficulty] || 0;

        // Update XP and coins
        const user = await User.findByIdAndUpdate(
          req.userId,
          { $inc: { xp: xpToAdd, coins: coinsToAdd } },
          { new: true }
        );

        // Update rank based on total XP
        let newRank = 'Bronze';
        if (user.xp >= 500) newRank = 'Silver';
        if (user.xp >= 1500) newRank = 'Gold';
        if (user.xp >= 3000) newRank = 'Platinum';
        if (user.xp >= 5000) newRank = 'Diamond';

        await User.findByIdAndUpdate(req.userId, { rank: newRank });

        xpAwarded = user.xp;
      }
    }

    res.json({
      totalTests,
      passedTests,
      allPassed,
      results: gradeResult.results,
      xpAwarded
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/problems/:slug/complete - mark problem as complete and award XP
router.post('/:slug/complete', verifyToken, async (req, res) => {
  try {
    const { allPassed, passedTests, totalTests } = req.body;
    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const submission = await Submission.create({
      userId: req.userId,
      problemId: problem._id,
      slug: problem.slug,
      passed: !!allPassed,
      passedTests: passedTests || 0,
      totalTests: totalTests || 0
    });

    let xpAwarded = null;
    if (allPassed) {
      const existingPass = await Submission.findOne({
        userId: req.userId,
        problemId: problem._id,
        passed: true,
        _id: { $ne: submission._id }
      });
      if (!existingPass) {
        const xpValues = { Easy: 10, Medium: 25, Hard: 50 };
        const coinValues = { Easy: 5, Medium: 10, Hard: 20 };
        const xpToAdd = xpValues[problem.difficulty] || 0;
        const coinsToAdd = coinValues[problem.difficulty] || 0;

        const user = await User.findByIdAndUpdate(
          req.userId,
          { $inc: { xp: xpToAdd, coins: coinsToAdd } },
          { new: true }
        );

        let newRank = 'Bronze';
        if (user.xp >= 500) newRank = 'Silver';
        if (user.xp >= 1500) newRank = 'Gold';
        if (user.xp >= 3000) newRank = 'Platinum';
        if (user.xp >= 5000) newRank = 'Diamond';
        await User.findByIdAndUpdate(req.userId, { rank: newRank });

        xpAwarded = user.xp;
      }
    }

    res.json({ xpAwarded });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/problems/:slug/run - run code against visible test cases only (no scoring)
router.post('/:slug/run', async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'No code submitted' });
    }

    const problem = await Problem.findOne({ slug: req.params.slug });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    // Filter to only visible test cases
    const visibleProblem = { ...problem.toObject(), testCases: problem.testCases.filter(tc => !tc.isHidden) };

    const gradeResult = await gradeSubmission(visibleProblem, code, language || 'python');
    const passedTests = gradeResult.passedTests;
    const totalTests = gradeResult.totalTests;
    const allPassed = gradeResult.passed;

    // No submission saved, no XP awarded - just instant feedback
    res.json({
      totalTests,
      passedTests,
      allPassed,
      results: gradeResult.results
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
