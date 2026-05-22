import env from 'dotenv'
env.config();
import './config/db.js'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import fs from 'fs'
import router from './routes/router.js'

const swaggerDocument = JSON.parse(fs.readFileSync('./swagger.json', 'utf-8'));

const app = express();

const port = +process.env.PORT || 8778;

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/api",router);

app.listen(port , ()=>{
    console.log(`Server is running on ${port}`);
    
})