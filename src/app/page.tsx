'use client';
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useRef,
} from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import {
  HeartIcon as HeartSolid,
  BoltIcon,
} from "@heroicons/react/24/solid";
import {
  HeartIcon as HeartOutline,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { FiCamera } from "react-icons/fi";
import LoadingSpinner from "./components/LoadingSpinner";
import { motion } from "framer-motion";
import { formatPostDate } from "./lib/formatDate";
import useCurrentLocation from "./hooks/useCurrentLocation";

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
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [sharedPosts, setSharedPosts] = useState<string[]>([]);
  const [pageNum, setPageNum] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadingPostsRef = useRef(false);
  const [refreshing, setRefreshing] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const viewerCoords = useCurrentLocation();
  const isPro =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  const BASE_URL = "https://www.vone.mn";
  const UPLOADS_URL = `${BASE_URL}/api/uploads`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // redirect guest
  useEffect(() => {
    if (!loading && !loggedIn) router.push("/login");
  }, [loading, loggedIn, router]);

  // ────────────────────────────────────────────────────────────
  // Fetch posts (location-aware smart sort)
  // ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(
    async (page: number, append = false) => {
      if (loadingPostsRef.current) return;
      loadingPostsRef.current = true;
      setLoadingPosts(true);
      try {
        const params: Record<string, string | number> = {
          sort: "smart",
          page,
          limit: 10,
        };
        if (viewerCoords) {
          params.currentLocation = `${viewerCoords.latitude},${viewerCoords.longitude}`;
        } else if (user?.location) {
          params.currentLocation = user.location;
        }
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
    [user, viewerCoords]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

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


  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  const refreshPosts = async () => {
    setRefreshing(true);
    setPageNum(1);
    await fetchPosts(1);
    setRefreshing(false);
  };

  // ────────────────────────────────────────────────────────────
  // CRUD (create, like, comment, reply, share, follow)
  // ────────────────────────────────────────────────────────────
  const createPost = async () => {
    setError("");
    if (!content.trim()) return setError("Контентыг бөглөнө үү");
    if (content.length > 500) return setError("Хэт урт контент");
    if (!user?.accessToken) return setError("Нэвтэрч ороогүй байна.");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      const { data } = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts((prev) => [data.post, ...prev]);
      setAllPosts((prev) => [data.post, ...prev]);
      setContent("");
      setImageFile(null);
    } catch (err) {
      console.error("Create post error:", err);
      setError("Алдаа гарлаа");
    }
  };

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

  // ────────────────────────────────────────────────────────────
  // UI
  // ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Membership banner */}
      {loggedIn && !isPro && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4">
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
            <div className="bg-white p-6 text-center space-y-3">
              <p>Feed үзэхийн тулд нэвтрэх эсвэл бүртгүүлэх шаардлагатай.</p>
              <Link href="/login" className="text-blue-600 underline">
                Нэвтрэх
              </Link>
              <Link
                href="/register"
                className="block bg-yellow-300 text-black px-3 py-1 rounded w-fit mx-auto"
              >
                Бүртгүүлэх
              </Link>
            </div>
          )}

          {/* Create post */}
          {loggedIn && (
            <div className="bg-white grid gap-4 p-6">
              {/* Upload */}
              <div className="grid grid-cols-[auto,1fr] items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  onClick={triggerFileInput}
                  className="p-2 border border-gray-200 rounded-full hover:bg-gray-200"
                >
                  <FiCamera className="w-5 h-5 text-brandCyan" />
                </button>
                {imageFile && (
                  <span className="text-xs text-gray-700 truncate">
                    {imageFile.name}
                  </span>
                )}
              </div>


              <textarea maxLength={500}
                placeholder="What's on your mind?"
                className="w-full text-sm text-gray-900 border border-gray-200 rounded p-2 focus:outline-none"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

              <button
                onClick={createPost}
                className="mt-3 bg-brandCyan text-black text-xs px-4 py-2 rounded hover:bg-[#00d4d4]"
              >
                Post
              </button>
            </div>
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
                    className="bg-white p-6 grid gap-4 border-b border-gray-200"
                  >
                    {/* Header */}
                    <div className="grid grid-cols-[auto,1fr] gap-5 group">
                      {/* Avatar */}
                      <div className="self-start">
                        {postUser?.profilePicture ? (
                          <img
                            src={`${BASE_URL}${postUser.profilePicture}`}
                            alt="Avatar"
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
                                  className="text-brandCyan text-xs"
                                >
                                  Follow
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatPostDate(post.createdAt)}
                        </span>
                        <BoltIcon className="w-3 h-3 text-green-400 ml-1 inline" />

                        {/* Content */}
                        <div className="relative">
                          {post.content && (
                            <p className="text-base whitespace-pre-wrap">{post.content}</p>
                          )}
                          {post.image && (
                            <div className="relative w-full overflow-hidden rounded-lg mt-2">
                              <img
                                src={`${UPLOADS_URL}/${post.image}`}
                                alt="Post"
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
                      <button
                        onClick={() => handleLike(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-gray-800"
                        aria-label={`Like (${post.likes.length})`}
                      >
                        {likedPosts.includes(post._id) ? (
                          <HeartSolid className="w-4 h-4 text-red-500" />
                        ) : (
                          <HeartOutline className="w-4 h-4" />
                        )}
                        <span>{post.likes.length}</span>
                      </button>

                      {/* Comment */}
                      <button
                        onClick={() => toggleComments(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-gray-800"
                        aria-label={`Comment (${post.comments?.length || 0})`}
                      >
                        <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-gray-800"
                        aria-label={`Share (${post.shares || 0})`}
                      >
                        <ShareIcon
                          className={`w-4 h-4 ${
                            sharedPosts.includes(post._id) ? "text-green-500" : ""
                          }`}
                        />
                        <span>{post.shares || 0}</span>
                      </button>
                    </div>

                    {/* Comment section */}
                    {openComments[post._id] && (
                      <div className="mt-4 space-y-3">
                        {post.comments?.map((comment) => (
                          <div key={comment._id} className="ml-4">
                            <div className="flex items-start gap-2">
                              {comment.user?.profilePicture && (
                                <img
                                  src={`${BASE_URL}${comment.user.profilePicture}`}
                                  alt="avatar"
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
                                      <img
                                        src={`${BASE_URL}${reply.user.profilePicture}`}
                                        alt="avatar"
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
        </main>
      </div>
    </div>
  );
}
