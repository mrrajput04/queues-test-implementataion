import express, {NextFunction, Request, Response} from "express"
import { Queue } from "bullmq"
import { addUserToCourseQuery } from "./utils/course";
import dotenv from "dotenv"
dotenv.config();


const app = express();
const PORT = process.env.APP_PORT ?? 7000;

const emailQueue = new Queue('email_queue',{
    connection:{
        host: process.env.HOST,
        port: 14879,
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
    }
})

app.use((req, res, next)=>{
    console.log(`${req.method}${req.url}`)
    next();
})

app.get("/", (_req: Request, res: Response):any => {
    return res.json({ status: "success", message: "Hello from Express Server" });
});

app.post("/add-user-to-course", async (_req: Request, res: Response):Promise<any> => {
    try {
        console.log("Adding user to course");
        // Critical
        await addUserToCourseQuery();
        await emailQueue.add(`${Date.now()}`, {
            from: "piyushgarg.dev@gmail.com",
            to: "student@gmail.com",
            subject: "Congrats on enrolling in Twitter Course",
            body: "Dear Student, You have been enrolled to Twitter Clone Course.",
        });
        console.log("added in queue...")
        return res.json({ status: "success", data: { message: "Enrolled Success" } });
    } catch (error) {
        console.error("Error adding user to course:", error);
        return res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`)
})