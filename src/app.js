import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
     credentials:true
}))

app.use(express.json({limit:"16kb"})) // we are configuring  here  is tha how much json we should limit ot expect on our server -- for forms and all

app.use(urlencoded({extended: true,limit:"16kb"})) // extended here means that we can pass the  neseted objects

app.use(express.static("public")) // to store static assests like images,pdfs or folders on our server,here the public parameter is the folder name in which we are gonna store all these assets

app.use(cookieParser()) // for performing crud operations on the cookies by the server on the users browser



//routes import
import userRouter from './routes/user.routes.js'

//router declaration
app.use("/api/v1/users",userRouter) // whenever the user wil hit or type '/user' we will give the control to the userRouter

// http://localhost:8000/api/v1/api/users/register

export { app}
