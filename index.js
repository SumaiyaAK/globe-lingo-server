const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000

// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qen4a4k.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();


    const userCollection = client.db("GlobeLingoDB").collection("users")
    const AllClassesCollection = client.db("GlobeLingoDB").collection("AllClasses")
    const classCollection = client.db("GlobeLingoDB").collection("class")

    // users API
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result)
    } )


    app.patch('users/admin/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role:'admin'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result)
    })



    app.post('/users', async(req, res)=> {
      const user = req.body;
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query)
      if(existingUser){
        return res.send({message: 'user already exists'})
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    
    // All classes API
    app.get('/AllClasses', async (req, res) => {
      const result = await AllClassesCollection.find().toArray();
      res.send(result)
    })

    // class collection
    app.post('/class', async (req, res) => {
      const myClass = req.body;
      console.log(myClass);
      const result = await classCollection.insertOne(myClass);
      res.send(result)
    })
    // delete 
    app.delete('/class/:id', async(req, res) =>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)};
      const result = await classCollection.deleteOne(query);
      res.send(result)
    })
    // classes collection api
    app.get('/class', async (req, res) => {
      const email = req.query.email;
      if(!email){
        res.send([])
      }
      const query = { email: email } ;
      const result = await classCollection.find(query).toArray();
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('GlobeLingo is running')
})



app.listen(port, () => {
  console.log(`GlobeLingo is running on port ${port} `);
})