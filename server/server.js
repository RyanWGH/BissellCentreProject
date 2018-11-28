const express = require("express");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const session = require("express-session");
const sql = require("msnodesqlv8");
const multer = require("multer");
//const crypto = require("crypto");

const app = express();
const port = 3000;

const connectionString = "Driver={SQL Server Native Client 11.0};Server=localhost;Database=BisselCentre;Trusted_Connection=yes";

app.use(express.static("public"));
app.use(session({
    secret: "cats",
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    console.log("serialize user");
    done(null, user.UID);
});

passport.deserializeUser((id, done) => {
    console.log("deserialize user: ", id);
    sql.query(connectionString,
        `SELECT * FROM Users WHERE UID = ${id}`,
        (err, results) => {
            console.log("deserialized query");
            if (err) {
                console.log("fail");
                return done(null, false, { message: "Error getting login" });
            }
            console.log(results);
            if (!results.length) {
                console.log("fail 2");
                return done(null, false, { message: "Error 2 getting login" });
            }
            console.log("success");
            return done(null, results[0]);
        });
});

passport.use(new LocalStrategy((username, password, done) => {
    console.log(username, password, "authenticate");
    sql.query(connectionString,
        `SELECT * FROM Users WHERE Email = '${username}'`,
        (err, results) => {
            console.log("auth query");
            if (err || !results.length) {
                console.log("fail");
                console.log(err || results);
                return done(null, false, { message: "Error getting user" });
            }
            let user = results[0];
            console.log(user);
            console.log(password);
            if (password == user.Password) {
                console.log("found pw");
                done(null, user);
            } else {
                console.log("not found");
                done(null, false, { message: "Incorrect username or password" });
            }
        });
}));

// Account
app.post("/login", passport.authenticate("local"), (req, res) => {
    console.log("authed");
    res.json({UID: req.user.UID});
});

app.get("/logout", (req, res) => {
    console.log("logout");
    if (req.user) {
        req.logout();
    }
    res.json({ success: true });
});

app.post("/change_password", loggedIn, (req, res) => {
    console.log("change password");
    if (checkPassword(req.body)) {
        sql.query(connectionString,
            `UPDATE Users SET Password = '${req.body.new1}' WHERE UID = ${req.body.UID} AND Password = '${req.body.old}'`,
            (err, result) => {
                if (err) {
                    console.log(1, err);
                    res.json({ error: "Error while changing password" });
                    return;
                }
                console.log("change password result: ", result);
                res.json({ success: true });
            });
    } else {
        res.json({ error: "Please fill the required fields correctly." });
    }
});
// End Account

// Participant
app.get("/participant", loggedIn, (req, res) => {
    console.log("getting participants");
    sql.query(connectionString,
        "SELECT * FROM Participant",
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting participants" });
                return;
            }
            res.json(results);
        });
});

app.put("/participant", loggedIn, (req, res) => {
    console.log("putting a new participant");
    console.log(req.body);
    if (checkNewParticipant(req.body)) {
        sql.query(connectionString,
            `INSERT INTO Participant VALUES('${req.body.Email}', '${req.body.FName}', '${req.body.LName}',null, '${req.body.Phone}', 0, GETDATE())`,
            (err) => {
                if (err) {
                    console.log(1, err);
                    res.json({ error: "Error while inserting participant"});
                    return;
                }
                res.json({ success: true });
            });
    } else {
        res.json({ error: "Please fill the required fields."});
    }
});

app.post("/participant", loggedIn, (req, res) => {
    console.log("get participant info");
    console.log(req.body);
    if (checkParticipant(req.body)) {
        sql.query(connectionString,
            `SELECT * FROM Participant WHERE PID = ${req.body.PID}`,
            (err, results) => {
                if (err) {
                    console.log(1, err);
                    res.json({ error: "Error while getting participant info" });
                    return;
                }
                res.json(results);
            });
    } else {
        res.json({ error: "Invalid request body" });
    }
});

app.delete("/participant", loggedIn, (req, res) => {
    console.log("delete a participant");
    sql.query(connectionString,
        `DELETE FROM Participant WHERE PID = ${req.body.PID}`,
        (err, result) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while deleting participant" });
                return;
            }
            console.log("delete participant result: ", result);
            res.json({ success: true });
        });
});
// End Participants

// Senders
app.post("/senders", loggedIn, (req, res) => {
    console.log("getting list of senders for participant");
    sql.query(connectionString,
        `SELECT SenderName FROM Mail WHERE PID = ${req.body.PID}`,
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while fetching sender info" });
                return;
            }
            res.json(results);
        });
});
// End Senders

// Oustanding Mail
app.get("/outstanding_mail", loggedIn, (req, res) => {
    console.log("getting outstanding mail");
    sql.query(connectionString,
        "SELECT * FROM Mail, Participant WHERE Mail.PID = Participant.PID AND DATEDIFF(day, Date, GETDATE()) >= 60 AND Status = 0",
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting outstanding mail" });
                return;
            }
            res.json(results);
        });
});

