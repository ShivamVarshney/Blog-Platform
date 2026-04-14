import { Blog } from "../models/blog.model.js";
import Comment from "../models/comment.model.js";

// ✅ CREATE COMMENT
export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.id;
    const { content } = req.body;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        message: "Text is required",
        success: false,
      });
    }

    const blog = await Blog.findById(postId);
    if (!blog) {
      return res.status(404).json({
        message: "Blog not found",
        success: false,
      });
    }

    // create comment
    let comment = await Comment.create({
      content,
      userId,
      postId,
    });

    // ✅ SAFE POPULATE (no errors)
    comment = await Comment.findById(comment._id)
      .populate("userId", "firstName lastName photoUrl")
      .populate("postId", "title");

    // push into blog
    blog.comments.push(comment._id);
    await blog.save();

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log("Create comment error:", error);
    return res.status(500).json({
      message: "Failed to create comment",
      success: false,
    });
  }
};

// ✅ GET COMMENTS OF SINGLE POST
export const getCommentsOfPost = async (req, res) => {
  try {
    const blogId = req.params.id;

    const comments = await Comment.find({ postId: blogId })
      .populate("userId", "firstName lastName photoUrl")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching comments",
    });
  }
};

// ✅ DELETE COMMENT
export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // check ownership
    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const blogId = comment.postId;

    await Comment.findByIdAndDelete(commentId);

    // remove from blog
    await Blog.findByIdAndUpdate(blogId, {
      $pull: { comments: commentId },
    });

    res.status(200).json({
      success: true,
      message: "Comment deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting comment",
    });
  }
};

// ✅ EDIT COMMENT
export const editComment = async (req, res) => {
  try {
    const userId = req.id;
    const { content } = req.body;
    const commentId = req.params.id;

    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Content required",
      });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    comment.content = content;
    comment.editedAt = new Date();

    await comment.save();

    res.status(200).json({
      success: true,
      message: "Comment updated",
      comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error editing comment",
    });
  }
};

// ✅ LIKE / UNLIKE COMMENT
export const likeComment = async (req, res) => {
  try {
    const userId = req.id;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // ✅ FIXED ObjectId comparison
    const alreadyLiked = comment.likes.some(
      (id) => id.toString() === userId
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId
      );
      comment.numberOfLikes = Math.max(0, comment.numberOfLikes - 1);
    } else {
      comment.likes.push(userId);
      comment.numberOfLikes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Unliked" : "Liked",
      updatedComment: comment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error liking comment",
    });
  }
};

// ✅ GET ALL COMMENTS ON MY BLOGS
export const getAllCommentsOnMyBlogs = async (req, res) => {
  try {
    const userId = req.id;

    const myBlogs = await Blog.find({ author: userId }).select("_id");
    const blogIds = myBlogs.map((b) => b._id);

    if (blogIds.length === 0) {
      return res.status(200).json({
        success: true,
        comments: [],
      });
    }

    const comments = await Comment.find({
      postId: { $in: blogIds },
    })
      .populate("userId", "firstName lastName email")
      .populate("postId", "title")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      totalComments: comments.length,
      comments,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get comments",
    });
  }
};