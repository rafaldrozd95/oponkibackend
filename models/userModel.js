const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");
const validator = require("validator");
const { compare, hash } = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Zły email"],
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
});

userSchema.plugin(uniqueValidator);
userSchema.pre("save", async function (next) {
  const _password = await hash(this.password, 12);
  this.password = _password;
  next();
});

userSchema.methods = {
  checkPassword: async function (candidatePassword, password) {
    return await compare(candidatePassword, password);
  },
};
module.exports = mongoose.model("User", userSchema);
