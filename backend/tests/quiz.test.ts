import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();
const rnd = () => Math.random().toString(36).slice(2, 8);

async function authToken() {
  const id = rnd();
  const res = await request(app)
    .post("/api/v1/auth/register")
    .send({ email: `${id}@test.com`, username: `u${id}`, password: "password123" });
  return res.body.accessToken as string;
}

const publicQuiz = {
  title: "Test Quiz",
  quizType: "public",
  questions: [
    {
      questionText: "2 + 2 = ?",
      questionType: "mcq",
      correctAnswer: "b",
      points: 10,
      options: [
        { id: "a", text: "3", isCorrect: false },
        { id: "b", text: "4", isCorrect: true },
      ],
    },
  ],
};

describe("quiz", () => {
  it("requires auth to create a quiz", async () => {
    const res = await request(app).post("/api/v1/quizzes").send(publicQuiz);
    expect(res.status).toBe(401);
  });

  it("creates a quiz with questions and totals points", async () => {
    const token = await authToken();
    const res = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send(publicQuiz);
    expect(res.status).toBe(201);
    expect(res.body.quiz.totalPoints).toBe(10);
    expect(res.body.quiz.questions).toHaveLength(1);
  });

  it("lists public quizzes and fetches one by id", async () => {
    const token = await authToken();
    const created = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send(publicQuiz);
    const id = created.body.quiz.id;

    const list = await request(app).get("/api/v1/quizzes").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.total).toBeGreaterThanOrEqual(1);

    const one = await request(app).get(`/api/v1/quizzes/${id}`).set("Authorization", `Bearer ${token}`);
    expect(one.status).toBe(200);
    expect(one.body.quiz.id).toBe(id);
  });

  it("hides correct answers from non-creators on public quizzes", async () => {
    const creator = await authToken();
    const created = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", `Bearer ${creator}`)
      .send(publicQuiz);
    const id = created.body.quiz.id;

    const other = await authToken();
    const res = await request(app).get(`/api/v1/quizzes/${id}`).set("Authorization", `Bearer ${other}`);
    expect(res.status).toBe(200);
    const q = res.body.quiz.questions[0];
    expect(q.correctAnswer).toBeUndefined();
    expect(q.options.every((o: { isCorrect?: boolean }) => o.isCorrect === undefined)).toBe(true);
  });

  it("requires a password for private quizzes (400)", async () => {
    const token = await authToken();
    const res = await request(app)
      .post("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...publicQuiz, quizType: "private" });
    expect(res.status).toBe(400);
  });
});
