const stream = require("stream");
const express = require("express");
const multer = require("multer");
const path = require("path");
const { google } = require("googleapis");
const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.listen(5050, () => {
    console.log('Form running on port 5050');
});

const KEYFILEPATH = path.join(__dirname, "cred.json");
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
});

app.post("/upload", upload.any(), async (req, res) => {
    try {
        const { body, files } = req;
        const name = body.name; // Get the name from the input field
        console.log("Name:", name);

        for (let f = 0; f < files.length; f += 1) {
            await uploadFile(files[f], name);
        }

        res.status(200).send("Form Submitted");
    } catch (f) {
        res.send(f.message);
    }
});

const uploadFile = async (fileObject, name) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(fileObject.buffer);
    
    const fileExtension = path.extname(fileObject.originalname);
    const fileName = `${name}${fileExtension}`; // Name the file based on the input name

    const { data } = await google.drive({ version: "v3", auth }).files.create({
        media: {
            mimeType: fileObject.mimetype,
            body: bufferStream,
        },
        requestBody: {
            name: fileName,
            parents: ["19dAKTY2vobtZhlTVi-BjlwG56UBRxZqe"], // Replace with your folder ID
        },
        fields: "id,name",
    });
    console.log(`Uploaded file ${data.name} ${data.id}`);
};
