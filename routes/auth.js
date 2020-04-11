const express = require("express");
const authController = require("../controllers/auth");
const router = express.Router();
const isAuth = require("../middleware/is-auth");

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", isAuth, authController.postLogout);
router.get("/signup", authController.getSignup);
router.post("/signup", authController.postSignup);

module.exports = router;
