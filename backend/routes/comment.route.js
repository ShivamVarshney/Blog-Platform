import express from "express"

import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { createComment, deleteComment, editComment, getAllCommentsOnMyBlogs, getCommentsOfPost, likeComment } from "../controllers/comment.controller.js";

const router = express.Router()

// Specific routes MUST come first
router.get('/my-blogs/comments', isAuthenticated, getAllCommentsOnMyBlogs)
router.route("/:id/comment/all").get(getCommentsOfPost);

// Generic :id routes come after
router.post('/:id/create', isAuthenticated, createComment);
router.delete("/:id/delete", isAuthenticated, deleteComment);
router.put("/:id/edit", isAuthenticated, editComment);
router.get('/:id/like', isAuthenticated, likeComment);

export default router;