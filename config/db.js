import mongoose from "mongoose";

const connectDB = async () => {
    try{
        await mongoose.connect (process.env.MONGO_DATABASE_URI)
        console.log(`Sucessful connect to the Database `)
    } catch(error){
        console.error(`Error: ${error.message}`)
        process.exit(1)
        
    };

    
}

export default connectDB;


