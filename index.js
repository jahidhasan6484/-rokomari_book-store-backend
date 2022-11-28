const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

//User : rokomari
// Password: IA2sK2i1bIiA9722

app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5000;


const uri = "mongodb+srv://rokomari:IA2sK2i1bIiA9722@cluster0.j3ujg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("rokomari").collection("all_books");
  console.log("DB CONNECTED")
  // perform actions on the collection object
  client.close();
});


const bookDB = [
    {
        id: 1, name: "One", price: 120
    },
    {
        id: 2, name: "Two", price: 90
    },
    {
        id: 3, name: "Three", price: 95
    }
]

app.get('/bookDB', (req, res) => {
    res.send(bookDB)
});

app.post('/addBook', (req, res) => {
    const newBook = req.body;
    newBook.id = bookDB.length + 1;
    bookDB.push(newBook)
    res.send(newBook)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})