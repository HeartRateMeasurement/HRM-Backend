const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.controller");

router.get("/", controller.listUser);
router.post("/register", controller.postCreate);
router.post("/login", controller.postLogin);

router.get("/:id", controller.findById);
router.patch("/:id", controller.patchUpdate);
router.delete("/:id", controller.deleteData);
module.exports = router;
