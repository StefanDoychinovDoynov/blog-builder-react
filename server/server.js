const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Middleware for parsing JSON requests
app.use(bodyParser.json());

// Setting the CORS Policy
app.use(cors({
    origin: "*",
    optionsSuccessStatus: 200
}));

// Directory for storing pages
const UPLOADS_DIR = path.join(__dirname, "uploads");

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Function to scan the uploads directory structure
function GetStructure() {
    const structure = {};

    function scanDirectory(dir, currentPath) {
        const items = fs.readdirSync(dir, { withFileTypes: true });

        items.forEach(item => {
            if (item.isDirectory()) {
                const subPath = path.join(currentPath, item.name);
                structure[subPath] = { type: "directory" };
                scanDirectory(path.join(dir, item.name), subPath); // Recurse into subdirectory
            } else if (item.name === "index.html") {
                const pagePath = currentPath;
                structure[pagePath] = { type: "file" };
            }
        });
    }

    scanDirectory(UPLOADS_DIR, "/");
    return structure;
}

// Serve static HTML pages based on path
const GetPage = require("./routes/GetPage");
app.use("/page", GetPage);

// Get the full directory structure
app.get("/structure", (req, res) => {
    const structure = GetStructure();
    res.status(200).json(structure);
});

// POST request to create/save a new page with schema and HTML content
const CreatePage = require("./routes/CreatePage");
app.use("/page", (req, res, next) => {
    req.UPLOADS_DIR = UPLOADS_DIR;
    next();
}, CreatePage);

// POST request to edit an existing page
const EditPage = require("./routes/EditPage");
app.use("/page/edit", EditPage);

// DELETE request to delete a page
const DeletePage = require("./routes/DeletePage");
app.use("/delete/page", DeletePage);

// Start the server
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
    
    // Load the structure at startup
    console.log(GetStructure());
});