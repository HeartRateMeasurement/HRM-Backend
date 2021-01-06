let User = require("../models/user.model");
const resSuccess = require("../response/res-success");
const resFail = require("../response/res-fail");
const { omitBy, isNil } = require("lodash");
const moment = require("moment");
const sha256 = require("crypto-js/sha256");

module.exports = {
  listUser: async function (req, res, next) {
    let lambda = {
      query: { is_deleted: false },
      views: {
        _id: 1,
        name: 1,
        phone: 1,
        email: 1,
        avatar: 1,
      },
    };
    let data = await User.findByLambda(lambda);
    res.json(resSuccess(data));
  },

  findById: async function (req, res) {
    let lambda = {
      query: { _id: req.params.id, is_deleted: false },
      views: {
        _id: 1,
        name: 1,
        phone: 1,
        email: 1,
        avatar: 1,
      },
    };
    let data = await User.findByLambda(lambda);
    res.json(resSuccess(data[0]));
  },

  postCreate: async function (req, res, next) {
    try {
      let adminExisted = await User.findByLambda({
        query: { email: req.body.email },
      });
      if (adminExisted && adminExisted.length) {
        console.log("adminExisted: ", adminExisted);
        throw {
          status: 204,
          detail: "This email is registered! Please pick other email!",
        };
      }

      let password = sha256(req.body.password).toString();
      let entity = {
        phone: req.body.phone || undefined,
        name: req.body.name || undefined,
        email: req.body.email || undefined,
        password: password || undefined,
        avatar: req.body.avatar || undefined,
        create_at: moment.now(),
        updated_at: moment.now(),
        is_deleted: false,
      };
      let user = await User.createByLambda(entity);
      console.log("password: ", password);

      user[0].password = "******";
      res.json(
        resSuccess({
          user: user,
        })
      );
    } catch (error) {
      let data = {
        ...error,
        message: error.message,
        detail: error.detail,
      };
      res.json(resFail(data));
    }
  },

  patchUpdate: async function (req, res, next) {
    try {
      let id = req.params.id;
      let password = sha256(req.body.password).toString();
      let entity = {
        phone: req.body.phone || undefined,
        name: req.body.name || undefined,
        email: req.body.email || undefined,
        password: password || undefined,
        avatar: req.body.avatar || undefined,
        updated_at: moment.now(),
      };

      let entityLast = omitBy(entity, isNil);

      let result = await User.updateByLambda({ _id: id }, entityLast);
      res.json(resSuccess({ data: result }));
    } catch (error) {
      let data = {
        ...error,
        message: error.message,
        detail: error.detail,
      };
      res.json(resFail(data));
    }
  },

  deleteData: async function (req, res) {
    try {
      let id = req.params.id;
      let entity = {
        is_deleted: true,
      };
      let result = await User.updateByLambda({ _id: id }, entity);
      res.json(resSuccess({ data: result }));
    } catch (error) {
      let data = {
        ...error,
        message: error.message,
        detail: error.detail,
      };
      res.json(resFail(data));
    }
  },

  postLogin: async (req, res) => {
    try {
      console.log(req.body);
      console.log(req.body.email + " " + req.body.password);
      let data = await User.findByLambda({ query: { email: req.body.email } });
      console.log("data: ", data);
      if (!data || !data.length) {
        throw {
          status: 204,
          error: "Admin is not existed!",
        };
      }
      let password = sha256(req.body.password).toString();
      console.log("pw: ", password);
      console.log("data[0].password: ", data[0].password);

      if (password != data[0].password) {
        throw {
          status: 204,
          error: "Wrong password!",
        };
      }
      if (data[0].is_deleted) {
        throw {
          status: 204,
          e: "Admin is deleted!",
        };
      }
      delete data[0].password;
      res.json(resSuccess(data[0]));
    } catch (error) {
      res.json(resFail(error));
    }
  },
};
