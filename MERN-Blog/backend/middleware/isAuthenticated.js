import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            });
        }

        const token = authHeader.split(" ")[1];

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