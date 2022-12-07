const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.j3ujg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const all_books_collection = client.db("rokomari").collection("all_books");
        const adminCollection = client.db("rokomari").collection("admins");

        app.post('/addBook', async (req, res) => {
            const newBook = req.body;
            const result = await all_books_collection.insertOne(newBook);
            res.send(result)
        });

        app.get('/admins', async (req, res) => {
            const query = {};

            const cursor = adminCollection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.get('/bookDB', async (req, res) => {
            const query = {};

            const cursor = all_books_collection.find(query);
            const result = await cursor.toArray();
            res.send(result)
        });

        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await all_books_collection.findOne(query);
            res.send(result)
        });

        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedBook = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    name: updatedBook.name,
                    price: updatedBook.price
                },
            };
            const result = await all_books_collection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete('/delete/:d_id', async (req, res) => {
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