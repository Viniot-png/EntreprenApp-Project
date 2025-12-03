import Post from "../models/post.model.js";

export const recordShare = async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    // Initialize sharesCount if it doesn't exist
    if (!post.sharesCount) {
      post.sharesCount = 0;
    }

    post.sharesCount += 1;
    await post.save();

    res.status(200).json({
      success: true,
      message: "Share recorded successfully",
      sharesCount: post.sharesCount
    });
  } catch (error) {
    console.error("Error while recording share:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getSharesCount = async (req, res) => {
  const { id } = req.params;
  
  try {
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.status(200).json({
      success: true,
      sharesCount: post.sharesCount || 0
    });
  } catch (error) {
    console.error("Error while getting shares count:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
