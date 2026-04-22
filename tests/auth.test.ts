import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../src/config/express";

const VALID_USER = {
  username: "john.doe",
  name: "John Doe",
  password: "Password1!",
};

const VALID_LOGIN = {
  username: VALID_USER.username,
  password: VALID_USER.password,
};

describe("POST /auth/signup", () => {
  it("returns 201 and the created user on valid input", async () => {
    const res = await request(app).post("/auth/signup").send(VALID_USER);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.username).toBe(VALID_USER.username);
    expect(res.body).not.toHaveProperty("passwordHash");
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/auth/signup").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.errors).toBeInstanceOf(Array);
  });

  it("returns 400 when password is too weak (no uppercase)", async () => {
    const res = await request(app).post("/auth/signup").send({
      ...VALID_USER,
      password: "password1!",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("password");
  });

  it("returns 400 when username has invalid characters", async () => {
    const res = await request(app).post("/auth/signup").send({
      ...VALID_USER,
      username: "bad username!",
    });
    expect(res.status).toBe(400);
    expect(res.body.errors[0].field).toBe("username");
  });
  it("returns 409 when username is already taken", async () => {
    await request(app).post("/auth/signup").send(VALID_USER);

    const res = await request(app)
      .post("/auth/signup")
      .send(VALID_USER);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already taken|exists/i);
  });
});

describe("POST /auth/login", () => {
  beforeAll(async () => {
    await request(app).post("/auth/signup").send(VALID_USER);
  });

  it("returns 200 and sets a token cookie on valid credentials", async () => {
    const res = await request(app).post("/auth/login").send(VALID_LOGIN);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.headers["set-cookie"]).toBeDefined();
    expect(res.headers["set-cookie"][0]).toMatch(/^token=/);
  });

  it("returns 400 when body is empty", async () => {
    const res = await request(app).post("/auth/login").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("returns 401 when password is wrong", async () => {
    const res = await request(app).post("/auth/login").send({
      ...VALID_LOGIN,
      password: "WrongPass1!",
    });
    expect(res.status).toBe(401);
  });

  it("returns 401 when username does not exist", async () => {
    const res = await request(app).post("/auth/login").send({
      username: "nobody",
      password: "Password1!",
    });
    expect(res.status).toBe(401);
  });
});
