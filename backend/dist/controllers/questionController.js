"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateQuestionsController = exports.getQuestionsController = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const geminiService_1 = require("../services/geminiService");
const firestoreDataService_1 = require("../services/firestoreDataService");
const getQuestionsController = async (req, res) => {
    try {
        const { topic, difficulty, search } = req.query;
        let questions = await firestoreDataService_1.FirestoreDataService.getAllQuestions();
        if (topic && topic !== 'All') {
            const topLower = String(topic).toLowerCase();
            questions = questions.filter((q) => q.topic.toLowerCase().includes(topLower));
        }
        if (difficulty && difficulty !== 'All') {
            const diffLower = String(difficulty).toLowerCase();
            questions = questions.filter((q) => q.difficulty.toLowerCase() === diffLower);
        }
        if (search) {
            const s = String(search).toLowerCase();
            questions = questions.filter((q) => q.question.toLowerCase().includes(s) ||
                q.topic.toLowerCase().includes(s) ||
                q.explanation.toLowerCase().includes(s));
        }
        return (0, responseHelper_1.sendSuccess)(res, questions);
    }
    catch (err) {
        return (0, responseHelper_1.sendError)(res, err.message, 500);
    }
};
exports.getQuestionsController = getQuestionsController;
const generateQuestionsController = async (req, res) => {
    const { topic, difficulty, count } = req.body;
    if (!topic) {
        return (0, responseHelper_1.sendError)(res, 'Topic is required', 400);
    }
    const questions = await geminiService_1.GeminiService.generateQuestions({
        topic,
        difficulty: difficulty || 'medium',
        count: count ? parseInt(count, 10) : 5,
    });
    return (0, responseHelper_1.sendSuccess)(res, questions, 'Questions generated successfully');
};
exports.generateQuestionsController = generateQuestionsController;
