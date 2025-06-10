"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  useRef,
} from "react";
import axios from "axios";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { FaHeart, FaRegHeart, FaComment, FaShare } from "react-icons/fa";
import { FiCamera } from "react-icons/fi";
import { motion } from "framer-motion";
import HeaderSlider from "./components/HeaderSlider";
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

interface Hashtag {
  tag: string;
  count: number;
}

// ────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user, loggedIn, login } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [filterHashtag, setFilterHashtag] = useState("");
  const [commentTexts, setCommentTexts] =
    useState<Record<string, string>>({});
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] =
    useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [sharedPosts, setSharedPosts] = useState<string[]>([]);

  const viewerCoords = useCurrentLocation();
  const isPro =
    user?.subscriptionExpiresAt &&
    new Date(user.subscriptionExpiresAt) > new Date();

  const BASE_URL = "https://www.vone.mn";
  const UPLOADS_URL = `${BASE_URL}/api/uploads`;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ────────────────────────────────────────────────────────────
  // Fetch posts (location-aware “smart” sort)
  // ────────────────────────────────────────────────────────────
  const fetchPosts = useCallback(async () => {
    try {
      const params: any = { sort: "smart" };
      if (viewerCoords) {
        params.currentLocation = `${viewerCoords.latitude},${viewerCoords.longitude}`;
      } else if (user?.location) {
        params.currentLocation = user.location;
      }

      const res = await axios.get(`${BASE_URL}/api/posts`, { params });

      setPosts(res.data);
      setAllPosts(res.data);
      computeTrendingHashtags(res.data);

      if (user) {
        const liked = res.data
          .filter((p: Post) =>
            p.likes.some((l: any) => (l._id || l) === user._id)
          )
          .map((p: Post) => p._id);
        setLikedPosts(liked);
      }
    } catch (err) {
      console.error("Post fetch error:", err);
    }
  }, [BASE_URL, user, viewerCoords]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // ────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────
  const computeTrendingHashtags = (postsData: Post[]) => {
    const hashtagCount: Record<string, number> = {};
    postsData.forEach((post) => {
      const hashtags = post.content.match(/#\w+/g);
      if (hashtags)
        hashtags.forEach((tag) => {
          hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
        });
    });
    const trending: Hashtag[] = Object.entries(hashtagCount).map(
      ([tag, count]) => ({ tag, count })
    );
    trending.sort((a, b) => b.count - a.count);
    setTrendingHashtags(trending.slice(0, 5));
  };

  const filterPostsByHashtag = (hashtag: string) => {
    setFilterHashtag(hashtag);
    if (!hashtag) return setPosts(allPosts);
    const filtered = allPosts.filter((p) => p.content.includes(hashtag));
    setPosts(filtered);
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setImageFile(e.target.files[0]);
  };

  // ────────────────────────────────────────────────────────────
  // CRUD actions (create, like, comment, reply, share, follow)
  // ────────────────────────────────────────────────────────────
  const createPost = async () => {
    setError("");
    if (!content.trim()) return setError("Контентыг бөглөнө үү");
    if (!user?.accessToken) return setError("Нэвтэрч ороогүй байна.");

    try {
      const formData = new FormData();
      formData.append("content", content);
      if (imageFile) formData.append("image", imageFile);

      const res = await axios.post(`${BASE_URL}/api/posts`, formData, {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setPosts((prev) => [res.data.post, ...prev]);
      setAllPosts((prev) => [res.data.post, ...prev]);
      computeTrendingHashtags([res.data.post, ...allPosts]);
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
      const res = await axios.post(
        `${BASE_URL}/api/posts/${postId}/like`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      setPosts((prev) =>
        prev.map((p) =>
          p._id === postId ? { ...p, likes: res.data.likes } : p
        )
      );
      setLikedPosts((prev) => [...prev, postId]);
    } catch (err) {
      console.error("Like error:", err);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user?.accessToken) return;
    const content = commentTexts[postId];
    if (!content) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comment`,
        { content },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
      );
      setCommentTexts((prev) => ({ ...prev, [postId]: "" }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleReply = async (postId: string, commentId: string) => {
    if (!user?.accessToken) return;
    const content = replyTexts[commentId];
    if (!content) return;

    try {
      const res = await axios.post(
        `${BASE_URL}/api/posts/${postId}/comment/${commentId}/reply`,
        { content },
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, comments: res.data.comments } : p))
      );
      setReplyTexts((prev) => ({ ...prev, [commentId]: "" }));
    } catch (err) {
      console.error("Reply error:", err);
    }
  };

  const handleShare = async (postId: string) => {
    if (!user?.accessToken) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/api/posts/${postId}/share`,
        {},
        { headers: { Authorization: `Bearer ${user.accessToken}` } }
      );
      login({ ...user, rating: (user.rating || 0) + 1 }, user.accessToken);
      setPosts((prev) =>
        prev.map((p) => (p._id === postId ? { ...p, shares: res.data.shares } : p))
      );
      setSharedPosts((prev) => [...prev, postId]);
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
    <div className="min-h-screen bg-gray-100 dark:bg-black text-gray-900 dark:text-white">
      <HeaderSlider />

      {!isPro && (
        <div className="bg-yellow-500 text-white text-center py-2 px-4">
          <Link href="/subscription" className="font-semibold underline">
            Гишүүн болох – Онцгой боломжуудыг нээх
          </Link>
        </div>
      )}

      {/* Outer Grid */}
      <div
        className="mx-auto max-w-5xl w-full grid"
        style={{
          gridTemplateColumns:
            "var(--barcelona-threadline-column-width) minmax(0, 1fr)",
        }}
      >
        {/* Sidebar – trending hashtags */}
        <aside>
          <div className="bg-white dark:bg-black p-4 grid gap-3">
            <div className="grid grid-cols-[auto,1fr] items-center gap-2">
              <FiCamera className="w-5 h-5 text-[#1D9BF0]" />
              <h2 className="text-base font-semibold">Тренд хэштегүүд</h2>
            </div>
            <div
              className="gap-2"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              }}
            >
              <button
                className="px-3 py-1 text-xs bg-gray-200 dark:bg-black rounded-full hover:bg-gray-300 dark:hover:bg-black"
                onClick={() => filterPostsByHashtag("")}
              >
                Бүх
              </button>
              {trendingHashtags.map((h) => (
                <button
                  key={h.tag}
                  className="px-3 py-1 text-xs bg-gray-200 dark:bg-black rounded-full hover:bg-gray-300 dark:hover:bg-black"
                  onClick={() => filterPostsByHashtag(h.tag)}
                >
                  {h.tag} ({h.count})
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main – create + feed */}
        <main>
          {/* Create post */}
          {loggedIn && (
            <div className="bg-white dark:bg-black grid gap-4 p-6">
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
                  className="p-2 border border-gray-200 dark:border-black rounded-full hover:bg-gray-100 dark:hover:bg-black"
                >
                  <FiCamera className="w-5 h-5 text-gray-600 dark:text-white" />
                </button>
                {imageFile && (
                  <span className="text-xs text-gray-700 truncate">
                    {imageFile.name}
                  </span>
                )}
              </div>

              <textarea
                placeholder="What's on your mind?"
                className="w-full text-sm text-gray-900 dark:text-white border border-gray-200 dark:border-black rounded p-2 focus:outline-none"
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />

              {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

              <button
                onClick={createPost}
                className="mt-3 bg-[#1D9BF0] text-white text-xs px-4 py-2 rounded hover:bg-[#1A8CD8]"
              >
                Post
              </button>
            </div>
          )}

          {/* Posts list */}
          <div className="m-0 p-0">
            {isPro ? (
              posts.map((post, idx) => {
                const postUser = post.user;
                return (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="bg-white dark:bg-black p-6 grid gap-4 border-b border-gray-200 dark:border-[#2F3336]"
                  >
                    {/* Header row */}
                    <div className="grid grid-cols-[auto,1fr] gap-5">
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

                      {/* Post content */}
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
                                  className="text-[#1D9BF0] text-xs"
                                >
                                  Follow
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <span className="text-xs text-gray-500 dark:text-white">
                          {formatPostDate(post.createdAt)}
                        </span>

                        {post.content && (
                          <p className="text-base whitespace-pre-wrap">
                            {post.content}
                          </p>
                        )}

                        {post.image && (
                          <div className="relative w-full overflow-hidden rounded-lg">
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

                    {/* Stats row */}
                    <div className="grid grid-cols-3 items-center text-xs text-gray-600 dark:text-white w-full mt-2">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-gray-800"
                        aria-label={`Like (${post.likes.length})`}
                      >
                        {likedPosts.includes(post._id) ? (
                          <FaHeart className="w-4 h-4 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-4 h-4" />
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
                        <FaComment className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </button>

                      {/* Share */}
                      <button
                        onClick={() => handleShare(post._id)}
                        disabled={!loggedIn}
                        className="flex items-center justify-center gap-1 hover:text-gray-800"
                        aria-label={`Share (${post.shares || 0})`}
                      >
                        <FaShare
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
                              <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded p-2">
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
                                    <div className="flex-1 bg-gray-50 dark:bg-gray-900 rounded p-2">
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
                                    className="flex-1 text-xs border border-gray-300 dark:border-gray-700 rounded p-1"
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
                            className="flex-1 text-sm border border-gray-300 dark:border-gray-700 rounded p-2"
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
            ) : (
              <div className="p-4 text-center text-gray-600">
                Feed нь зөвхөн гишүүдэд харагдана.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
