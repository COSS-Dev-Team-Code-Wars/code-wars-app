import mongoose from 'mongoose';
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');


// mongodb+srv://jetjetcerezo:EHtQlH6Kbs5IeciH@codewars.mdmsh.mongodb.net/?retryWrites=true&w=majority&appName=codewars
//`mongodb+srv://${dbUsername}:${dbPassword}@${dbCluster}.od4z6.mongodb.net/code-wars`;///?retryWrites=true&w=majority


const dbUsername = process.env.DB_USERNAME;
const dbPassword = process.env.DB_PASSWORD;
const dbCluster = process.env.DB_CLUSTER;
const dbName = process.env.DB_NAME;

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@${dbCluster}`;///?retryWrites=true&w=majority

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Successfully connected to MongoDB!")
  
    //await client.connect();
    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    //console.log("Pinged your deployment. You successfully connected to MongoDB!");

    //await new Promise(resolve => setTimeout(resolve, 1000));
  } 
  catch (err) {
    console.log(err);
  }
  // finally {
  //   // Ensures that the client will close when you finish/error
  //   await client.close();
  //   console.log("MongoDB connection closed.");
  // }
}

// https://stackoverflow.com/questions/36979146/is-a-connection-to-mongodb-automatically-closed-on-process-exit
// Create a function to terminate your app gracefully:
function gracefulShutdown(){
  // First argument is [force], see mongoose doc.
  mongoose.connection.close(false);
  console.log('MongoDb connection closed.');
};

function handleDisconnectDB() {
  // This will handle process.exit():
  process.on('exit', gracefulShutdown);

  // This will handle kill commands, such as CTRL+C:
  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGKILL', gracefulShutdown);

  // This will prevent dirty exit on code-fault crashes:
  process.on('uncaughtException', gracefulShutdown);
}

export { connectDB, handleDisconnectDB };