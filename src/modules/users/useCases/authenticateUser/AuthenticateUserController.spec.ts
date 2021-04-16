import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Authenticate User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to authenticate a user", async () => {
    await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const response = await request(app).post("/sessions").send({
      email: "test@email.com.br",
      password: "testPassword",
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-exits user", async () => {
    const response = await request(app).post("/sessions").send({
      email: "test@test.com.br",
      password: "testPassword",
    });

    expect(response.status).toBe(401);
  });

  it("should not be able to authenticate a user with incorrect password", async () => {
    await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const response = await request(app).post("/sessions").send({
      email: "test@email.com.br",
      password: "test",
    });

    expect(response.status).toBe(401);
  });
});
