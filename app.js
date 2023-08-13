var express = require("express");
var cors = require("cors");
const mysql = require("mysql2");
const moment = require("moment");

require("dotenv").config();

const { HOST_SQL, USER_SQL, PASSWORD_SQL, DATABASE_SQL, PORT } = process.env;

///Connection Config
const connection = mysql.createConnection({
  host: HOST_SQL,
  user: USER_SQL,
  port: PORT,
  password: PASSWORD_SQL,
  database: DATABASE_SQL
  // timezone: "utc"
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
    "SELECT `No`, `Department`, `Division`, `Section`, `Station_Type`, `Station`, `Code_Station`, `System`, `Asset_No`, `Name_Item`, `Description`, `Brand`, `Model`, `Serial_No`, `Part_Number`, `Status`, `Repair`, `Purchse`, `Onair_date`, `Faccility_Owner`, `Location`, `Remark`, `Modifired`, `Editor` FROM `asset` WHERE 1 LIMIT 50;",
    function (err, results, fields) {
      res.json(results);
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
    }
  );
});

app.get("/api/v2/assets", function (req, res, next) {
  connection.query(
    "SELECT * FROM `asset` LEFT OUTER JOIN `image_url` ON asset.No = image_url.id WHERE 1 LIMIT 50;",
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
        return res.status(200).json(results);
      }
    }
  );
});

app.get("/api/v2/assets/:id", function (req, res, next) {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM `asset` LEFT OUTER JOIN `image_url` ON asset.No = image_url.id WHERE asset.No = ?",
    [id],
    function (err, results) {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to Get users id !!!" });
        }
        return res.status(200).json(results);
      }
    }
  );
});


app.get('/search', (req, res) => {
  const keyword = req.query.keyword; // Get the keyword from query parameters

  // Execute the search query
  // const query = `SELECT * FROM asset WHERE 1 '%${keyword}%'`;

  //Format collections sql shuild be utf8_unicon520ci
  const query = `SELECT * FROM asset WHERE CONCAT(No, Department, Division, Section, Station_Type, Station, Code_Station, Asset_No, Name_Item, Description, Brand, Model, Serial_No, Part_Number, Status, Repair, Purchse, Onair_date, Faccility_Owner, Location, Remark, Modifired, Editor, 'System') LIKE '%${keyword}%'`;
  // const query = `SELECT * FROM asset WHERE ${getSearchCondition(keyword)}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing search query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.get('/v2/search', (req, res) => {
  const keyword = req.query.keyword; // Get the keyword from query parameters

  // Execute the search query
  // const query = `SELECT * FROM asset WHERE 1 '%${keyword}%'`;

  //Format collections sql shuild be utf8_unicon520ci
  const query = `SELECT * FROM asset LEFT OUTER JOIN image_url ON asset.No = image_url.id WHERE CONCAT(No, Department, Division, Section, Station_Type, Station, Code_Station, Asset_No, Name_Item, Description, Brand, Model, Serial_No, Part_Number, Status, Repair, Purchse, Onair_date, Faccility_Owner, Location, Remark, Modifired, Editor, 'System') LIKE '%${keyword}%'`;
  // const query = `SELECT * FROM asset WHERE ${getSearchCondition(keyword)}`;
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error executing search query:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    res.json(results);
  });
});

app.get('/api/station/:column', (req, res) => {
  const column = req.params.column;
  const query = `SELECT ${column}, COUNT(${column}) AS occurrence_count FROM asset GROUP BY ${column} HAVING COUNT(${column}) > 1`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json(results);
  });
});


app.get('/api/filter/:station', (req, res) => {
  const station = req.params.station;
  const query = `SELECT * FROM asset LEFT OUTER JOIN image_url ON asset.No = image_url.id WHERE asset.Station = '${station}'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json(results);
  });
});

app.get('/api/filter/status/:status', (req, res) => {
  const status = req.params.status;
  const query = `SELECT * FROM asset LEFT OUTER JOIN image_url ON asset.No = image_url.id WHERE asset.Status = '${status}'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing the query:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json(results);
  });
});


// // Helper function to generate search condition for all columns
// function getSearchCondition(keyword) {
//   const columns = ['No', 'Department', 'Division', 'Section', 'Station_Type', 'Station', 'Code_Station', 'System', 'Asset_No', 'Name_Item', 'Description', 'Brand', 'Model', 'Serial_No', 'Part_Number', 'Status', 'Repair', 'Purchse', 'Onair_date', 'Faccility_Owner', 'Location', 'Remark', 'Modifired', 'Editor']; // Add your column names here
//   const conditions = columns.map(column => `${column} LIKE '%${keyword}%'`);
//   return conditions.join(' OR ');
// }

app.get("/api/images", function (req, res, next) {
  connection.query(
    "SELECT * FROM `image_url` ORDER BY `createtime` DESC",
    function (err, results, fields) {
      res.json(results);
      console.log(results); // results contains rows returned by server
      console.log(fields); // fields contains extra meta data about results, if available
    }
  );
});

app.get("/api/images/:id", function (req, res, next) {
  const id = req.params.id;
  connection.query(
    "SELECT * FROM `image_url` WHERE id = ?",
    [id],
    function (err, results) {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to Get images id !!!" });
        }
        return res.status(200).json(results);
      }
    }
  );
});

app.post("/api/images/create", function (req, res, next) {
  connection.query(
    "INSERT INTO `image_url` (`id`, `image_url`, `image_name`) VALUES (?, ?, ?)",
    [
      req.body.id,
      req.body.image_url,
      req.body.image_name
    ],
    function (err, results) {

      if (err) {
        console.error("Error inserting image URL:", err);
        return res.status(500).json({ message: "An error occurred while creating the image URL." });
      }
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to create users !!!" });
        }
        return res
          .status(200)
          .json({ message: "Create data successfully.", status: "ok" });
      }
     
    }
  );
});

app.put("/api/images/update", function (req, res, next) {
  connection.query(
    "UPDATE `image_url` SET `image_url` = ? , `image_name` = ? WHERE id = ?",
    [
      req.body.image_url,
      req.body.image_name,
      req.body.id
    ],
    function (err, results) {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to update users !!!" });
        }
        return res
          .status(200)
          .json({ message: "Updated data successfully.", status: "ok" });
      }
      // res.json(results);
    }
  );
});

app.delete("/api/images/delete", function (req, res, next) {
  connection.query(
    "DELETE FROM `image_url` WHERE id = ?",
    [req.body.id],
    function (err, results) {
      if (!err) {
        if (results.affectedRows == 0) {
          return res.status(404).json({ message: "Error to delete users !!!" });
        }
        return res
          .status(200)
          .json({ message: "Delete data successfully.", status: "ok" });
      }

      //res.json(results);
    }
  );
});



app.listen(4000, () => {
  console.log(`Example app listening on port 4000`);
});



