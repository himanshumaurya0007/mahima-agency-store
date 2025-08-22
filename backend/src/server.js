import dotenv from "dotenv"
import connectDB from "./config/db.js";
import { app } from './app.js'

dotenv.config({ path: "./.env"});

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server running at: http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to start server:", err);
    });
