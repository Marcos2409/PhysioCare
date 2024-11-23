const express = require("express");
const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

const Patient = require("./routes/patients");
const Physio = require("./routes/physios");
const Record = require("./routes/records");
const Auth = require("./routes/auth");

mongoose.connect(process.env.DATABASE_URL);
let app = express();

app.use(express.json());
app.use('/patients', Patient);
app.use('/physios', Physio);
app.use('/records', Record);
app.use('/auth', Auth);


app.listen(process.env.PUERTO, () => console.log(`Server listening in port ${process.env.PUERTO}`));

