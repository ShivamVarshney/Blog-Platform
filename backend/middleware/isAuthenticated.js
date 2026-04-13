import jwt from 'jsonwebtoken'
export const isAuthenticated = async (req, res, next) =>{
    try {
        const token = req.cookies.token || req.cookies.jwt;  // 🔥 FIX
        
        console.log("cookies:", req.cookies); // debug

        if(!token){
            return res.status(401).json({
                message:"User not authenticated",
                success:false,
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);

        req.id = decode.userId;
        next();

    } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({
            message:"Authentication failed",
            success:false,
        })
    }
}