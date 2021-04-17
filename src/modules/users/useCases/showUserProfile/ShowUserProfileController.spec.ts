import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to show the profile of the user", async () => {
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

    const responseProfile = await request(app)
      .get("/profile")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseProfile.status).toBe(200);
  });

  it("should not be able to show the profile of a non-exists user", async () => {
    const responseProfile = await request(app).get("/profile").send();

    expect(responseProfile.status).toBe(401);
  });
});
