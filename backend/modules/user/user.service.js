const User = require("./model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class UserService {
  async registerUser(name, email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    return user;
  }

  async loginUser(email, password) {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error("Invalid credentials");
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { user, token };
  }
}

module.exports = new UserService();
