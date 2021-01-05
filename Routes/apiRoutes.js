const router = require("express").Router();
const fs = require("fs");
const path = require("path");
const mysql = require("mysql");
let user = require("../user/user");

// Connect to the gym_management_systemdb database using a localhost connection
const connection = mysql.createConnection({
  host: "localhost",

  // Your port, if not 3306
  port: 3306,

  // Your MySQL username
  user: "root",

  // Your MySQL password (leave blank for class demonstration purposes; fill in later)
  password: "rootroot",

  // Name of database
  database: "gym_management_systemdb",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
});

// GET "/api/classes" responds with all classes from the database
router.get("/classes", (req, res) => {
  connection.query(
    "SELECT *,employee.first_name, employee.last_name FROM class INNER JOIN employee ON class.trainer_id = employee.id",
    function (err, result) {
      if (err) throw err;
      res.json(result);
    }
  );
});

// POST "api/login" authenticates the member login credentials in the database, and responds with the personal details of the member
router.post("/login", (req, res) => {
  const data = req.body;
  console.log(data);
  // retrieves the record from database if username and password combination entered by the user matches with the existing records in the database
  connection.query(
    `SELECT * from member WHERE username = "${data.userName}" AND password = "${data.password}"`,
    function (err, result) {
      if (err) throw err;

      //Add file to track current user
      fs.writeFileSync(
        path.join(__dirname, "../user/user.json"),
        JSON.stringify(result),
        {},
        (e) => console.log(e)
      );

      // if the result-set has exactly 1 record, then pass on the member details(database query response) to front-end, else send an error message
      result.length === 1
        ? res.json(result[0])
        : res.json({
            error:
              "Username and/or password is incorrect. Please try again.",
          });
    }
  );
});

router.post("/addToClass", (req, res) => {
  console.log(req.body);
  connection.query(
    `INSERT INTO class_members (class_id, member_id, date) 
    VALUES (
       ${parseInt(user.id)}, 
       ${parseInt(req.body.member_id)}, 
       ${parseInt(req.body.date)}
       )`,
    function (err, result) {
      if (err) throw err;
      res.json(result);
    }
  );
  res.send("Added to class!");
});

module.exports = router;
