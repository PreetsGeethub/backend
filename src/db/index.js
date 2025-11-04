import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";


const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n mongoDB connected !! DB HOST: ${connectionInstance}`)
    } catch (error) {
        console.log("ERROR in connectiong with db",error);
        process.exit(1);
    }
}
export default connectDB;