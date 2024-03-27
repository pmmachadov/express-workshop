// Import necessary modules and initialize Express application
const express = require("express"); // Import Express framework to handle HTTP requests.
const formidable = require("express-formidable"); // Middleware for parsing form data, including file uploads.
const cors = require('cors'); // Middleware to enable CORS (Cross-Origin Resource Sharing).
const fs = require("fs").promises; // File system module with Promise support for asynchronous file operations.
const path = require("path"); // Module for handling and transforming file paths.
const app = express(); // Create an Express application.
const port = 3000; // Define the port number on which the server will listen.

// Middleware setup
app.use(cors()); // Apply CORS middleware to allow cross-origin requests.
app.use(formidable()); // Apply formidable middleware to parse incoming form data.
app.use(express.static("public")); // Serve static files from the "public" directory.

// Route handlers
// Define route for the root path
app.get("/", (req, res) => {
    res.send("Hello Pablo Machado!"); // Send a greeting message.
});

// Additional GET routes for different paths
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

// POST route to create a new blog post
app.post("/create-post", async (req, res) => {
    try {
        const newPost = req.fields.textarea; // Extract blog post content from request fields.

        // Validate the post content
        if (!newPost.trim()) {
            return res.status(400).send("Blog post content cannot be empty."); // Return error if content is empty.
        }

        const filePath = path.join(__dirname, "/data/posts.json"); // Define file path for storing posts.

        // Attempt to read existing posts from file
        let currentPosts = {};
        try {
            const currentPostsData = await fs.readFile(filePath, "utf8");
            if (currentPostsData) {
                currentPosts = JSON.parse(currentPostsData); // Parse JSON data into an object.
            }
        } catch (readError) {
            console.log("No existing posts or unable to read file, starting with an empty object.");
        }

        const timestamp = Date.now(); // Generate a timestamp to use as the post ID.
        currentPosts[timestamp] = newPost; // Add new post to the posts object.

        // Write updated posts back to file
        await fs.writeFile(filePath, JSON.stringify(currentPosts, null, 2), "utf8");

        console.log("New blog post saved.");
        res.send("Blog post saved successfully."); // Respond with success message.
    } catch (error) {
        console.error("Failed to save the blog post:", error);
        res.status(500).send("Failed to save the blog post."); // Handle errors.
    }
});

// GET route to serve all blog posts
app.get("/posts", (req, res) => {
    const filePath = path.join(__dirname, "/data/posts.json"); // Define file path for posts.
    res.sendFile(filePath, (err) => { // Send the posts file.
        if (err) {
            console.log(err);
            res.status(500).send("Failed to send the blog posts."); // Handle file sending errors.
        }
    });
});

// Listen on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); // Log that the server has started.
});

// PATCH route to update an existing blog post
app.patch("/update-post/:id", async (req, res) => {
    const postId = req.params.id; // Extract the post ID from URL parameters.
    const updatedContent = req.fields.textarea; // Extract the updated content from request fields.
    const filePath = path.join(__dirname, "/data/posts.json"); // Define file path for posts.

    try {
        const postsData = await fs.readFile(filePath, "utf8");
        const posts = JSON.parse(postsData);

        // Check if the post exists before updating
        if (posts[postId]) {
            posts[postId] = updatedContent; // Update the post content.
            await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf8"); // Write updated posts back to file.
            res.send("Post updated successfully."); // Respond with success message.
        } else {
            res.status(404).send("Post not found."); // Handle case where post does not exist.
        }
    } catch (error) {
        console.error("Failed to update the post:", error);
        res.status(500).send("Failed to update the post."); // Handle errors.
    }
});

// DELETE route to delete a blog post
app.delete("/delete-post/:id", async (req, res) => {
    const postId = req.params.id; // Extract the post ID from URL parameters.
    const filePath = path.join(__dirname, "/data/posts.json"); // Define file path for posts.

    try {
        const postsData = await fs.readFile(filePath, "utf8");
        const posts = JSON.parse(postsData);

        // Check if the post exists before deleting
        if (posts[postId]) {
            delete posts[postId]; // Delete the specified post.
            await fs.writeFile(filePath, JSON.stringify(posts, null, 2), "utf8"); // Write updated posts back to file.
            res.send("Post deleted successfully."); // Respond with success message.
        } else {
            res.status(404).send("Post not found."); // Handle case where post does not exist.
        }
    } catch (error) {
        console.error("Failed to delete the post:", error);
        res.status(500).send("Failed to delete the post."); // Handle errors.
    }
});
