import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Create a Statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to create a new statement for the user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const statement: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 125.0,
      description: "Description test",
    };

    const userStatement = await createStatementUseCase.execute(statement);

    expect(userStatement).toHaveProperty("id");
  });

  it("should be able to create a new withdraw statement for the user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const statementDeposit: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 300.0,
      description: "Description test",
    };

    await createStatementUseCase.execute(statementDeposit);

    const statementWithdraw: ICreateStatementDTO = {
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 150.0,
      description: "Description test",
    };

    const userStatement = await createStatementUseCase.execute(
      statementWithdraw
    );

    expect(userStatement).toHaveProperty("id");
  });

  it("should not be able to create a new statement for a non-existent user", async () => {
    expect(async () => {
      const statement: ICreateStatementDTO = {
        user_id: "12345",
        type: OperationType.DEPOSIT,
        amount: 125.0,
        description: "Description test",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound);
  });

  it("should not be able to create a new withdraw statement for a user with insufficient funds", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Name test",
        email: "test@email.com.br",
        password: "testPassword",
      });

      const statement: ICreateStatementDTO = {
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        amount: 125.0,
        description: "Description test",
      };

      await createStatementUseCase.execute(statement);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});
