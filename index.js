const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASSWORD
const is_live = false //true for live, false for sandbox

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
        const orderCollection = client.db("rokomari").collection("orders");

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
        });

        app.delete('/delete/:d_id', async (req, res) => {
            const id = req.params.d_id;
            const query = { _id: ObjectId(id) }
            const result = await all_books_collection.deleteOne(query);
            res.send(result)
        });

        app.post('/orders', async (req, res) => {

            const order = req.body;

            const transaction_id = new ObjectId().toString();

            const data = {
                total_amount: order.price,
                currency: 'BDT',
                tran_id: transaction_id, // use unique tran_id for each api call
                success_url: `${process.env.BACKEND_URL}/payment/success?transaction_id=${transaction_id}`,
                fail_url: `${process.env.BACKEND_URL}/payment/fail?transaction_id=${transaction_id}`,
                cancel_url: `${process.env.BACKEND_URL}/payment/cancel`,
                ipn_url: `${process.env.BACKEND_URL}/payment/ipn`,
                shipping_method: 'Courier',
                product_name: 'Computer.',
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: order.name,
                cus_email: 'customer@example.com',
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: 'Dhaka',
                cus_state: 'Dhaka',
                cus_postcode: order.postal_code,
                cus_country: 'Bangladesh',
                cus_phone: '01711111111',
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };

            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL;

                orderCollection.insertOne({
                    ...order,
                    transaction_id,
                    paid: false
                })

                res.send({ url: GatewayPageURL })
            });
        })

        app.post('/payment/success', async (req, res) => {
            const { transaction_id } = req.query;

            const filter = { transaction_id: transaction_id };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    paid: true,
                    paid_at: new Date()
                },
            };
            const result = await orderCollection.updateOne(filter, updatedDoc, options);

            if (result.modifiedCount > 0) {
                res.redirect(`${process.env.FRONTEND_URL}/payment/success?transaction_id=${transaction_id}`)
            }
        });


        app.post('/payment/fail', async (req, res) => {
            const { transaction_id } = req.query;

            const filter = { transaction_id: transaction_id };
            const result = await orderCollection.deleteOne(filter);

            if (result.deletedCount) {
                res.redirect(`${process.env.FRONTEND_URL}/payment/fail`)
            }
        });

        app.get('/orders/by-transaction-id/:id', async (req, res) => {
            const id = req.params.id;
            const query = { transaction_id: id };
            const result = await orderCollection.findOne(query);

            res.send(result)
        });


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})