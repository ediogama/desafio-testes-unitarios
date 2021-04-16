import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get a statement operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should be able to get a statement operation of the user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 300.0,
      description: "Description test",
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation).toHaveProperty("user_id");
    expect(statementOperation).toHaveProperty("type");
    expect(statementOperation).toHaveProperty("amount");
    expect(statementOperation).toHaveProperty("description");
  });

  it("should not be able to get a statement operation of a non-exists user", async () => {
    expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id: "123456",
        statement_id: "test",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get a statement operation of a non-exists statement", async () => {
    expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Name test",
        email: "test@email.com.br",
        password: "testPassword",
      });

      await getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: "123456",
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
