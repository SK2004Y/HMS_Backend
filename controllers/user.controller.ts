require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../modals/user_model";
import ErrorHandler from "../utils/ErrorHandler";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import jwt, { JwtPayload } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import sendMail from "../utils/sendMail";
import { error } from "console";
import { send } from "process";
import {
  accessTokenOptions,
  refreshTokenOptions,
  sendToken,
} from "../utils/jwt";
import { redis } from "../utils/redis";
import crypto from "crypto"
import {
  getAllUsersService,
  getUserById,
  updateUserRoleService,
} from "../services/user.service";
import { json } from "stream/consumers";
import cloudinary from "cloudinary";
import { PatientModel } from "../modals/patient.model";
import { DoctorModel } from "../modals/doctor.model";
import { ClinicModel } from "../modals/clinic.model";
import { DiagnosticModel } from "../modals/diagnostic.model";
import { ResortModel } from "../modals/resort.model";
import { MedicineModel } from "../modals/medicineshop.model";
import { sendSMS } from "../utils/smsgateway/sendSMS";



//test
// export const registrationUser = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { phone, email, password, role } = req.body;



//       console.log(`registration api hit `, req.body);
//       // Check if email already exists
//       const isEmailExist = await userModel.findOne({ email });
//       if (isEmailExist) {
//         return next(new ErrorHandler("Email already exists", 400));
//       }

//       // User data
//       const user: IRegistrationBody = {
//         phone,
//         email,
//         password,
//         role,
//       };

//       // Create activation token
//       const activationToken = createActivationToken(user);
//       const activationCode = activationToken.activationCode;

//       // Prepare email data
//       const data = { user: { name: "" }, activationCode };

      

//       // Render email template
//       const html = await ejs.renderFile(
//         path.join(__dirname, "../mails/activation-mail.ejs"),
//         data
//       );

//       try {
//         // Send the activation email
//         const emailResponse = await sendMail({
//           email: user.email,
//           subject: "Activate your account",
//           template: "activation-mail.ejs",
//           text: "Hello", // Optional text version of the email
//           data,
//         });

//         console.log("Email send response:", emailResponse);

//         // Response after successful email sending
//         res.status(201).json({
//           success: true,
//           message: `Please check your email: ${user.email} to activate your account!`,
//           activationToken: activationToken.token,
//         });
//       } catch (emailError: any) {
//         console.error("Error sending email:", emailError);
//         return next(new ErrorHandler("Failed to send activation email", 500));
//       }

   

//       //creating a model which is used by the role
//     } catch (error: any) {
//       console.error("Error during registration:", error);
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

// controllers/userController.ts or wherever your controller is


export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phone, email, password, role } = req.body;

      // 1. Check if user already exists
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Email already exists", 400));
      }

      // 2. Create activation token
      const user: IRegistrationBody = { phone, email, password, role };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;

      // 3. Send Activation Email
      const data = { user: { name: "" }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activate your account",
          template: "activation-mail.ejs",
          text: "Hello",
          data,
        });
      } catch (err) {
        console.error("Email Error:", err);
        return next(new ErrorHandler("Failed to send activation email", 500));
      }

      // 4. Send Activation SMS
      try {
        const smsText = `Your OTP to activate your account is ${activationCode}. Do not share it.`;
       const responsesms= await sendSMS(phone, smsText);
       console.log(`response ${responsesms}and phone ${phone} and ${activationCode}`,responsesms)
       next();
      } catch (err) {
        console.error("SMS Error:", err);
        return next(new ErrorHandler("Failed to send SMS", 500));
      }

      // 5. Success Response
      res.status(201).json({
        success: true,
        message: `Please check your email (${email}) and phone (${phone}) to activate your account.`,
        activationToken: activationToken.token,
      });
    } catch (error: any) {
      console.error("Registration Error:", error);
      return next(new ErrorHandler(error.message, 400));
    }
  }
);




interface IActivationToken {
  token: string;
  activationCode: string;
}

export const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as string,
    {
      expiresIn: "5m",
    }
  );

  return { token, activationCode };
};

