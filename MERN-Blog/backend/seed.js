import mongoose from "mongoose";
import dotenv from "dotenv";
import {Blog} from "./models/blog.model.js"; // apna model path

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Blog.create({
      title: "Test Blog",
      description: "This is inserted manually",
    });

    console.log("✅ Blog inserted");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seed(); //isse run karaunga toh jaise local mae chl rha h vaise he chalega