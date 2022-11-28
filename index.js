const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json())

const port = process.env.PORT || 5000;

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