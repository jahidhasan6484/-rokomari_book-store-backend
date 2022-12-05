const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

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

        app.post('/addBook', async (req, res) => {
            const newBook = req.body;
            const result = await all_books_collection.insertOne(newBook);
            res.send(result)
        });

        app.get('/bookDB', async (req, res) => {
            const query = {};

            const cursor = all_books_collection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.delete('/book/:d_id', async (req, res) => {
            const id = req.params.d_id;
            const query = { _id: ObjectId(id) }
            const result = await all_books_collection.deleteOne(query);
            res.send(result)
        })


    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir)



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})