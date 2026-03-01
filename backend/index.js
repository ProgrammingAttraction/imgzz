require("dotenv").config();
const express=require('express');
const cors=require('cors');
const app=express();
const port=process.env.PORT || 5000;
const connectDB=require('./config/Db');
app.use(cors( {
  origin:[
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
      "http://localhost:5178",
      "http://localhost:3000",
      "https://imgzz.genzz.casino",
      "https://imgzz.credixopay.com",
      "*",
    ], // Specify the allowed origin
  methods: ["GET", "POST", "PUT", "DELETE","PATCH","OPTIONS"], // Specify allowed methods
  allowedHeaders: ["Content-Type", "Authorization"," x-api-key"], // Specify allowed headers
  credentials: true, // Allow credentials (cookies, etc.)
  optionsSuccessStatus:200,
}));
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use("/api/auth",require("./routes/auth"));
app.use("/api/admin",require("./routes/AdminRouter"));
connectDB();
app.get("",(req,res)=>{
    try {
        res.send("hello world")
    } catch (error) {
        console.log(error)
    }
})


app.listen(port,()=>{
    console.log(`server is running on port ${port}`);
})
