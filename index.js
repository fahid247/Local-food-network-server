const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors())
app.use(express.json())


const uri = "mongodb+srv://local-foods:tytWaqqCRRGg0Pyt@cluster0.6eyhrff.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get("/", (req, res) => {
    res.send("simple server is running")
})

async function run() {
    try {
        await client.connect();
        console.log("✅ MongoDB connected successfully!");

        const reviewDB = client.db('reviewDB')
        const reviewCollection = reviewDB.collection('reviews')
        const userCollection = reviewDB.collection('users')



        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await userCollection.findOne(query);

            if (existingUser) {
                res.send({ message: 'user already exits. do not need to insert again' })
            }
            else {
                const result = await userCollection.insertOne(newUser);
                res.send(result);
            }
        })



        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result)
        })



        app.get('/reviews', async (req, res) => {
            try {
                const search = req.query.search || "";
                const query = search
                    ? { foodName: { $regex: search, $options: "i" } } 
                    : {}; 

                const cursor = reviewCollection.find(query).sort({ date: -1 }); 
                const reviews = await cursor.toArray();

                res.send(reviews);
            } catch (error) {
                console.error(error);
                res.status(500).send({ error: "Failed to fetch reviews" });
            }
        });




        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.send(result)
        })


        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
        });



        app.put('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const updatedReview = req.body;
            const query = { _id: new ObjectId(id) };
            const update = {
                $set: {
                    foodName: updatedReview.foodName,
                    foodImage: updatedReview.foodImage,
                    restaurantName: updatedReview.restaurantName,
                    location: updatedReview.location,
                    rating: updatedReview.rating,
                    reviewText: updatedReview.reviewText,
                    date: new Date(), // update date automatically
                },
            };
            const result = await reviewCollection.updateOne(query, update);
            res.send(result);
        });





        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`the server is runnig on port : ${port}`)
})
