// Add an event listener for the DOMContentLoaded event to ensure the DOM is fully loaded before executing any script.
document.addEventListener("DOMContentLoaded", function () {
    // Call loadPosts function to load and display posts as soon as the DOM content is fully loaded.
    loadPosts();

    // Add a submit event listener to the form with the id 'createPostForm'. This is for creating new posts.
    document.getElementById('createPostForm').addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submit action to handle the submission with JavaScript.
        const postContent = document.getElementById('blogpost').value; // Get the value entered in the textarea with id 'blogpost'.
        await createPost(postContent); // Call createPost function with the postContent to create a new post.
        document.getElementById('blogpost').value = ''; // Reset the textarea value to an empty string after submitting.
    });
});

// Define the loadPosts async function to fetch and display posts.
async function loadPosts() {
    const response = await fetch('/posts'); // Fetch the list of posts from the server.
    const posts = await response.json(); // Convert the response to JSON.
    const postsContainer = document.getElementById('postsContainer'); // Get the container where posts will be displayed.
    postsContainer.innerHTML = '<h3>Recent Posts</h3>'; // Initialize the container with a title.
    // Iterate over the posts object and create a div for each post.
    Object.entries(posts).forEach(([id, post]) => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `<p>${post}</p>
                                 <button class="edit-button" onclick="prepareEditPost('${id}', this)">Edit</button>
                                 <button class="delete-button" onclick="deletePost('${id}')">Delete</button>`;
        postsContainer.appendChild(postElement); // Append each post div to the container.
    });
}

// Define the createPost async function to submit a new post.
async function createPost(postContent) {
    if (!postContent.trim()) { // Check if the post content is not just whitespace.
        alert("Post content cannot be empty."); // Show an alert if the content is empty.
        return;
    }

    // Send a POST request to the server with the new post content.
    await fetch('/create-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blogpost: postContent }), // Convert the post content into JSON format.
    });
    await loadPosts(); // Reload the posts to include the new post.
}

// Define the deletePost async function to delete a post by its ID.
async function deletePost(postId) {
    const response = await fetch(`/delete-post/${postId}`, { method: 'DELETE' }); // Send a DELETE request to the server.
    if (response.ok) { // Check if the request was successful.
        loadPosts(); // Reload the posts to reflect the deletion.
    } else {
        alert('Failed to delete the post.'); // Show an alert if the deletion failed.
    }
}

// Define the prepareEditPost function to switch the post display to an editable textarea.
function prepareEditPost(postId, editButton) {
    const postElement = editButton.previousElementSibling; // Get the post content element.
    const currentContent = postElement.innerHTML; // Store the current post content.
    // Replace the post content with a textarea for editing, including Save and Cancel buttons.
    postElement.innerHTML = `<textarea class="edit-textarea">${currentContent}</textarea>
                             <button class="save-edit-button" onclick="saveEditPost('${postId}', this, '${currentContent}')">Save</button>
                             <button class="cancel-edit-button" onclick="cancelEditPost(this, '${currentContent}')">Cancel</button>`;
}

// Define the saveEditPost function to handle saving the edited post.
function saveEditPost(postId, saveButton, originalContent) {
    const newTextarea = saveButton.previousElementSibling; // Get the textarea element.
    const newContent = newTextarea.value; // Get the updated content from the textarea.
    // Try to update the post with the new content.
    updatePost(postId, newContent).then(() => {
        newTextarea.parentElement.innerHTML = newContent; // If successful, update the post element with the new content.
    }).catch(() => {
        newTextarea.parentElement.innerHTML = originalContent; // If the update fails, revert to the original content.
        alert('Failed to update the post.'); // Show an alert indicating the update failure.
    });
}

// Define the cancelEditPost function to cancel editing and revert to the original content.
function cancelEditPost(cancelButton, originalContent) {
    cancelButton.parentElement.innerHTML = originalContent; // Replace the editable textarea with the original post content.
}

// Define the updatePost async function to send the updated post content to the server.
async function updatePost(postId, newContent) {
    try {
        const response = await fetch(`/update-post/${postId}`, {
            method: 'PATCH', // Use the PATCH method to partially update the post.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blogpost: newContent }), // Send the updated content as JSON.
        });
        if (!response.ok) { // Check if the request failed.
            throw new Error('Failed to update the post'); // Throw an error if the update failed.
        }
        await loadPosts(); // Reload the posts to include the updated post.
    } catch (error) {
        console.error('Error updating post:', error); // Log the error to the console.
        alert('Failed to update the post.'); // Show an alert indicating the update failure.
    }
}
