import env from 'dotenv'
env.config();
import './config/db.js'
import express from 'express'
import router from './routes/router.js'
const app = express();

const port = +process.env.PORT || 8778;


app.use(express.json());

app.use("/api",router);

app.listen(port , ()=>{
    console.log(`Server is running on ${port}`);
    
})