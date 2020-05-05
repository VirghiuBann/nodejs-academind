const express = require('express');
const authController = require('../controllers/auth');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const { check, body } = require('express-validator');

router.get('/login', authController.getLogin);
router.post(
    '/login',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail(),
        body('password', 'Invalid password!')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
    ],
    authController.postLogin
);
router.post('/logout', isAuth, authController.postLogout);
router.get('/signup', authController.getSignup);

router.post(
    '/signup',
    [
        check('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail(),
        body('password', 'Please enter a password and least 5 characters.')
            .isLength({ min: 5 })
            .isAlphanumeric()
            .trim(),
        body('passwordConfirm')
            .trim()
            .custom((value, { req }) => {
                if (value !== req.body.password) {
                    throw new Error('Password have not match');
                }
                return true;
            }),
    ],
    authController.postSignup
);

router.get('/reset', authController.getReset);
router.post('/reset', authController.postReset);
router.get('/reset/:token', authController.getNewPassword);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
