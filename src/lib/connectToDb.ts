import mongoose from "mongoose";

export const connectToDb = async () => {
    console.log("Connecting to DB");
   try {
        if (mongoose.connection.readyState === 1) {
            return mongoose.connection.asPromise();
        }
        const db = await mongoose.connect(process.env.NEXT_PUBLIC_MONGODB_URI!, {
            dbName: process.env.NEXT_PUBLIC_DB_NAME!,
           
        });
        console.log("Connected to DB");
        return db;
    }
    catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw new Error("Failed to connect to the database");
    }
   
    }
