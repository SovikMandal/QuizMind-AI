"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAIProvider = getAIProvider;
exports.testAIProvider = testAIProvider;
const GeminiProvider_1 = require("../providers/GeminiProvider");
const AnthropicProvider_1 = require("../providers/AnthropicProvider");
const OpenRouterProvider_1 = require("../providers/OpenRouterProvider");
const env_1 = require("../../../config/env");
const ApiError_1 = require("../../../utils/ApiError");
const logger_1 = require("../../../utils/logger");
/** Builds the AI provider selected by AI_PROVIDER. Throws (503) if not configured. */
function getAIProvider() {
    const provider = (env_1.env.AI_PROVIDER || "gemini").toLowerCase();
    const apiKey = env_1.env.AI_API_KEY;
    if (!apiKey) {
        throw new ApiError_1.ApiError(503, `AI is not configured. Set AI_API_KEY for provider "${provider}".`);
    }
    switch (provider) {
        case "gemini":
            logger_1.logger.info(`Using Gemini AI provider (model: ${env_1.env.GEMINI_MODEL})`);
            return new GeminiProvider_1.GeminiProvider(apiKey, env_1.env.GEMINI_MODEL);
        case "anthropic":
        case "claude":
            logger_1.logger.info(`Using Anthropic provider (model: ${env_1.env.ANTHROPIC_MODEL})`);
            return new AnthropicProvider_1.AnthropicProvider(apiKey, env_1.env.ANTHROPIC_MODEL);
        case "openrouter":
            logger_1.logger.info(`Using OpenRouter provider (model: ${env_1.env.OPENROUTER_MODEL})`);
            return new OpenRouterProvider_1.OpenRouterProvider(apiKey, env_1.env.OPENROUTER_MODEL);
        case "openai":
        case "ollama":
            throw new ApiError_1.ApiError(501, `AI provider "${provider}" is not yet implemented`);
        default:
            throw new ApiError_1.ApiError(400, `Unknown AI provider: "${provider}"`);
    }
}
/** Manual smoke test: npm run test:ai */
async function testAIProvider() {
    const provider = getAIProvider();
    const questions = await provider.generateQuestions("JavaScript", "easy", 1, "multiple_choice");
    logger_1.logger.info(`Question generation works: ${JSON.stringify(questions[0])}`);
    const hint = await provider.generateHint("What is a closure in JavaScript?");
    logger_1.logger.info(`Hint generation works: ${hint}`);
}
//# sourceMappingURL=aiConfig.js.map