import dotenv from "dotenv";
import {app} from "./app.js";
import connectDB from "./db/index.js";
dotenv.config({
  path: "./src/.env",
});
const PORT = process.env.PORT || 3000;




connectDB()
.then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch((error) => {
  console.error("Error starting server:", error);
  process.exit(1);
});
