var express = require("express");
var cors = require("cors");
const mysql = require("mysql2");
const moment = require('moment');
require('dotenv').config();

const {HOST_SQL , USER_SQL, PASSWORD_SQL, DATABASE_SQL, PORT} = process.env;

///Connection Config
const connection = mysql.createConnection({
  host: HOST_SQL,
  user: USER_SQL,
  port: PORT,
  password: PASSWORD_SQL,
  database: DATABASE_SQL
  // timezone: "utc",
  // dateStrings: "true",
  // ssl: {
  //   rejectUnauthorized: true,
  // }
});

var app = express();
app.use(cors());
app.use(express.json());

app.get("/api/assets", function (req, res, next) {
  connection.query(
    "SELECT `No`, `Department`, `Division`, `Section`, `Station_Type`, `Station`, `Code_Station`, `System`, `Asset_No`, `Name_Item`, `Description`, `Brand`, `Model`, `Serial_No`, `Part_Number`, `Status`, `Repair`, `Purchse`, `Onair_date`, `Faccility_Owner`, `Location`, `Remark`, `Modifired`, `Editor` FROM `asset` WHERE 1 LIMIT 500;",
    function (err, results, fields) {
      res.json(results);
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
    }
  );
});

// app.get("/api/electrics/count", function (req, res, next) {
//   connection.query(
//     "SELECT COUNT(*) AS counter FROM electric;",
//     function (err, results, fields) {
//       res.json(results);
//       console.log(results); // results contains rows returned by server
//       console.log(fields); // fields contains extra meta data about results, if available
//     }
//   );
// });



app.get("/api/assets/:id", function (req, res, next) {
  const id = req.params.id;
  connection.query(
    "SELECT `No`, `Department`, `Division`, `Section`, `Station_Type`, `Station`, `Code_Station`, `System`, `Asset_No`, `Name_Item`, `Description`, `Brand`, `Model`, `Serial_No`, `Part_Number`, `Status`, `Repair`, `Purchse`, `Onair_date`, `Faccility_Owner`, `Location`, `Remark`, `Modifired`, `Editor` FROM `asset` WHERE `No` = ?",
    [id],
    function (err, results) {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to Get users id !!!" });
        }
        return res
          .status(200)
          .json(results);
      }
      
    }
  );
});



app.listen(4000, () => {
 console.log(`Example app listening on port 4000`);
});
