import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Balance Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get balance of the user", async () => {
    await request(app).post("/users").send({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const responseToken = await request(app).post("/sessions").send({
      email: "test@email.com.br",
      password: "testPassword",
    });

    const { token } = responseToken.body;

    const responseGetBalance = await request(app)
      .get("/statements/balance")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseGetBalance.status).toBe(200);
  });

  it("should not be able to get balance of a non-exists user", async () => {
    const responseGetBalance = await request(app)
      .get("/statements/balance")
      .send();

    expect(responseGetBalance.status).toBe(401);
  });
});
