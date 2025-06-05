//* importazione dotenv
require('dotenv').config();

//* importazione express, inizializzazione e assegnazione
const express = require('express');
const app = express();

//! MIDDLEWARES
//* importazione cors e utilizzo
const cors = require('cors');
app.use(cors());

//* importazione router per le rotte dei film e utilizzo
const searchRouter = require('./routes/search');
app.use('/api', searchRouter);

//* definizione porta server
const PORT = process.env.PORT || 3000;

//* avvio server con messaggio di conferma
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});