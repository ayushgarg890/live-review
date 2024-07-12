const express = require('express');
const { registerSchema, loginSchema } = require('./validation/user.validation');
const validate = require('../../middlewares/validate');
const userController = require('./user.controller');
const morganMiddleware = require('../../middlewares/morganLogger');

const router = express.Router();
router.use(morganMiddleware);

router.post('/register', validate(registerSchema), (req, res) => userController.register(req, res));

router.post('/login', validate(loginSchema), (req, res) => userController.login(req, res));

module.exports = router;
