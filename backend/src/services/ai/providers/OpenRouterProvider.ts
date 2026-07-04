import { AIProvider, GeneratedQuestion, QuestionFormat, AIDifficulty } from "../AIProvider";
import { buildQuestionPrompt, parseQuestions } from "../prompt";
import { logger } from "../../../utils/logger";

/** OpenRouter (OpenAI-compatible chat completions). Default model: google/gemma-4-31b-it:free. */
export class OpenRouterProvider implements AIProvider {
  constructor(private apiKey: string, private model = "google/gemma-4-31b-it:free") {}

  private async ask(prompt: string): Promise<string> {
    logger.info(`OpenRouter: requesting model=${this.model}`);
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: this.model, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`OpenRouter error ${res.status}: ${errorText}`);
      const err = new Error(`OpenRouter error ${res.status}: ${errorText}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) {
      logger.error("OpenRouter returned empty response");
      throw new Error("AI returned empty response. Please try again.");
    }
    return content;
  }

  async generateQuestions(
    topic: string,
    difficulty: AIDifficulty,
    count: number,
    questionType: QuestionFormat
  ): Promise<GeneratedQuestion[]> {
    const text = await this.ask(buildQuestionPrompt(topic, difficulty, count, questionType));
    return parseQuestions(text);
  }

  async generateHint(question: string): Promise<string> {
    const text = await this.ask(
      `Give one helpful hint for this question without revealing the answer. Respond with only the hint.\n\nQuestion: "${question}"`
    );
    return text.trim();
  }

  async validateAnswer(question: string, answer: string): Promise<boolean> {
    const text = await this.ask(
      `Is this answer correct? Respond with only "true" or "false".\n\nQuestion: "${question}"\nAnswer: "${answer}"`
    );
    return /true/i.test(text);
  }
}
