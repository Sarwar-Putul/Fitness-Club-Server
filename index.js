const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();


const port = process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5okrn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('classes'));
app.use(fileUpload());



app.get('/', (req, res) => {
  res.send('Hello World!')
})




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const classCollection = client.db("fitnessClub").collection("classes");
  const reviewCollection = client.db("fitnessClub").collection("reviews");
  const bookingCollection = client.db("fitnessClub").collection("booking");
  const trainerCollection = client.db("fitnessClub").collection("trainer");
  console.log('Database connected successfully')


  app.post('/addClass', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const price = req.body.price;
    const duration = req.body.duration;
    const status = req.body.status;
    const newImg =file.data;
    const encImg = newImg.toString('base64');

    var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
    };

      classCollection.insertOne({name, price, duration, status, image})
      .then(result =>{
          res.send(result.insertedCount > 0)
        
      })
  })


  app.get('/classes', (req, res) => {
    classCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })


  app.get('/class/:id', (req, res) => {
    classCollection.find({_id: ObjectId(req.params.id)})
    .toArray((err, items) => {
      res.send(items[0]);
    })
  })


  app.post('/addReview', (req, res) => {
    const addReview = req.body;
    reviewCollection.insertOne(addReview)
    .then(result => {
      console.log('inserted count', result.insertedCount)
      res.send(result.insertedCount > 0)
    })
  })


  app.get('/reviews', (req, res) => {
    reviewCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })


  app.post('/booking', (req, res) => {
    const bookingPlacement = req.body;
    bookingCollection.insertOne(bookingPlacement)
    .then(result => {
      console.log(result)
      res.send(result.insertedCount > 0);
    })
    console.log("my data",bookingPlacement);
  })


  app.get('/book/:email', (req, res) => {
    bookingCollection.find({email: req.params.email})
    .toArray((err, items) => {
      res.send(items);
    })
  })

  app.delete('/delete/:id', (req, res) => {
    classCollection.deleteOne({_id: ObjectId(req.params.id)})
    .then(result => {
      res.send(result.deletedCount > 0);
    })
  })



  app.post('/addTrainer', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const email = req.body.email;
    const type = req.body.type;
    const newImg =file.data;
    const encImg = newImg.toString('base64');

    var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
    };

    trainerCollection.insertOne({name, type, email, image})
      .then(result =>{
          res.send(result.insertedCount > 0)
        })

    })



  app.get('/trainers', (req, res) => {
    trainerCollection.find({})
    .toArray((err, documents) => {
      res.send(documents);
    })
  })


  app.post('/isTrainer', (req, res) => {
    const email = req.body.email;
    trainerCollection.find({ email: email })
        .toArray((err, trainer) => {
            res.send(trainer.length > 0);
        })
})


  app.patch('/update/:id', (req, res) => {
    console.log(req.params.id,req.body)
    const id=req.params.id
    const status=req.body.status
    classCollection.updateOne({_id: ObjectId(req.params.id)},
    {
      $set: {status: req.body.status}
    })
    .then(result => {
      res.json(result.modifiedCount>0)
    })
      
    
  })






  
});


app.listen(process.env.PORT || port)