const express = require("express");
const app = express();
const sql = require("mssql");

const sqlConfig = {
  user: "skole",
  password: "skole2023",
  server: "glemmen.bergersen.dk",
  database: "Daniel_Eksamen_2",
  port: 4729,
  options: {
    trustServerCertificate: true,
  },
};

async function getParti() {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("select * from parti");
    const data = result.recordset;
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function insertValue(id) {
  try {
    const pool = await sql.connect(sqlConfig);
    console.log("Inserting value for partiId:", id);

    const result = await pool
      .request()
      .input("id", sql.NVarChar, id)
      .query(`UPDATE Parti SET Stemmer = Stemmer + 1 WHERE id = ${id}`);

    console.log("SQL Query Result:", result);

    console.log("Value updated successfully.");
  } catch (err) {
    console.error("Error inserting value:", err);
  }
}

app.get("/insertValue/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await insertValue(id);
    res.send(`Oppdater parti for partiid: ${id}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "feil med oppdatering." });
  }
});



app.get("/getparti", async (req, res) => {
  try {
    const data = await getParti();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "feil med henting." });
  }
});

app.get('/search', async (req, res) => {
  try {
      const { party } = req.query; // 'party' skal være navnet på kolonnen du søker etter
      const pool = await sql.connect(sqlConfig);
      const result = await pool.request()
          .input('party', sql.VarChar, party)
          .query('SELECT * FROM Parti WHERE Parti.PartiNavn = @party'); // Endre 'party_column_name' til faktisk kolonnenavn i din tabell
      res.json(result.recordset);
  } catch (err) {
      res.status(500);
      res.send(err.message);
  }
});


app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/src"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
port = 3000;
app.listen(port, async function () {
  console.log(`serveren startet på ${port}`);
  try {
    await getParti();
    //clearDB();
  } catch (err) {
    console.error(err);
  }
});