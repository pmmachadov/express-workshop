document.addEventListener("DOMContentLoaded", function () {
    loadPosts();

    document.getElementById('createPostForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const postContent = document.getElementById('blogpost').value;
        await createPost(postContent);
        document.getElementById('blogpost').value = '';
    });
});

async function loadPosts() {
    const response = await fetch('/posts');
    const posts = await response.json();
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<h3>Recent Posts</h3>';
    Object.entries(posts).forEach(([id, post]) => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `<p>${post}</p>`;
        postsContainer.appendChild(postElement);
    });
}

async function createPost(postContent) {
    if (!postContent.trim()) {
        alert("Post content cannot be empty.");
        return;
    }

    await fetch('/create-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogpost: postContent }),
    });
    await loadPosts();
}


async function loadPosts() {
    const response = await fetch('/posts');
    const posts = await response.json();
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '<h3>Recent Posts</h3>';
    Object.entries(posts).forEach(([id, post]) => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `
            <p>${post}</p>
            <button class="edit-button" onclick="prepareEditPost('${id}', this)">Edit</button>
            <button class="delete-button" onclick="deletePost('${id}')">Delete</button>
        `;
        postsContainer.appendChild(postElement);
    });
}


async function deletePost(postId) {
    const response = await fetch(`/delete-post/${postId}`, { method: 'DELETE' });
    if (response.ok) {
        loadPosts();
    } else {
        alert('Failed to delete the post.');
    }
}

function prepareEditPost(postId, editButton) {
    const postElement = editButton.previousElementSibling;
    const currentContent = postElement.innerHTML;
    postElement.innerHTML = `<textarea class="edit-textarea">${currentContent}</textarea>
                             <button class="save-edit-button" onclick="saveEditPost('${postId}', this, '${currentContent}')">Save</button>
                             <button class="cancel-edit-button" onclick="cancelEditPost(this, '${currentContent}')">Cancel</button>`;
}

function saveEditPost(postId, saveButton, originalContent) {
    const newTextarea = saveButton.previousElementSibling;
    const newContent = newTextarea.value;
    updatePost(postId, newContent).then(() => {
        newTextarea.parentElement.innerHTML = newContent;
    }).catch(() => {
        newTextarea.parentElement.innerHTML = originalContent;
        alert('Failed to update the post.');
    });
}

function cancelEditPost(cancelButton, originalContent) {
    cancelButton.parentElement.innerHTML = originalContent;
}

async function updatePost(postId, newContent) {
    try {
        const response = await fetch(`/update-post/${postId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ blogpost: newContent }),
        });
        if (!response.ok) {
            throw new Error('Failed to update the post');
        }
        await loadPosts();
    } catch (error) {
        console.error('Error updating post:', error);
        alert('Failed to update the post.');
    }
}