//Activation user

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(`activated hit `,req.body)
      const { activation_token, activation_code } =
        req.body as IActivationRequest;
      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code ", 400));
      }

      const { phone, email, password,role} = newUser.user;

      const existUser = await userModel.findOne({ email });

      const existphone=await userModel.findOne({phone});

      if(existphone){
        return next(new ErrorHandler("Mobile Number already exist",400));
      }

      if (existUser) {
        return next(new ErrorHandler("Email already exist", 400));
      }

      const user = await userModel.create({
        phone,
        email,
        password,
        role,
      });

      res.status(201).json({
        success: true,
        message:"activated your account please login "
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//LOGIN USER

interface ILoginRequest {
  email: string;
  password: string;
}

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;

      if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");

      if (!user) {
        return next(new ErrorHandler("Invalid email and password", 400));
      }

      const isPasswordMatch = await user.comparePassword(password);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("password doesn't match", 400));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//logout user

export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is authenticated
     console.log(`logout api hit `);
      // Clear cookies
      res.clearCookie("access_token");
      res.clearCookie("refresh_token");

      // res.cookie("access_token", " ", { maxAge: 1 });
      // res.cookie("refresh_token", " ", { maxAge: 1 });

      const userId = req.user?._id;
      console.log(`userlogout api hit `,userId);

      if (!userId) {
        return next(new ErrorHandler("User ID not found", 400));
      }

      console.log(req.user?._id);

      await redis.del(userId);
      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update access token

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as string
      ) as JwtPayload;

      const message = "Could not refresh token ";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);

      if (!session) {
        return next(
          new ErrorHandler("Please login for access this resources!", 400)
        );
      }

      const user = JSON.parse(session);

      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as string,
        {
          expiresIn: "15m",
        }
      );

      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as string,
        {
          expiresIn: "10d",
        }
      );

      req.user = user;

      res.cookie("access_token", accessToken, accessTokenOptions);

      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      await redis.set(user._id, JSON.stringify(user), "EX", 604800); //7 days for 604800

      // res.status(200).json({
      //   status: "success",
      //   accessToken,
      // });
      next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get user info

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ISocialAuthBody {
  email: string;
  name: string;
  avatar: string;
}

//social auth

export const SocialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocialAuthBody;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({ email, name, avatar });
        sendToken(newUser, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user info

interface IUpdateUserInfo {
  name?: string;
  email?: string;
}

export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email } = req.body as IUpdateUserInfo;
      const userId = req.user?._id;
      const user = await userModel.findById(userId);

      // if (email && user) {
      //   const isEmailExist = await userModel.findOne({ email });
      //   if (isEmailExist) {
      //     return next(new ErrorHandler("Email already exist ", 400));
      //   }

      //   user.email = email;
      // }

      if (name && user) {
        user.name = name;
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user password

interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}


//reset user password


interface IForgotPassword{
  email:string;
}
export const forgetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body as IForgotPassword;

    if (!email) {
      return next(new ErrorHandler("Please provide a valid email", 400));
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate reset token using schema method
    const resetToken = user.getResetPasswordToken();
    console.log(`resetToken is here ${resetToken}`);

    await user.save({ validateBeforeSave: false });

    // const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    const resetUrl="after frontend build then send the data";

    // Prepare template data
    const data = {
      name: user.name,
      resetUrl,
    };

    // Render EJS template
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/reset-password-mail.ejs"),
      data
    );

    try {
      await sendMail({
        email: user.email,
        subject: "Password Reset Request",
        template: "reset-password-mail.ejs",
        data,
      });

      res.status(200).json({
        success: true,
        message: `Reset password link has been sent to ${user.email}`,
      });
    } catch (err: any) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorHandler("Email could not be sent", 500));
    }
  }
);


//set newPassword
interface IResetPasswordRequest{
  token:string;
  newPassword:string;
}
export const resetPassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, newPassword } = req.body as IResetPasswordRequest;

    if (!token || !newPassword) {
      return next(new ErrorHandler("Token and new password are required", 400));
    }

    // Hash the token to match the one in DB
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with this token and check expiry
    const user = await userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        new ErrorHandler("Reset token is invalid or has expired", 400)
      );
    }

    // Set the new password and clear reset fields
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  }
);


export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword } = req.body as IUpdatePassword;

      if (!oldPassword || !newPassword) {
        return next(
          new ErrorHandler("please enter old and new password ", 400)
        );
      }

      const user = await userModel.findById(req.user?._id).select("+password");

      if (user?.password === undefined) {
        return next(new ErrorHandler("Invalid user ", 400));
      }

      const isPasswordMatch = await user?.comparePassword(oldPassword);

      if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid old password ", 400));
      }

      user.password = newPassword;

      await user.save();

      await redis.set(req.user?._id, JSON.stringify(user));

      res.status(201).json({
        success: true,
        message: "password updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user profile pictures

interface IUpdateProfilePicture {
  avatar: string;
}

export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { avatar } = req.body;

      const userId = req.user?._id;

      const user = await userModel.findById(userId);

      if (avatar && user) {
        //if user have avatar then call this if
        if (user?.avatar?.public_id) {
          //fist delete the old image
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

          // second upload new image
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatarss",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatarss",
            width: 150,
          });
          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await user?.save();

      await redis.set(userId, JSON.stringify(user));

      res.status(200).json({
        success: true,
        message: "profile picture updated successfully",
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get all users --only for admin

export const getAllUsers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllUsersService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update user role ---only for admin

export const updateUserRole = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, role } = req.body;
      updateUserRoleService(res, id, role);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//delete user ---only for admin

export const deleteUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await userModel.findById(id);
      if (!user) {
        return next(new ErrorHandler("User not found ", 404));
      }

      await user.deleteOne({ id });

      await redis.del(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
