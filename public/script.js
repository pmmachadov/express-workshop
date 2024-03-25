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
    await fetch('/create-post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blogpost: postContent }),
    });
    await loadPosts();
}



