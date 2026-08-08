import { expect, jest } from "@jest/globals";
import User from "../../../models/user.model.js";
import { getAllUsers } from "../../../repository/userRepository.js";

describe("User Repository", () => {
  describe("getAllUsers", () => {
    it("returns all users", async () => {
      const mockUsers = [
        { email: "example@gmail.com" },
        { email: "someone@gail.com" },
      ];
      jest.spyOn(User, "find").mockResolvedValue(mockUsers);

      const result = await getAllUsers();

      expect(User.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it("throws error when find fails", async () => {
      jest.spyOn(User, "find").mockRejectedValue(new Error("DB error"));
      await expect(getAllUsers()).rejects.toThrow("DB error");
    });
  });
});
