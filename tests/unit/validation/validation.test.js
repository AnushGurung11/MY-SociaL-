import {
  loginSchema,
  registerSchema,
} from "../../../validation/auth.validation.js";

// testing for register Schema
describe("registerSchema", () => {
  const valid = {
    username: "johnny",
    email: "John@Example.com",
    password: "Password1",
    dob: "2000-01-01",
  };

  test("accepts valid input", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("john@example.com");
  });
});

// test case of login schema
describe("loginSchema", () => {
  const valid = {
    email: "Jhon@Email.com",
    password: "Pass12345",
  };

  test("accepts valid input", () => {
    const result = loginSchema.safeParse(valid);
    expect(result.success).toBe(true);
    expect(result.data.email).toBe("jhon@email.com");
  });
});
