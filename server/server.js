import "dotenv/config"
import express from "express"
import cors from "cors"
import connectDB from "./config/mongodb.js"


// app configuration
const PORT = process.env.PORT || 4000
const app = express()
await connectDB()

// middleware
app.use(express.json())
app.use(cors())

// API routes
app.get('/',(req, res) => res.send("API WORKING"))

app.listen(PORT,()=>console.log("listening on port "+PORT));
