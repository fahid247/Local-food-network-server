const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.port || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://local-foods:721pPl89USTHXeHx@cluster0.6eyhrff.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

app.get("/",(req,res)=>{
    res.send("simple server is running")
})

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const reviewDB = client.db('reviewDB')
    const reviewCollection = reviewDB.collection('reviews')
    


    app.get('/reviews',async(req,res)=>{
        const cursor = reviewCollection.find()
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/reviews/:id', async(req,res)=>{
        const id = req.params.id;
        const query = {_id : new ObjectId(id)}
        const result = await reviewCollection.findOne(query)
        res.send(result)
    })
    
    app.post('/reviews',async(req,res)=>{
        const newReview = req.body;
        const result = await reviewCollection.insertOne(newReview);
        res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(port,()=>{
    console.log(`the server is runnig on port : ${port}`)
})
