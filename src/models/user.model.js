const mongoose = require("mongoose");

let userSchema = new mongoose.Schema(
  {
    phone: String,
    name: String,
    email: String,
    password: String,
    avatar: String,
    create_at: Date,
    updated_at: Date,
    is_deleted: Boolean,
  },
  { versionKey: false }
);

let User = mongoose.model("User", userSchema, "users");

module.exports = {
  findByLambda: async function (lambda) {
    return await User.find(lambda.query, lambda.views);
  },
  findByEmailPassword: async function (lambda) {
    lambda = {
      ...lambda,
      is_deleted: false,
    };
    return await User.aggregate([
      {
        $match: lambda,
      },
    ]);
  },
  createByLambda: async function (lambda) {
    return await User.insertMany(lambda);
  },
  updateByLambda: async function (id, lambda) {
    return await User.updateOne(id, lambda);
  },
};
