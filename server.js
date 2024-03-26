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

        if (!newPost.trim()) {
            return res.status(400).send("Blog post content cannot be empty.");
        }

        const filePath = path.join(__dirname, "/data/posts.json");

        let currentPosts = {};

        try {
            const currentPostsData = await fs.readFile(filePath, "utf8");
            if (currentPostsData) {
                currentPosts = JSON.parse(currentPostsData);
            }
        } catch (readError) {
            console.log("No existing posts or unable to read file, starting with an empty object.");
        }

        const timestamp = Date.now();
        currentPosts[timestamp] = newPost;

        await fs.writeFile(filePath, JSON.stringify(currentPosts, null, 2), "utf8");

        console.log("New blog post saved.");
        res.send("Blog post saved successfully.");
    } catch (error) {
        console.error("Failed to save the blog post:", error);
        res.status(500).send("Failed to save the blog post.");
    }
});

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

app.patch("/update-post/:id", async (req, res) => {
    const postId = req.params.id;
    const updatedContent = req.fields.blogpost;
    const filePath = path.join(__dirname, "/data/posts.json");

    try {
        const postsData = await fs.readFile(filePath, "utf8");
        const posts = JSON.parse(postsData);

        if (posts[postId]) {
            posts[postId] = updatedContent;
            await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf8");
            res.send("Post updated successfully.");
        } else {
            res.status(404).send("Post not found.");
        }
    } catch (error) {
        console.error("Failed to update the post:", error);
        res.status(500).send("Failed to update the post.");
    }
});

app.delete("/delete-post/:id", async (req, res) => {
    const postId = req.params.id;
    const filePath = path.join(__dirname, "/data/posts.json");

    try {
        const postsData = await fs.readFile(filePath, "utf8");
        const posts = JSON.parse(postsData);

        if (posts[postId]) {
            delete posts[postId];
            await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf8");
            res.send("Post deleted successfully.");
        } else {
            res.status(404).send("Post not found.");
        }
    } catch (error) {
        console.error("Failed to delete the post:", error);
        res.status(500).send("Failed to delete the post.");
    }
});
