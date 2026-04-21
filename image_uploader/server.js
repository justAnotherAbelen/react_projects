import express from 'express';
import multer from 'multer';
import path from "path"
import {fileURLToPath} from "url"
import fs from "fs"

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/upload",express.static(path.join(__dirname,"imgs")))

if(!fs.existsSync(path.join(__dirname,"imgs"))){
    fs.mkdirSync("./imgs")
}

const storage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,path.join(__dirname,"imgs"))
    },
    filename: (req,file,cb)=>{
        const suffixName = Date.now() + "-" + Math.round(Math.random() * 1E9);
        const extName = path.extname(file.originalname);
        cb(null,file.fieldname + "-" + suffixName + extName);
    }
})

const upload = multer({storage : storage});

// Accept several common single-file field names to avoid "Unexpected field".
app.post("/upload",upload.fields([{ name: "file", maxCount: 1 }, { name: "image", maxCount: 1 }, { name: "upload", maxCount: 1 }]),(req,res) => {
    const file = req.files?.file?.[0] || req.files?.image?.[0] || req.files?.upload?.[0];
    if(!file){
        return res.status(400).json({message: "No file uploaded"});
    }
    return res.status(200).json({message: "File uploaded successfully",file,url: `http://localhost:3000/upload/${file.filename}`});
})

app.post("/upload-multiple",upload.array("files",10),(req,res) => {
    if(!req.files || req.files.length === 0){
        return res.status(400).json({message: "No files uploaded"});
    }
    const files = req.files.map(file => ({
        filename: file.filename,
        url: `http://localhost:3000/upload/${file.filename}`
    }));
    return res.status(200).json({message: "Files uploaded successfully",files:files});
})

app.listen(3000,() => {
    console.log("Server is running on port 3000");
})

// Return JSON for upload-related errors instead of the default HTML error page.
app.use((err, req, res, next) => {
    if(err instanceof multer.MulterError){
        return res.status(400).json({ message: err.message, code: err.code });
    }
    if(err){
        return res.status(500).json({ message: "Internal server error" });
    }
    next();
});