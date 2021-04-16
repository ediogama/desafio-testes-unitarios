import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Show User Profile", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository
    );
  });

  it("should be able to show the profile of the user", async () => {
    const user = await createUserUseCase.execute({
      name: "Name test",
      email: "test@email.com",
      password: "password Test",
    });

    const profileUser = await showUserProfileUseCase.execute(user.id as string);

    expect(profileUser).toHaveProperty("id");
    expect(profileUser).toHaveProperty("email");
    expect(profileUser).toHaveProperty("name");
    expect(profileUser).toHaveProperty("password");
  });

  it("should not be able to show the profile of a non-existent user", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "Name test",
        email: "test@email.com",
        password: "password Test",
      });

      await showUserProfileUseCase.execute("1234");
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
