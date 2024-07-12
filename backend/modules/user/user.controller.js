const userService = require("./user.routes");
const logger = require("../../middlewares/logger");

class UserController {
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      const user = await userService.registerUser(name, email, password);
      logger.info("User registered successfully", {
        user: { id: user._id, email: user.email },
      });
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      logger.error("User registration failed", { error: error.message });
      res.status(400).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await userService.loginUser(email, password);
      logger.info("User logged in successfully", {
        user: { id: user._id, email: user.email },
      });
      res.status(200).json({ token });
    } catch (error) {
      logger.error("Login failed", { error: error.message });
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new UserController();
