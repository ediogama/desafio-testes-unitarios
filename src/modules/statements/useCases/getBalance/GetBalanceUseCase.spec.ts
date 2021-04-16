import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getBalanceUseCase: GetBalanceUseCase;

describe("Get balance of the user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should be able to get balance of the user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name test",
      email: "test@email.com.br",
      password: "testPassword",
    });

    const statement1 = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      amount: 300.0,
      description: "Description test",
    });

    const statement2 = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      amount: 150.0,
      description: "Description test",
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance.statement.length).toBe(2);
    expect(balance.balance).toEqual(statement1.amount - statement2.amount);
  });
});
