const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(session({ secret: "cats" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());

let users = [
    {
        username: "liver",
        password: "1234"
    },
    {
        username: "ryan",
        password: "5678"
    }
];

passport.use(new LocalStrategy((username, password, done) => {
    for (let i of users) {
        if (i.username == username && i.password == password) {
            return done(null);
        }
    }
    return done(null, false, { message: "Incorrect login" });
}));

app.post("/login", passport.authenticate("local", {
    successRedirect: "/mainWindow.html",
    failureRedirect: "/login",
    failureFlash: true
}));

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
