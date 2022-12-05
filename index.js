const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');

//User : arabian
// Password: f1JCyqmBNy3EAgQQ

app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5000;


const uri = "mongodb+srv://arabian:f1JCyqmBNy3EAgQQ@cluster0.j3ujg.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        await client.connect();

        const all_books_collection = client.db("rokomari").collection("all_books");
        const book = {
            name: "Think in a Redux Way",
            author : "Sumit Saha"
        }
        const result = await all_books_collection.insertOne(book);
        console.log("AAAA", result.insertedId)
    }
    finally {
        // await client.close();
    }
    
}

run().catch(console.dir)


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