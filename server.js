const express = require("express");
const formidable = require("express-formidable");
const cors = require('cors');
const fs = require("fs").promises;
const path = require("path");
const app = express();
const port = 3000;

app.use(cors());
app.use(formidable());
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("Hello Pablo Machado!");
});

app.get("/barcelona", (req, res) => {
    res.send("Hello Barcelona!");
});

app.get("/coding", (req, res) => {
    res.send("I am coding!");
});

app.get("/node", (req, res) => {
    res.send("I love node!");
});

app.get("/express", (req, res) => {
    res.send("I use express");
});

app.post("/create-post", async (req, res) => {
    try {
        const newPost = req.fields.blogpost;
        const filePath = path.join(__dirname, "/data/posts.json");

        let currentPosts = {};

        try {
            // Try to read the current posts
            const currentPostsData = await fs.readFile(filePath, "utf8");
            if (currentPostsData) {
                currentPosts = JSON.parse(currentPostsData);
            }
        } catch (readError) {
            console.log("No existing posts or unable to read file, starting with an empty object.");
        }

        const timestamp = Date.now();
        currentPosts[timestamp] = newPost;

        // Write the updated posts back to the file
        await fs.writeFile(filePath, JSON.stringify(currentPosts, null, 2), "utf8");

        console.log("New blog post saved.");
        res.send("Blog post saved successfully.");
    } catch (error) {
        console.error("Failed to save the blog post:", error);
        res.status(500).send("Failed to save the blog post.");
    }
});

// Route to get the blog posts
app.get("/posts", (req, res) => {
    const filePath = path.join(__dirname, "/data/posts.json");
    res.sendFile(filePath, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send("Failed to send the blog posts.");
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
