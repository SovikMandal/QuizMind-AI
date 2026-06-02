import { AIProvider } from "../AIProvider";
import { GeminiProvider } from "../providers/GeminiProvider";
import { AnthropicProvider } from "../providers/AnthropicProvider";
import { OpenRouterProvider } from "../providers/OpenRouterProvider";
import { env } from "../../../config/env";
import { ApiError } from "../../../utils/ApiError";
import { logger } from "../../../utils/logger";

/** Builds the AI provider selected by AI_PROVIDER. Throws (503) if not configured. */
export function getAIProvider(): AIProvider {
  const provider = (env.AI_PROVIDER || "gemini").toLowerCase();
  const apiKey = env.AI_API_KEY;

  if (!apiKey) {
    throw new ApiError(503, `AI is not configured. Set AI_API_KEY for provider "${provider}".`);
  }

  switch (provider) {
    case "gemini":
      logger.info(`Using Gemini AI provider (model: ${env.GEMINI_MODEL})`);
      return new GeminiProvider(apiKey, env.GEMINI_MODEL);
    case "anthropic":
    case "claude":
      logger.info(`Using Anthropic provider (model: ${env.ANTHROPIC_MODEL})`);
      return new AnthropicProvider(apiKey, env.ANTHROPIC_MODEL);
    case "openrouter":
      logger.info(`Using OpenRouter provider (model: ${env.OPENROUTER_MODEL})`);
      return new OpenRouterProvider(apiKey, env.OPENROUTER_MODEL);
    case "openai":
    case "ollama":
      throw new ApiError(501, `AI provider "${provider}" is not yet implemented`);
    default:
      throw new ApiError(400, `Unknown AI provider: "${provider}"`);
  }
}

/** Manual smoke test: npm run test:ai */
export async function testAIProvider(): Promise<void> {
  const provider = getAIProvider();
  const questions = await provider.generateQuestions("JavaScript", "easy", 1, "multiple_choice");
  logger.info(`Question generation works: ${JSON.stringify(questions[0])}`);
  const hint = await provider.generateHint("What is a closure in JavaScript?");
  logger.info(`Hint generation works: ${hint}`);
}
