const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');
const Submission = require('../models/Submission');

// GET /api/dashboard/stats
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('xp coins rank fullName username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Problems solved by difficulty.
    // A "solved" problem = at least one passed:true submission for that problem.
    // We dedupe by problemId first, then join to Problem for difficulty.
    const solvedAgg = await Submission.aggregate([
      { $match: { userId: user._id, passed: true } },
      { $group: { _id: '$problemId' } },
      {
        $lookup: {
          from: 'problems',
          localField: '_id',
          foreignField: '_id',
          as: 'problem',
        },
      },
      { $unwind: '$problem' },
      {
        $group: {
          _id: '$problem.difficulty',
          count: { $sum: 1 },
        },
      },
    ]);

    const solvedByDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
    solvedAgg.forEach((entry) => {
      if (solvedByDifficulty[entry._id] !== undefined) {
        solvedByDifficulty[entry._id] = entry.count;
      }
    });
    const totalSolved =
      solvedByDifficulty.Easy + solvedByDifficulty.Medium + solvedByDifficulty.Hard;

    // Recent submissions (last 10, any pass/fail), newest first.
    const recentSubmissions = await Submission.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('problemId', 'title slug difficulty')
      .select('slug passed passedTests totalTests createdAt problemId');

    const formattedRecent = recentSubmissions.map((s) => ({
      title: s.problemId ? s.problemId.title : s.slug,
      slug: s.slug,
      difficulty: s.problemId ? s.problemId.difficulty : null,
      passed: s.passed,
      passedTests: s.passedTests,
      totalTests: s.totalTests,
      submittedAt: s.createdAt,
    }));

    res.status(200).json({
      xp: user.xp,
      coins: user.coins,
      rank: user.rank,
      totalSolved,
      solvedByDifficulty,
      recentSubmissions: formattedRecent,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

module.exports = router;
