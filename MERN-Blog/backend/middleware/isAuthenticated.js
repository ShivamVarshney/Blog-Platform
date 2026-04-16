import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    try {
        // ✅ cookie se token lo
        const token = req.cookies.token;

        console.log("TOKEN:", token);

        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);

        req.id = decoded.userId;

        next();
    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({
            message: "Authentication failed",
            success: false,
        });
    }
};