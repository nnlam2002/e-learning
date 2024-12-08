import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import nodemailer from 'nodemailer';
let codeMain = 0;
const transporter = nodemailer.createTransport({
  secure: true, // Hoặc dùng dịch vụ email khác
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: 'thuahuy.kth@gmail.com',
    pass: 'zyuoamhqtawrvhnw',
  },
});

export const register = async (req,res) => {
    try {
       
        const {name, email, password} = req.body; // patel214
        if(!name || !email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required."
            })
        }
        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User already exist with this email."
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name,
            email,
            password:hashedPassword
        });
        return res.status(201).json({
            success:true,
            message:"Account created successfully. Please login"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to register"
        })
    }
}
export const login = async (req,res) => {
    
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:req.body
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            });
        }
        generateToken(res, user, `Welcome back ${user.name}`);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
}
<<<<<<< HEAD
export const forgot = async (req,res) => {
    try {
        // console.log(req.body);
        const {email, code, pass} = req.body;
        console.log(req.body);
        
        if(!email){
            return res.status(400).json({
                success:false,
                message:"No have mail"
            })
        }
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"No account have this mail"
            })
        }
        if (code === '' && email) {
            codeMain = Math.floor(100000 + Math.random() * 900000).toString();
            // Cập nhật mật khẩu mới cho người dùng
            // const hashPassword = await bcrypt.hash(newPassword, 10);
            // user.password = newPassword;
            // await user.save();
            const mailOptions = {
                from: 'thuahuy.kth@gmail.com',
                to: user.email,
                subject: 'Your New Password',
                text: `Your new password is: ${codeMain}`
              };
          
              // Gửi email
              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  return res.status(500).json({ error: error });
                }
                res.status(200).json({ message: 'A reset code has been sent to your email.' });
              });
        }else{
            if (code === codeMain) {
                if (pass === '') {
                    return res.status(200).json({
                        success: true,
                        message: "Correct code. Proceed to reset password.",
                    });
                }
                const hashedPassword = await bcrypt.hash(pass, 10);
            
                user.password = hashedPassword;
                await user.save();
    
                return res.status(200).json({
                    success: true,
                    message: "Password has been reset successfully.",
                });
                
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Incorrect code. Please try again.",
                });
            }
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to login"
        })
    }
  
}
=======

export const updatePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    try {
        // Tìm user từ database
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Kiểm tra mật khẩu hiện tại
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Kiểm tra mật khẩu mới không chứa khoảng trắng
        if (/\s/.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "New password cannot contain spaces."
            });
        }
        
        // Hash mật khẩu mới
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Cập nhật mật khẩu
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

>>>>>>> d512359037f61621e62b4906150cd592a9160939
export const logout = async (_,res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge:0}).json({
            message:"Logged out successfully.",
            success:true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        }) 
    }
}
export const getUserProfile = async (req,res) => {
    try {
        const userId = req.id;
        const user = await User.findById(userId).populate("enrolledCourses");
        if(!user){
            return res.status(404).json({
                message:"Profile not found",
                success:false
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to load user"
        })
    }
}
export const updateProfile = async (req,res) => {
    try {
        const userId = req.id;
        let {name} = req.body;
        const profilePhoto = req.file;
        let updatedData;

        console.log(profilePhoto)
        // if(name !== '')

        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            }) 
        }

        if(name.trim().length < 1) name = user.name; 

        if(profilePhoto) {
            // extract public id of the old image from the url is it exists;
            if(user.photoUrl){
                const publicId = user.photoUrl.split("/").pop().split(".")[0]; // extract public id
                deleteMediaFromCloudinary(publicId);
            }

            // upload new photo
            const cloudResponse = await uploadMedia(profilePhoto.path);
            const photoUrl = cloudResponse.secure_url;
            updatedData = {name, photoUrl};
        }
        else {
            updatedData = {name};
        }
        console.log(profilePhoto, updatedData)
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {new:true}).select("-password");

        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile"
        })
    }
}