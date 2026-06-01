import request from "supertest";
import { createApp } from "../src/app";

const app = createApp();
const rnd = () => Math.random().toString(36).slice(2, 8);

function newUser() {
  const id = rnd();
  return { email: `${id}@test.com`, username: `u${id}`, password: "password123" };
}

/** Registers then verifies (using the dev code) — returns the verify response. */
async function registerVerified(user: ReturnType<typeof newUser>) {
  const reg = await request(app).post("/api/v1/auth/register").send(user);
  return request(app).post("/api/v1/auth/verify-email").send({ email: user.email, code: reg.body.devCode });
}

describe("auth", () => {
  it("registers (pending) then verifies to create the account + token", async () => {
    const user = newUser();
    const reg = await request(app).post("/api/v1/auth/register").send(user);
    expect(reg.status).toBe(202);
    expect(reg.body.devCode).toBeDefined();

    const res = await request(app).post("/api/v1/auth/verify-email").send({ email: user.email, code: reg.body.devCode });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it("rejects a wrong verification code with 400", async () => {
    const user = newUser();
    await request(app).post("/api/v1/auth/register").send(user);
    const res = await request(app).post("/api/v1/auth/verify-email").send({ email: user.email, code: "000000" });
    expect(res.status).toBe(400);
  });

  it("rejects duplicate email with 409 (after the first is verified)", async () => {
    const user = newUser();
    await registerVerified(user);
    const res = await request(app).post("/api/v1/auth/register").send(user);
    expect(res.status).toBe(409);
  });

  it("rejects invalid registration with 400", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "not-an-email", username: "x", password: "short" });
    expect(res.status).toBe(400);
  });

  it("logs in and rejects wrong password", async () => {
    const user = newUser();
    await registerVerified(user);

    const ok = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: user.password });
    expect(ok.status).toBe(200);
    expect(ok.body.accessToken).toBeDefined();

    const bad = await request(app).post("/api/v1/auth/login").send({ email: user.email, password: "wrong" });
    expect(bad.status).toBe(401);
  });

  it("returns the current user with a token and 401 without", async () => {
    const reg = await registerVerified(newUser());
    const token = reg.body.accessToken;

    const me = await request(app).get("/api/v1/users/me").set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.user.id).toBe(reg.body.user.id);

    const noAuth = await request(app).get("/api/v1/users/me");
    expect(noAuth.status).toBe(401);
  });
});
