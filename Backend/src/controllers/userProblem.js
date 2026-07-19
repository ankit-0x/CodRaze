const {
  getLanguageById,
  submitBatch,
  submitToken,
} = require("../utils/problemUtility");
const Problem = require("../models/problem");
const User = require("../models/user");
const Submission = require("../models/submission");
const SolutionVideo = require("../models/solutionVideo");

const createProblem = async (req, res) => {
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  try {
    for (const { language, completeCode } of referenceSolution) {
      //source_code:
      //language_id:
      //stdin:
      //expectedOutput:

      const languageId = getLanguageById(language);

      // i am creating batch submission
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);
      //["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7", "Tecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1"]

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }

    //we can store it in our DB
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id,
    });

    res.status(201).send("Problem Saved Successfully");
  } catch (err) {
    res.status(400).send("Error: " + err);
  }
};

const updateProblem = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    difficulty,
    tags,
    visibleTestCases,
    hiddenTestCases,
    startCode,
    referenceSolution,
    problemCreator,
  } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Missing Id Field");
    }

    const DsaProblem = await Problem.findById(id);

    if (!DsaProblem) {
      return res.status(404).send("Id is not present in DB");
    }

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      // i am creating batch submission
      const submissions = visibleTestCases.map((testcase) => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: testcase.input,
        expected_output: testcase.output,
      }));

      const submitResult = await submitBatch(submissions);

      const resultToken = submitResult.map((value) => value.token);
      //["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7", "Tecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1"]

      const testResult = await submitToken(resultToken);

      for (const test of testResult) {
        if (test.status_id != 3) {
          return res.status(400).send("Error Occured");
        }
      }
    }

    //we can update it in our DB
    const newProblem = await Problem.findByIdAndUpdate(
      id,
      { ...req.body },
      { runValidators: true, new: true },
    );

    res.status(200).send(newProblem);
  } catch (err) {
    res.status(404).send("Error: " + err);
  }
};

const deleteProblem = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return res.status(404).send("Problem is Missing");
    }

    res.status(200).send("Successfully Deleted");
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getProblemById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return res.status(400).send("ID is Missing");
    }

    const getProblem = await Problem.findById(id).select(
      "_id title description difficulty tags visibleTestCases startCode referenceSolution",
    );

    if (!getProblem) {
      return res.status(404).send("Problem is Missing");
    }
    // video ka jo bhi url wagera le aao
    const videos = await SolutionVideo.findOne({ problemId: id });
    if (videos) {
      const responseData = {
        ...getProblem.toObject(),
        secureUrl: videos.secureUrl,
        thumbnailUrl: videos.thumbnailUrl,
        duration: videos.duration,
      };

      return res.status(200).send(responseData);
    }

    res.status(200).send(getProblem);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const getAllProblems = async (req, res) => {
  try {
    const getProblems = await Problem.find({}).select(
      "_id title difficulty tags",
    );

    if (getProblems.length == 0) {
      return res.status(404).send("Problem is Missing");
    }

    res.status(200).send(getProblems);
  } catch (err) {
    res.status(500).send("Error: " + err);
  }
};

const solvedAllProblemsByUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId).populate({
      path: "problemsSolved",
      select: "_id title difficulty tags",
    });

    res.status(200).send(user.problemsSolved);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const submittedProblem = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;

    const ans = await Submission.find({ userId, problemId });

    res.status(200).send(ans);
  } catch (err) {
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemById,
  getAllProblems,
  solvedAllProblemsByUser,
  submittedProblem,
};
