import { MongoClient, ServerApiVersion } from "mongodb";

const uri: string =
    "mongodb+srv://mauricerio:4kkPzXDzfoe1TvXI@playlistlabs.op9ppfo.mongodb.net/?retryWrites=true&w=majority&appName=playlistLabs";

// Create a MongoClient instance with MongoClientOptions
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Asynchronous function to establish connection and perform ping operation
async function run(): Promise<void> {
    try {
        // Connect the client to the MongoDB server (optional starting in v4.7)
        await client.connect();

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log(
            "Pinged your deployment. You successfully connected to MongoDB!"
        );
    } finally {
        // Ensure that the client will close when the function completes or errors
        await client.close();
    }
}

// Execute the asynchronous function and handle any errors
run().catch(console.dir);
