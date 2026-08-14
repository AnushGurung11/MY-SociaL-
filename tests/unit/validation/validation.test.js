import { registerSchema } from "../../../validation/auth.validation.js";

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

  // ... rest identical to before, just with import instead of require
});
