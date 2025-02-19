"use client";
import React, { useEffect, useState } from 'react';

interface Post {
    _id: string;
    title: string;
    content: string;
    createdAt: string;
    user?: { username: string };
}

const Newsfeed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState<string | null>(null);

    const BASE_URL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://';

    // --- (1) Fetch posts ---
    const fetchPosts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/posts`);
            if (!res.ok) {
                throw new Error(`Error fetching posts: ${res.status}`);
            }
            const data = await res.json();
            setPosts(data);
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
                setError('Failed to load posts.');
            } else {
                console.error('Unknown error occurred');
                setError('An unknown error occurred.');
            }
        }
    };

    // --- (2) Create a new post ---
    const createPost = async () => {
        if (!title.trim() || !content.trim()) {
            setError('Title and Content are required.');
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const res = await fetch(`${BASE_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && {
                        'Authorization': `Bearer ${token}`,
                    }),
                },
                body: JSON.stringify({
                    title,
                    content,
                }),
            });

            if (!res.ok) {
                throw new Error(`Error creating post: ${res.status}`);
            }

            const data = await res.json();
            setPosts((prev) => [data.post, ...prev]);
            setTitle('');
            setContent('');
            setError(null);
        } catch (err: unknown) {
            if (err instanceof Error) {
                console.error(err.message);
                setError('Failed to create post.');
            } else {
                console.error('Unknown error occurred');
                setError('An unknown error occurred.');
            }
        }
    };

    // Fetch posts on initial render
    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="flex flex-col items-center py-10 bg-gray-100 min-h-screen">
            <div className="w-full max-w-2xl">
                {/* New Post Form */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-center mb-4">Create a New Post</h2>
                    {error && (
                        <div className="text-red-600 bg-red-100 p-4 rounded mb-4">
                            {error}
                        </div>
                    )}
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full p-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Content"
                        className="w-full p-2 border rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={createPost}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
                    >
                        Post
                    </button>
                </div>

                {/* Display Posts */}
                <h2 className="text-2xl font-bold mb-4">Posts</h2>
                {posts.length > 0 ? (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <div key={post._id} className="bg-white shadow-md rounded-lg p-6">
                                <h3 className="text-xl font-semibold">{post.title}</h3>
                                <p className="text-gray-700 mt-2">{post.content}</p>
                                <p className="text-sm text-gray-500 mt-4">
                                    Posted by: {post.user?.username || 'Anonymous'} on{' '}
                                    {new Date(post.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center">No posts available. Create one!</p>
                )}
            </div>
        </div>
    );
};

export default Newsfeed;
