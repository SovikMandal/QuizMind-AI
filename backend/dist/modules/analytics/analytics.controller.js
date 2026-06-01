"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.history = exports.analytics = exports.leaderboard = exports.results = void 0;
const analytics_service_1 = require("./analytics.service");
const results = async (req, res) => {
    res.json(await analytics_service_1.AnalyticsService.results(req.params.id, req.user.id));
};
exports.results = results;
const leaderboard = async (req, res) => {
    res.json({ leaderboard: await analytics_service_1.AnalyticsService.leaderboard(req.params.id) });
};
exports.leaderboard = leaderboard;
const analytics = async (req, res) => {
    res.json(await analytics_service_1.AnalyticsService.analytics(req.params.id, req.user.id));
};
exports.analytics = analytics;
const history = async (req, res) => {
    res.json(await analytics_service_1.AnalyticsService.history(req.user.id));
};
exports.history = history;
//# sourceMappingURL=analytics.controller.js.map