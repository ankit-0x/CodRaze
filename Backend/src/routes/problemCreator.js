const express = require('express');
const problemRouter = express.Router();
const adminMiddleware = require("../middleware/adminMiddleware");
const {createProblem, updateProblem, deleteProblem, getProblemById, getAllProblems, solvedAllProblemsByUser, submittedProblem} = require('../controllers/userProblem');
const userMiddleware = require("../middleware/userMiddleware");

//create
//fetch
//update
//delete


// needs admin acess , inko admin ke middleware se hoke jana padega
problemRouter.post('/create', adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);

//No admin access , bas user authenticated hona chahiye
problemRouter.get('/problemById/:id', userMiddleware, getProblemById);
problemRouter.get('/getAllProblems', userMiddleware, getAllProblems);
problemRouter.get('/problemsSolvedByUser', userMiddleware, solvedAllProblemsByUser);
problemRouter.get('/submittedProblem/:id', userMiddleware, submittedProblem)

module.exports = problemRouter;