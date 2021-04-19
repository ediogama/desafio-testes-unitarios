import request from "supertest";
import { Connection, createConnection } from "typeorm";

import { app } from "../../../../app";

let connection: Connection;

describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to get statement operation of the user", async () => {
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

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 300.0,
        description: "Deposit Statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 150.0,
        description: "Withdraw test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseGetStatementOperation = await request(app)
      .get(`/statements/${responseWithdraw.body.id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseGetStatementOperation.status).toBe(200);
  });

  it("should not be able to get statement operation of a non-exists user", async () => {
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

    await request(app)
      .post("/statements/deposit")
      .send({
        amount: 300.0,
        description: "Deposit Statement test",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseWithdraw = await request(app)
      .post("/statements/withdraw")
      .send({
        amount: 150.0,
        description: "Withdraw test description",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const responseGetStatementOperation = await request(app)
      .get(`/statements/${responseWithdraw.body.id}`)
      .send();

    expect(responseGetStatementOperation.status).toBe(401);
  });

  it("should not be able to get statement operation of a non-exists statement", async () => {
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

    const responseGetStatementOperation = await request(app)
      .get(`/statements/dd084efa-44ab-4392-b5fb-bb3b60cc0250`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(responseGetStatementOperation.status).toBe(404);
  });
});
