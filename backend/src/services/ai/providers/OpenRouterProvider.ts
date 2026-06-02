import { AIProvider, GeneratedQuestion, QuestionFormat, AIDifficulty } from "../AIProvider";
import { buildQuestionPrompt, parseQuestions } from "../prompt";

/** OpenRouter (OpenAI-compatible chat completions). Default model: openrouter/owl-alpha. */
export class OpenRouterProvider implements AIProvider {
  constructor(private apiKey: string, private model = "openrouter/owl-alpha") {}

  private async ask(prompt: string): Promise<string> {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: this.model, messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) {
      const err = new Error(`OpenRouter error ${res.status}: ${await res.text()}`) as Error & { status?: number };
      err.status = res.status;
      throw err;
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content ?? "";
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
