'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { BASE_URL, UPLOADS_URL } from "./lib/config";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import {
  HeartIcon as HeartSolid,
  BoltIcon,
} from "@heroicons/react/24/solid";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  ArrowUpTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import LoadingSpinner from "./components/LoadingSpinner";
import NextGenPostInput from "./components/NextGenPostInput";
import { motion } from "framer-motion";
import { formatPostDate } from "./lib/formatDate";
import useLiveFeed from "./hooks/useLiveFeed";

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────
interface UserData {
  _id: string;
  username: string;
  profilePicture?: string;
  following?: string[];
  location?: string;
  subscriptionExpiresAt?: string;
  accessToken?: string;
  rating?: number;
}

interface Reply {
  _id: string;
  user: UserData;
  content: string;
}

interface Comment {
  _id: string;
  user: UserData;
  content: string;
  replies?: Reply[];
}

interface Post {
  _id: string;
  sharedFrom?: Post;
  content: string;
  image?: string;
  images?: string[];
  createdAt: string;
  likes: string[] | UserData[];
  comments?: Comment[];
  shares?: number;
  user?: UserData;
}


// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, loggedIn, loading, login } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  // post input handled in component
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [sharedPosts, setSharedPosts] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingPostsRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const isPro =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();


  // redirect guest
  useEffect(() => {
    if (!loading && !loggedIn) router.push("/login");
  }, [loading, loggedIn, router]);

  // ────────────────────────────────────────────────────────────
  // Fetch posts (latest first)
  // ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(
    async (page: number, append = false) => {
      if (loadingPostsRef.current) return;
      loadingPostsRef.current = true;
      setLoadingPosts(true);
      try {
        const params: Record<string, string | number> = {
          page,
          limit: 10,
        };
        const { data } = await axios.get<Post[]>(`${BASE_URL}/api/posts`, {
          params,
        });
        if (append) {
          setPosts((prev) => [...prev, ...data]);
          setAllPosts((prev) => [...prev, ...data]);
        } else {
          setPosts(data);
          setAllPosts(data);
        }
        setHasMore(data.length === 10);

        if (user && !append) {
          const liked = data
            .filter((p) => p.likes.some((l: any) => (l._id || l) === user._id))
            .map((p) => p._id);
          setLikedPosts(liked);
        }
      } catch (err) {
        console.error("Post fetch error:", err);
      } finally {
        setLoadingPosts(false);
        loadingPostsRef.current = false;
      }
    },
    [user]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  useLiveFeed('feed', (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setAllPosts((prev) => [post, ...prev]);
  });

  useEffect(() => {
    if (pageNum > 1) fetchPosts(pageNum, true);
  }, [pageNum, fetchPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingPosts) {
        setPageNum((p) => p + 1);
      }
    });
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, loadingPosts]);

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────



  const refreshPosts = async () => {
    setRefreshing(true);
    setPageNum(1);
    await fetchPosts(1);
    setRefreshing(false);
  };

  const addNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev]);
    setAllPosts((prev) => [post, ...prev]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ────────────────────────────────────────────────────────────
  // CRUD (like, comment, reply, share, follow)
  // ────────────────────────────────────────────────────────────

  const handleLike = async (postId: string) => {
    if (!user?.accessToken) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, likes: data.likes } : p))
      );
      setLikedPosts((prev) => [...prev, postId]);
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user?.accessToken) return;
    const text = commentTexts[postId];
    if (!text) return;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comment`,
        { content: text },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p))
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleReply = async (postId: string, commentId: string) => {
    if (!user?.accessToken) return;
    const text = replyTexts[commentId];
    if (!text) return;

    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comment/${commentId}/reply`,
        { content: text },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: data.comments } : p))
      );
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  const handleShare = async (postId: string) => {
    if (!user?.accessToken) return;
    try {
      const { data } = await axios.post(
        `${BASE_URL}/api/posts/${postId}/share`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, shares: data.shares } : p))
      );
      setSharedPosts((prev) => [...prev, postId]);
      if (data.newPost) {
        setPosts((prev) => [data.newPost, ...prev]);
      }
      const postToShare = posts.find((p) => p._id === postId);
      const shareLink = `${window.location.origin}/profile/${postToShare?.user?._id || ""}?post=${postId}`;
      try {
        await navigator.clipboard.writeText(shareLink);
        alert("Share link copied!");
      } catch {
        console.warn("Clipboard copy failed");
      }
    } catch (err) {
      console.error("Share error:", err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!user?.accessToken) return;
    try {
      await axios.delete(`${BASE_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEdit = async (post: Post) => {
    if (!user?.accessToken) return;
    const newContent = window.prompt("Edit post", post.content);
    if (newContent === null) return;
    try {
      const { data } = await axios.put(
        `${BASE_URL}/api/posts/${post._id}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      if (data.post) {
        setPosts((prev) =>
          prev.map((p) => (p._id === post._id ? { ...p, content: data.post.content } : p))
        );
      }
    } catch (err) {
      console.error("Edit error:", err);
    }
  };


  const handleFollow = async (targetId: string) => {
    if (!user?.accessToken) return;
    try {
      await axios.post(
        `${BASE_URL}/api/users/${targetId}/follow`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login(
        { ...user, following: [...(user.following || []), targetId] },
        user.accessToken
      );
    } catch (err) {
      console.error("Follow error:", err);
    }
  };

  const handleUnfollow = async (targetId: string) => {
    if (!user?.accessToken) return;
    try {
      await axios.post(
        `${BASE_URL}/api/users/${targetId}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login(
        {
          ...user,
          following: (user.following || []).filter((id) => id !== targetId),
        },
        user.accessToken
      );
    } catch (err) {
      console.error("Unfollow error:", err);
    }
  };

  const toggleComments = (postId: string) =>
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

  const toggleMenu = (postId: string) =>
    setOpenMenus((prev) => ({ ...prev, [postId]: !prev[postId] }));

  // ────────────────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-secondary text-white">
      {/* Membership banner */}
      {loggedIn && !isPro && (
        <div className="bg-brand text-white text-center py-2 px-4">
          <Link href="/subscription" className="font-semibold underline">
            Гишүүн болох – Онцгой боломжуудыг нээх
          </Link>
        </div>
      )}


      {/* Outer grid */}
      <div
        className="mx-auto max-w-5xl w-full grid"
        style={{
          gridTemplateColumns:
            "var(--barcelona-threadline-column-width) minmax(0, 1fr)",
        }}
      >


        {/* Main content */}
        <main>
          {/* Prompt login */}
          {!loggedIn && (
            <div className="bg-secondary p-6 text-center space-y-3">
              <p>Feed үзэхийн тулд нэвтрэх эсвэл бүртгүүлэх шаардлагатай.</p>
              <Link href="/login" className="text-blue-600 underline">
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="block bg-brand text-white px-3 py-1 rounded w-fit mx-auto"
              >
                Бүртгүүлэх
              </Link>
            </div>
          )}

          {/* Subscription gate */}
          {loggedIn && !isPro ? (
            <div className="bg-secondary p-6 text-center space-y-3">
              <p>Feed үзэхийн тулд гишүүнчлэл идэвхжүүлнэ үү.</p>
              <Link href="/subscription" className="text-blue-600 underline">
                Subscribe
              </Link>
            </div>
          ) : (
            <>
              {/* Create post */}
              {loggedIn && (
                <NextGenPostInput onPost={addNewPost} />
              )}

              <div className="flex justify-end p-4">
                <button
                  onClick={refreshPosts}
                  aria-label="Refresh feed"
                  className={`p-2 rounded-full hover:bg-gray-200 ${refreshing ? "animate-spin" : ""}`}
                >
                  <ArrowPathIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Posts list */}
              <div className="m-0 p-0">
              {loadingPosts && pageNum === 1 ? (
                  <LoadingSpinner />
                ) : (
                  posts.map((post, idx) => {
                const postUser = post.user;

                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white p-6 grid gap-4 border-b-0 sm:border-b sm:border-gray-200 dark:bg-[#2a2a2a] sm:dark:border-gray-700 dark:text-white"
                  >
                    {/* Header */}
                    <div className="grid grid-cols-[auto,1fr] gap-5 group">
                      {/* Avatar */}
                      <div className="self-start">
                        {postUser?.profilePicture ? (
                          <Image
                            src={`${BASE_URL}${postUser.profilePicture}`}
                            alt="Avatar"
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded-md"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-gray-300 animate-pulse" />
                        )}
                      </div>

                      {/* Body */}
                      <div className="grid gap-2">
                        <div className="grid grid-cols-[1fr,auto] items-center">
                          <Link href={`/profile/${postUser?._id || ""}`}>
                            <span className="text-sm font-semibold hover:underline">
                              {postUser?.username || "Unknown User"}
                            </span>
                          </Link>

                          {postUser && user && user._id !== postUser._id && (
                            <div>
                              {user.following?.includes(postUser._id) ? (
                                <button
                                  onClick={() => handleUnfollow(postUser._id)}
                                  className="text-green-600 text-xs"
                                >
                                  Unfollow
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleFollow(postUser._id)}
                                  className="text-brand text-xs"
                                >
                                  Follow
                                </button>
                              )}
                            </div>
                          )}
                          {postUser && user && user._id === postUser._id && (
                            <div className="ml-auto relative">
                              <button
                                onClick={() => toggleMenu(post._id)}
                                aria-label="Post options"
                                className="p-1"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-5 h-5"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M5 12h.01M12 12h.01M19 12h.01"
                                  />
                                </svg>
                              </button>
                              {openMenus[post._id] && (
                                <div className="absolute right-0 mt-1 bg-[#333] text-white border border-gray-700 rounded shadow">
                                  <button
                                    onClick={() => handleEdit(post)}
                                    className="block px-3 py-1 text-sm hover:bg-gray-600 w-full text-left"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post._id)}
                                    className="block px-3 py-1 text-sm hover:bg-gray-600 w-full text-left text-red-400"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatPostDate(post.createdAt)}
                        </span>
                        <BoltIcon className="w-3 h-3 text-green-400 ml-1 inline" />

                        {/* Content */}
                        {post.sharedFrom && (
                          <p className="text-xs text-gray-500">Shared from {post.sharedFrom.user?.username}</p>
                        )}
                        <div className="relative">
                          { (post.sharedFrom ? post.sharedFrom.content : post.content) && (
                            <p className="text-base whitespace-pre-wrap">{post.sharedFrom ? post.sharedFrom.content : post.content}</p>
                          )}
                          { (post.sharedFrom ? post.sharedFrom.image : post.image) && (
                            <div className="relative w-full overflow-hidden rounded-lg mt-2">
                              <Image
                                src={`${UPLOADS_URL}/${post.sharedFrom ? post.sharedFrom.image : post.image}`}
                                alt="Post"
                                width={800}
                                height={600}
                                className="w-full h-auto object-cover rounded-lg"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-3 items-center text-xs text-gray-600 w-full mt-2">
                      {/* Like */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleLike(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-brand"
                        aria-label={`Like (${post.likes.length})`}
                      >
                        {likedPosts.includes(post._id) ? (
                          <HeartSolid className="w-5 h-5 text-brand icon-hover-brand" />
                        ) : (
                          <HeartOutline className="w-5 h-5 icon-hover-brand" />
                        )}
                        <span>{post.likes.length}</span>
                      </motion.button>

                      {/* Comment */}
                      <button
                        onClick={() => toggleComments(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-brand"
                        aria-label={`Comment (${post.comments?.length || 0})`}
                      >
                        <ChatBubbleOvalLeftIcon className="w-5 h-5 icon-hover-brand" />
                        <span>{post.comments?.length || 0}</span>
                      </button>

                      {/* Share */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={() => handleShare(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-brand"
                        aria-label={`Share (${post.shares || 0})`}
                      >
                        <ArrowUpTrayIcon
                          className={`w-5 h-5 ${
                            sharedPosts.includes(post._id) ? "text-brand icon-hover-brand" : "icon-hover-brand"
                          }`}
                        />
                        <span>{post.shares || 0}</span>
                      </motion.button>
                    </div>

                    {/* Comment section */}
                    {openComments[post._id] && (
                      <div className="mt-4 space-y-3">
                        {post.comments?.map((comment) => (
                          <div key={comment._id} className="ml-4">
                            <div className="flex items-start gap-2">
                              {comment.user?.profilePicture && (
                                <Image
                                  src={`${BASE_URL}${comment.user.profilePicture}`}
                                  alt="avatar"
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1 bg-gray-100 rounded p-2">
                                <p className="text-sm font-semibold">
                                  {comment.user?.username}
                                </p>
                                <p className="text-sm">{comment.content}</p>

                                {/* Replies */}
                                {comment.replies?.map((reply) => (
                                  <div
                                    key={reply._id}
                                    className="ml-4 mt-2 flex gap-2 items-start"
                                  >
                                    {reply.user?.profilePicture && (
                                      <Image
                                        src={`${BASE_URL}${reply.user.profilePicture}`}
                                        alt="avatar"
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 rounded-full object-cover"
                                      />
                                    )}
                                    <div className="flex-1 bg-gray-50 rounded p-2">
                                      <p className="text-xs font-semibold">
                                        {reply.user?.username}
                                      </p>
                                      <p className="text-xs">{reply.content}</p>
                                    </div>
                                  </div>
                                ))}

                                {/* Reply box */}
                                <div className="flex items-center mt-2">
                                  <input
                                    type="text"
                                    placeholder="Reply..."
                                    className="flex-1 text-xs border border-gray-300 rounded p-1"
                                    value={replyTexts[comment._id] || ""}
                                    onChange={(e) =>
                                      setReplyTexts((prev) => ({
                                        ...prev,
                                        [comment._id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    onClick={() => handleReply(post._id, comment._id)}
                                    className="ml-2 text-xs text-blue-500"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* New comment box */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            className="flex-1 text-sm border border-gray-300 rounded p-2"
                            value={commentTexts[post._id] || ""}
                            onChange={(e) =>
                              setCommentTexts((prev) => ({
                                ...prev,
                                [post._id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            onClick={() => handleComment(post._id)}
                            className="text-sm text-blue-500"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
            {loadingPosts && pageNum > 1 && <LoadingSpinner />}
            <div ref={loadMoreRef} />
          </div>
            </>
        )}
        </main>
      </div>
    </div>
  );
}
