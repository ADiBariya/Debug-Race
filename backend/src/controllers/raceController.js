const raceModel = require('../models/race.model');

// @desc    Get race status
// @route   GET /api/race/:raceId
exports.getRace = async (req, res) => {
  try {
    const race = await raceModel
      .findById(req.params.raceId)
      .populate("questions.question")
      .populate("players.user", "username avatar");

    if (!race) {
      return res.status(404).json({ error: "Race not found" });
    }

    res.json(race);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Submit answer
// @route   POST /api/race/:raceId/answer
exports.submitAnswer = async (req, res) => {
  try {
    const { questionId, answer, responseTime } = req.body;
    const race = await raceModel
      .findById(req.params.raceId)
      .populate("questions.question");

    if (!race) {
      return res.status(404).json({ error: "Race not found" });
    }

    const questionEntry = race.questions.find(
      (q) => q.question._id.toString() === questionId
    );

    if (!questionEntry) {
      return res.status(404).json({ error: "Question not found in race" });
    }

    const isCorrect = questionEntry.question.correctAnswer === answer;

    const playerIndex = race.players.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (playerIndex !== -1) {
      race.players[playerIndex].submissions += 1;
      if (isCorrect) {
        race.players[playerIndex].score += 10;
      }
    }

    await race.save();

    res.json({
      isCorrect,
      correctAnswer: questionEntry.question.correctAnswer,
      explanation: questionEntry.question.explanation || "",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Finish race for player
// @route   POST /api/race/:raceId/finish
exports.finishRace = async (req, res) => {
  try {
    const race = await raceModel.findById(req.params.raceId);

    if (!race) {
      return res.status(404).json({ error: "Race not found" });
    }

    const playerIndex = race.players.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (playerIndex !== -1 && !race.players[playerIndex].completed) {
      race.players[playerIndex].completed = true;
      race.players[playerIndex].finishTime = new Date();

      const finishedPlayers = race.players.filter((p) => p.completed);
      const rank = finishedPlayers.length;

      // If all players finished, mark race as finished
      if (finishedPlayers.length === race.players.length) {
        race.status = "finished";
        race.endTime = new Date();
      }

      await race.save();

      res.json({
        message: "Race finished for player",
        rank,
        score: race.players[playerIndex].score,
      });
    } else {
      res.status(400).json({ error: "Player not found or already finished" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get race results
// @route   GET /api/race/:raceId/results
exports.getRaceResults = async (req, res) => {
  try {
    const race = await raceModel
      .findById(req.params.raceId)
      .populate("players.user", "username avatar")
      .populate("questions.question");

    if (!race) {
      return res.status(404).json({ error: "Race not found" });
    }

    const results = race.players
      .map((p) => ({
        user: p.user,
        score: p.score,
        submissions: p.submissions,
        completed: p.completed,
        finishTime: p.finishTime,
      }))
      .sort((a, b) => b.score - a.score)
      .map((p, idx) => ({ ...p, rank: idx + 1 }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};