app.post("/outstanding_mail", loggedIn, (req, res) => {
    console.log("changing outstanding mail status");
    sql.query(connectionString,
        `UPDATE Mail SET Status = 3, SendBackDate = GETDATE() WHERE MID = ${req.body.MID}`,
        (err, result) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while changing outstanding mail status" });
                return;
            }
            console.log("outstanding mail result: ", result);
            res.json({ success: true });
        });
});
// End Outstanding Mail

// Pick up
app.post("/pickup", loggedIn, (req, res) => {
    console.log("setting mail status to picked up");
    sql.query(connectionString,
        `UPDATE Mail SET Status = 2, PickUpDate = GETDATE() WHERE MID = ${req.body.MID}`,
        (err, result) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while setting pickup status for mail" });
                return;
            }
            console.log("pick up mail result: ", result);
            res.json({ success: true });
        });
});
// End Pick up

// Mail
app.get("/mail", loggedIn, (req, res) => {
    console.log("getting all mail");
    sql.query(connectionString,
        "SELECT * FROM Mail, Participant WHERE Mail.PID = Participant.PID  ORDER BY Status ASC",
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting mail" });
                return;
            }
            res.json(results);
        });
});

app.post("/mail", loggedIn, (req, res) => {
    console.log("getting mail for certain participant");
    sql.query(connectionString,
        `SELECT * FROM Mail WHERE PID = ${req.body.PID} ORDER BY Status ASC`,
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting participant mail" });
                return;
            }
            res.json(results);
        });
});

app.put("/mail", loggedIn, (req, res) => {
    console.log("adding new mail");
    console.log(req.body);
    if (checkMail(req.body)) {
        sql.query(connectionString,
            `INSERT INTO Mail VALUES(${req.body.PID}, '${req.body.SenderName}', GETDATE(), 0, null, null, null)`,
            (err) => {
                if (err) {
                    console.log(1, err);
                    res.json({ error: "Error while inserting mail" });
                    return;
                }
                res.json({ success: true });
            });
    } else {
        res.json({ error: "Please fill the required fields." });
    }
});

app.delete("/mail", loggedIn, (req, res) => {
    console.log("delete a mail");
    sql.query(connectionString,
        `DELETE FROM Mail WHERE MID = ${req.body.MID}`,
        (err, result) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while deleting mail" });
                return;
            }
            console.log("delete mail result: ", result);
            res.json({ success: true });
        });
});
// End Mail

// Donation
app.get("/donation", loggedIn, (req, res) => {
    console.log("getting all mail");
    sql.query(connectionString,
        "SELECT * FROM Donation, Donor, DonationItem WHERE Donation.DID = DonationItem.DID AND Donation.DonorID = Donor.DonorID",
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting donation" });
                return;
            }
            res.json(results);
        });
});

app.post("/donation", loggedIn, (req, res) => {
    console.log("getting donation information from a certain donor");
    sql.query(connectionString,
        `SELECT * FROM Donation WHERE DonorID = ${req.body.DonorID}`,
        (err, results) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while getting Donor's donations" });
                return;
            }
            res.json(results);
        });
});

app.put("/donation", loggedIn, (req, res) => {
    console.log("adding new donation");
    console.log(req.body);
    if (checkDonation(req.body)) {
        sql.query(connectionString,
            `INSERT INTO Donor VALUES(${req.body.Email}, '${req.body.Phone}','${req.body.FName}','${req.body.LName}', '${req.body.Company}', GETDATE());
            INSERT INTO DonationItem VALUES ('${req.body.Description}', GETDATE(), ${req.body.DonorID});
            INSERT INTO Donation VALUES (${req.body.DID}, ${req.body.DonorID}, GETDATE())`,
            (err) => {
                if (err) {
                    console.log(1, err);
                    res.json({ error: "Error while inserting a new donation" });
                    return;
                }
                res.json({ success: true });
            });
    } else {
        res.json({ error: "Please fill the required fields." });
    }
});

app.delete("/donation", loggedIn, (req, res) => {
    console.log("delete a donation");
    sql.query(connectionString,
        `DELETE FROM Donation WHERE DonationID = ${req.body.DonationID}`,
        (err, result) => {
            if (err) {
                console.log(1, err);
                res.json({ error: "Error while deleting a donation" });
                return;
            }
            console.log("delete donation result: ", result);
            res.json({ success: true });
        });
});
// End Donation

function loggedIn(req, res, next) {
    console.log(req.user);
    if (req.user) {
        next();
    } else {
        console.log("not logged in");
        res.json({ error: "Not logged in" });
    }
}

function checkNewParticipant(p) {
    // later add picture check
    return p.FName && p.LName;
}

function checkMail(m) {
    // later add signature check
    return m.PID && m.SenderName;
}

function checkParticipant(p) {
    return p.PID;
}
function checkDonation(d) {
    return d.DID && d.DonorID;
}

function checkPassword(p) {
    return p.old && p.new1 == p.new2 && p.new.length >= 8;
}

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
