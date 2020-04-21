const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");

const User = require("../models/user");

// const transporter = nodemailer.createTransport(
//     sendgridTransport({
//         auth: {
//             api_key:
//                 "",
//         },
//     })
// );

sgMail.setApiKey("");

exports.getLogin = (req, res, next) => {
    const message = req.flash("error");
    res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errorMessage: message.length > 0 ? message : null,
    });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email })
        .then((user) => {
            if (!user) {
                req.flash("error", "Invalid credential.");
                return res.redirect("/login");
            }

            bcrypt.compare(password, user.password).then((doMatch) => {
                if (doMatch) {
                    req.session.isLoggedIn = true;
                    req.session.user = user;
                    return req.session.save((err) => {
                        console.log(err);
                        res.redirect("/");
                    });
                }
                req.flash("error", "Invalid credential.");
                res.redirect("/login");
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.getSignup = (req, res, next) => {
    const message = req.flash("error");
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup",
        isAuthenticated: false,
        errorMessage: message.length > 0 ? message : null,
    });
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then((userDoc) => {
            if (userDoc) {
                req.flash("error", "Email already exist.");
                return res.redirect("/signup");
            }
            return bcrypt.hash(password, 12).then((hashedPassword) => {
                const user = new User({
                    email: email,
                    password: hashedPassword,
                    cart: { items: [] },
                });
                return user.save();
            });
        })
        .then(() => {
            res.redirect("/login");
            const msg = {
                to: email,
                from: "dev.vbhann@gmail.com",
                subject: "Signup succeeded",
                text: "Hello world",
                html: "<h1>You successfully signed up!</h1>",
            };
            sgMail.send(msg).then(
                () => {},
                (error) => {
                    console.error(error);

                    if (error.response) {
                        console.error(error.response.body);
                    }
                }
            );
            // return transporter
            //     .sendMail({
            //         to: email,
            //         from: "awesome@bar.com",
            //         subject: "Signup succeeded",
            //         text: "Hello world",
            //         html: "<h1>You successfully signed up!</h1>",
            //     })
            //     .catch((err) => {
            //         console.log(err);
            //     });
        })
        .catch((err) => {
            consolelog(err);
        });
};
const crypto = require("crypto");

exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
};

exports.getReset = (req, res, next) => {
    const message = req.flash("error");
    res.render("auth/reset", {
        path: "/reset",
        pageTitle: "Reset",
        errorMessage: message.length > 0 ? message : null,
    });
};

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/reset");
        }
        const token = buffer.toString("hex");
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "No account with that email found.");
                    return res.redirect("/reset");
                }
                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then((result) => {
                res.redirect("/");
                transporter.sendMail({
                    to: req.body.email,
                    from: "awesome@bar.com",
                    subject: "Signup succeeded",
                    text: "Password reset",
                    html: `
                        <p>You requested a password reset</p>
                        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new pssword. </p>
                    `,
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });
};

exports.getNewPassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({
        resetToken: token,
        resetTokenExpiration: { $gt: Date.now() },
    })
        .then((user) => {
            let message = req.flash("error");
            res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "New Password",
                errorMessage: message.length > 0 ? message : null,
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { $gt: Date.now() },
        _id: userId,
    })
        .then((user) => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then((result) => {
            res.redirect("/login");
        })
        .catch((err) => {
            console.log(err);
        });
};
