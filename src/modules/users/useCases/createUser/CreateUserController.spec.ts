import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Create User Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to create a new user", async () => {
    const response = await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    expect(response.status).toBe(201);
  });

  it("should not be able to create a non-exists user", async () => {
    await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const response = await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    expect(response.status).toBe(400);
  });
});
