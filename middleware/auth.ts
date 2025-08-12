



// auth.ts
import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../utils/redis";
import exp from "constants";




export const isAuthneticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {

    const access_token = req.cookies['access_token'] as string ;
    console.log("Cookies:", req.cookies);
    console.log("accesstoken:", access_token);



    // const access_token_cookie = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('access_token='));
    // const access_token = access_token_cookie ? access_token_cookie.split('=')[1] : undefined;
    // console.log("Cookies:", req.headers.cookie);
    // console.log("accesstoken:", access_token);
    // const access_token = req.cookies.access_token as string;

    if (!access_token) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    try {
      const decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as string
      ) as JwtPayload;

      if (!decode) {
        return next(new ErrorHandler("access token is not valid  ", 400));
      }

      const user = await redis.get(decode.id);
      if (!user) {
        return next(new ErrorHandler("Please login to access this resource", 400));
      }

      req.user = JSON.parse(user);
      next();
    } catch (error:any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);



// validate user route
export const authorizeRoles= (...roles:string[])=>{
  return(req:Request,res:Response,next:NextFunction)=>{
    if(!roles.includes(req.user?.role || '')){
      return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource `,403));
    }
    next();
  }
}



export const isVerifiedProvider = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role: ${req.user?.role} is not allowed to access this resource `,
          403
        )
      );
    }
    next();
  };
};



export const checkIsVerified = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    // `req.user` is available from isAuthneticated middleware
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.user.isVerified) {
      return res
        .status(403)
        .json({ success: false, message: "Account not verified Please Wait for few hour" });
    }

    next();
  }
);