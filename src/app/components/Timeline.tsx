"use client";
import React from "react";
import { motion } from "framer-motion";

export interface StoryPost {
    title: string;
    description: string;
    link: string;
    imageUrl?: string;
}

interface TimelineProps {
    posts?: StoryPost[];
}

const Timeline: React.FC<TimelineProps> = ({ posts = [] }) => {
    return (
        <div className="relative container mx-auto px-4 py-8">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-[#0055FF]" />

            <ul className="space-y-12 relative">
                {posts.map((post, index) => (
                    <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.8 }}
                        transition={{ delay: index * 0.2, duration: 0.6 }}
                        className="relative flex items-start"
                    >
                        {/* Icon container */}
                        <div className="flex-shrink-0 relative z-10">
                            <div className="w-12 h-12 flex items-center justify-center bg-[#0055FF] text-white rounded-full shadow-lg">
                                {post.imageUrl ? (
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    post.title.charAt(0)
                                )}
                            </div>
                        </div>

                        {/* Content container */}
                        <div className="ml-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md w-full">
                            <h3 className="mt-1 text-xl font-bold text-[#04091F]">{post.title}</h3>
                            <p className="mt-2 text-gray-700 dark:text-gray-300">{post.description}</p>
                        </div>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
};

export default Timeline;
