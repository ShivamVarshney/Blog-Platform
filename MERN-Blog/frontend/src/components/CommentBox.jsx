import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { FaHeart, FaRegHeart } from "react-icons/fa6";
import { LuSend } from "react-icons/lu";
import { Button } from './ui/button';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';
import { setBlog } from '@/redux/blogSlice';
import { setComment } from '@/redux/commentSlice';
import { Edit, Trash2 } from 'lucide-react';
import { BsThreeDots } from "react-icons/bs";
import API_URL from '../config/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const CommentBox = ({ selectedBlog }) => {

    const { user } = useSelector(store => store.auth)
    const { comment } = useSelector(store => store.comment)
    const { blog } = useSelector(store => store.blog)

    const [content, setContent] = useState("")
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editedContent, setEditedContent] = useState('');

    const dispatch = useDispatch()

    // 🔥 FETCH COMMENTS
    useEffect(() => {
        if (!selectedBlog?._id) return;

        const getAllCommentsOfBlog = async () => {
            try {
                const res = await axios.get(
                    `${API_URL}/api/v1/comment/${selectedBlog._id}/comment/all`
                );
                dispatch(setComment(res.data.comments || []));
            } catch (error) {
                console.log(error);
            }
        };

        getAllCommentsOfBlog();
    }, [selectedBlog]);

    // 🔥 ADD COMMENT
    const commentHandler = async () => {
        if (!content.trim()) {
            toast.error("Please write a comment");
            return;
        }

        try {
            const res = await axios.post(
                `${API_URL}/api/v1/comment/${selectedBlog._id}/create`,
                { content },
                { withCredentials: true }
            );

            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                dispatch(setComment(updatedCommentData));

                const updatedBlogData = blog.map(p =>
                    p._id === selectedBlog._id
                        ? { ...p, comments: updatedCommentData }
                        : p
                );
                dispatch(setBlog(updatedBlogData));

                toast.success(res.data.message);
                setContent("");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to post comment");
        }
    };

    // 🔥 ADD REPLY
    const replyHandler = async () => {
        if (!replyText.trim()) {
            toast.error("Please write a reply");
            return;
        }

        try {
            const res = await axios.post(
                `${API_URL}/api/v1/comment/${selectedBlog._id}/create`,
                { content: replyText },
                { withCredentials: true }
            );

            if (res.data.success) {
                const updatedCommentData = [...comment, res.data.comment];
                dispatch(setComment(updatedCommentData));

                toast.success("Reply added");
                setReplyText("");
                setActiveReplyId(null);
            }
        } catch (error) {
            console.log(error);
            toast.error("Reply failed");
        }
    };

    // 🔥 DELETE
    const deleteComment = async (commentId) => {
        try {
            const res = await axios.delete(
                `${API_URL}/api/v1/comment/${commentId}/delete`,
                { withCredentials: true }
            );

            if (res.data.success) {
                const updated = comment.filter(c => c._id !== commentId);
                dispatch(setComment(updated));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error("Delete failed");
        }
    };

    // 🔥 EDIT
    const editCommentHandler = async (commentId) => {
        if (!editedContent.trim()) {
            toast.error("Content required");
            return;
        }

        try {
            const res = await axios.put(
                `${API_URL}/api/v1/comment/${commentId}/edit`,
                { content: editedContent },
                { withCredentials: true }
            );

            if (res.data.success) {
                const updated = comment.map(c =>
                    c._id === commentId ? { ...c, content: editedContent } : c
                );
                dispatch(setComment(updated));

                toast.success(res.data.message);
                setEditingCommentId(null);
                setEditedContent('');
            }
        } catch (error) {
            console.log(error);
            toast.error("Edit failed");
        }
    };

    // 🔥 LIKE
    const likeCommentHandler = async (commentId) => {
        try {
            const res = await axios.get(
                `${API_URL}/api/v1/comment/${commentId}/like`,
                { withCredentials: true }
            );

            if (res.data.success) {
                const updated = comment.map(c =>
                    c._id === commentId ? res.data.updatedComment : c
                );
                dispatch(setComment(updated));
            }
        } catch (error) {
            console.log(error);
            toast.error("Like failed");
        }
    };

    return (
        <div>
            {/* USER */}
            <div className='flex gap-4 mb-4 items-center'>
                <Avatar>
                    <AvatarImage src={user?.photoUrl} />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <h3 className='font-semibold'>
                    {user?.firstName} {user?.lastName}
                </h3>
            </div>

            {/* COMMENT BOX */}
            <div className='flex gap-3'>
                <Textarea
                    placeholder="Write a comment..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="bg-gray-100 dark:bg-gray-800"
                />
                <Button onClick={commentHandler}>
                    <LuSend />
                </Button>
            </div>

            {/* COMMENTS */}
            {comment.length > 0 && (
                <div className='mt-7 bg-gray-100 dark:bg-gray-800 p-5 rounded-md'>
                    {comment.map((item) => (
                        <div key={item._id} className='mb-4'>
                            <div className='flex justify-between'>
                                <div className='flex gap-3'>
                                    <Avatar>
                                        <AvatarImage src={item?.userId?.photoUrl} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <h1 className='font-semibold'>
                                            {item?.userId?.firstName}
                                        </h1>

                                        {editingCommentId === item._id ? (
                                            <>
                                                <Textarea
                                                    value={editedContent}
                                                    onChange={(e) => setEditedContent(e.target.value)}
                                                />
                                                <Button onClick={() => editCommentHandler(item._id)}>Save</Button>
                                            </>
                                        ) : (
                                            <p>{item?.content}</p>
                                        )}

                                        <div className='flex gap-4 mt-1'>
                                            {/* LIKE */}
                                            <div
                                                className='flex gap-1 items-center cursor-pointer'
                                                onClick={() => likeCommentHandler(item._id)}
                                            >
                                                {
                                                    item.likes?.some(id => id.toString() === user._id)
                                                        ? <FaHeart color="red" />
                                                        : <FaRegHeart />
                                                }
                                                <span>{item.numberOfLikes}</span>
                                            </div>

                                            {/* REPLY BUTTON */}
                                            <p
                                                className="cursor-pointer text-sm text-blue-500 hover:underline"
                                                onClick={() => setActiveReplyId(item._id)}
                                            >
                                                Reply
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* MENU */}
                                {user._id === item?.userId?._id && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger>
                                            <BsThreeDots />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setEditingCommentId(item._id);
                                                    setEditedContent(item.content);
                                                }}
                                            >
                                                <Edit /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => deleteComment(item._id)}>
                                                <Trash2 /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>

                            {/* REPLY BOX */}
                            {activeReplyId === item._id && (
                                <div className='flex gap-2 mt-2 pl-10'>
                                    <Textarea
                                        placeholder="Write a reply..."
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="bg-gray-200 dark:bg-gray-700"
                                    />
                                    <Button onClick={replyHandler}>
                                        <LuSend />
                                    </Button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentBox