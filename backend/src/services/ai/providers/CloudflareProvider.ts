import { AIProvider, GeneratedQuestion, QuestionFormat, AIDifficulty } from "../AIProvider";
import { buildQuestionPrompt, parseQuestions } from "../prompt";
import { logger } from "../../../utils/logger";

/**
 * Cloudflare Workers AI provider.
 * Uses the OpenAI-compatible endpoint: https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/v1/chat/completions
 * 
 * Required env vars:
 *   AI_API_KEY = Cloudflare API Token
 *   CLOUDFLARE_ACCOUNT_ID = Your Cloudflare account ID
 *   CLOUDFLARE_MODEL = Model name (default: @cf/meta/llama-3.1-70b-instruct)
 */
export class CloudflareProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private accountId: string,
    private model = "@cf/meta/llama-3.1-70b-instruct"
  ) {}

  private async ask(prompt: string): Promise<string> {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/v1/chat/completions`;
    logger.info(`Cloudflare AI: requesting model=${this.model}`);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4096,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logger.error(`Cloudflare AI error ${res.status}: ${errorText}`);
      const err = new Error(`Cloudflare AI error ${res.status}: ${errorText}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }

    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? "";
    if (!content) {
      logger.error("Cloudflare AI returned empty response");
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
