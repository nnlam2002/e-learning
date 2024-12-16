
import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Review } from "../models/review.model.js";
import { Lecture } from "../models/lecture.model.js";
import { deleteMediaFromCloudinary, deleteVideoFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import { exec } from 'child_process';
import path from 'path';

export const createCourse = async (req, res) => {
    try {
        const { courseTitle } = req.body;
        if (!courseTitle) {
            return res.status(400).json({
                message: "Course title is required."
            })
        }

        const course = await Course.create({
            courseTitle,
            creator: req.id
        });

        return res.status(201).json({
            course,
            message: "Course created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}

export const searchCourse = async (req, res) => {
    try {
        const { query = "", categories = "", sortByPrice = "" } = req.query;

        const categoryArray = categories
            ? categories.split(",").map((id) => new mongoose.Types.ObjectId(id.trim()))
            : [];

        const searchCriteria = {
            isPublished: true,
            $or: [
                { courseTitle: { $regex: query, $options: "i" } },
                { subTitle: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ],
        };

        if (categoryArray.length > 0) {
            searchCriteria.category = { $in: categoryArray };
        }

        // Define sorting order
        const sortOptions = {};
        if (sortByPrice === "low") {
            sortOptions.coursePrice = 1; // sort by price in ascending
        } else if (sortByPrice === "high") {
            sortOptions.coursePrice = -1; // descending
        }

        const courses = await Course.find(searchCriteria)
            .populate({ path: "creator", select: "name photoUrl" })
            .sort(sortOptions);

        return res.status(200).json({
            success: true,
            courses: courses || [],
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const getPublishedCourse = async (_, res) => {
    try {
        const courses = await Course.find({ isPublished: true }).populate({ path: "creator", select: "name photoUrl" }).populate({ path: "category" });
        if (!courses) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        const coursesWithRatings = await Promise.all(
            courses.map(async (course) => {
                // Tìm các đánh giá cho khóa học này
                const reviews = await Review.find({ courseId: course._id });
                
                const totalStars = reviews.reduce((acc, review) => acc + review.star, 0);
                const averageRating = reviews.length > 0 ? (totalStars / reviews.length).toFixed(1) : 0;
                const totalReviews = reviews.length

                return {
                    ...course.toObject(),
                    averageRating: parseFloat(averageRating), // Thêm thuộc tính averageRating
                    totalReviews,
                };
            })
        );

        
        const shuffledCourses = coursesWithRatings.sort(() => Math.random() - 0.5);

        return res.status(200).json({
            courses: shuffledCourses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get published courses"
        })
    }
}
export const getCreatorCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find({ creator: userId }).populate({ path: "creator", select: "name photoUrl" }).populate({ path: "category" });
        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to load courses"
        })
    }
}
export const getCreatorCoursesById = async (req, res) => {
    try {
        const userId = req.params.userId;
        const courses = await Course.find({ creator: userId }).populate({ path: "creator", select: "name photoUrl" }).populate({ path: "category" });
        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to load courses"
        })
    }
}
export const getAllCourses = async (req, res) => {
    try {
        const userId = req.id;
        const courses = await Course.find().populate({ path: "creator", select: "name photoUrl" }).populate({ path: "category" });
        if (!courses) {
            return res.status(404).json({
                courses: [],
                message: "Course not found"
            })
        };
        return res.status(200).json({
            courses,
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create course"
        })
    }
}
export const editCourse = async (req, res) => {
    try {
        const courseId = req.params.courseId;
        const { courseTitle, subTitle, description, category, courseLevel, coursePrice } = req.body;
        const thumbnail = req.file;

        let course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }
        let courseThumbnail;
        if (thumbnail) {
            if (course.courseThumbnail) {
                const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
                await deleteMediaFromCloudinary(publicId); // delete old image
            }
            // upload a thumbnail on clourdinary
            courseThumbnail = await uploadMedia(thumbnail.path);
        }


        const updateData = { courseTitle, subTitle, description, category, courseLevel, coursePrice, courseThumbnail: courseThumbnail?.secure_url };

        course = await Course.findByIdAndUpdate(courseId, updateData, { new: true });

        return res.status(200).json({
            course,
            message: "Course updated successfully."
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update course"
        })
    }
}
export const getCourseById = async (req, res) => {
    
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId).populate({ path: "category" });

        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            })
        }
        return res.status(200).json({
            course
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get course by id"
        })
    }
}

export const createLecture = async (req, res) => {
    try {
        const { lectureTitle } = req.body;
        const { courseId } = req.params;

        if (!lectureTitle || !courseId) {
            return res.status(400).json({
                message: "Lecture title is required"
            })
        };

        // create lecture
        const lecture = await Lecture.create({ lectureTitle });

        const course = await Course.findById(courseId);
        if (course) {
            course.lectures.push(lecture._id);
            await course.save();
        }

        return res.status(201).json({
            lecture,
            message: "Lecture created successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to create lecture"
        })
    }
}
export const getCourseLecture = async (req, res) => {
    
    try {
        const { courseId } = req.params;
        const course = await Course.findById(courseId).populate("lectures");
        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            })
        }
        return res.status(200).json({
            lectures: course.lectures
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lectures"
        })
    }
}
export const editLecture = async (req, res) => {
    try {
        const { lectureTitle, videoInfo, isPreviewFree } = req.body;

        const { courseId, lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            })
        }

        // update lecture
        if (lectureTitle) lecture.lectureTitle = lectureTitle;
        if (videoInfo?.videoUrl) lecture.videoUrl = videoInfo.videoUrl;
        if (videoInfo?.publicId) lecture.publicId = videoInfo.publicId;
        lecture.isPreviewFree = isPreviewFree;

        await lecture.save();

        // Ensure the course still has the lecture id if it was not aleardy added;
        const course = await Course.findById(courseId);
        if (course && !course.lectures.includes(lecture._id)) {
            course.lectures.push(lecture._id);
            await course.save();
        };
        return res.status(200).json({
            lecture,
            message: "Lecture updated successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to edit lectures"
        })
    }
}
export const removeLecture = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findByIdAndDelete(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }
        // delete the lecture from couldinary as well
        if (lecture.publicId) {
            await deleteVideoFromCloudinary(lecture.publicId);
        }

        // Remove the lecture reference from the associated course
        await Course.updateOne(
            { lectures: lectureId }, // find the course that contains the lecture
            { $pull: { lectures: lectureId } } // Remove the lectures id from the lectures array
        );

        return res.status(200).json({
            message: "Lecture removed successfully."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to remove lecture"
        })
    }
}
export const getLectureById = async (req, res) => {
    try {
        const { lectureId } = req.params;
        const lecture = await Lecture.findById(lectureId);
        if (!lecture) {
            return res.status(404).json({
                message: "Lecture not found!"
            });
        }
        return res.status(200).json({
            lecture
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to get lecture by id"
        })
    }
}


// publich unpublish course logic

export const togglePublishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { publish } = req.query; // true, false
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!"
            });
        }
        // publish status based on the query paramter
        course.isPublished = publish === "true";
        await course.save();

        const statusMessage = course.isPublished ? "Published" : "Unpublished";
        return res.status(200).json({
            message: `Course is ${statusMessage}`
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update status"
        })
    }
}

export const deleteCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({
                message: "Course not found!",
            });
        }

        if (course.enrolledStudents.length > 0) {
            return res.status(400).json({
                message: "Cannot delete a course that has enrolled students.",
            });
        }

        const lectureIds = course.lectures;
        for (const lectureId of lectureIds) {
            const lecture = await Lecture.findById(lectureId);
            if (lecture?.publicId) {
                await deleteVideoFromCloudinary(lecture.publicId);
            }
            await Lecture.findByIdAndDelete(lectureId);
        }

        if (course.courseThumbnail) {
            const publicId = course.courseThumbnail.split("/").pop().split(".")[0];
            await deleteMediaFromCloudinary(publicId);
        }

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            message: "Course deleted successfully.",
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to delete course",
        });
    }
};

export const recommendCourses = async (req, res) => {
    try {
        const { courseId, courses } = req.body;
        const course = await Course.findById(courseId);

        const levelWeights = {
            Beginner: 1,
            Medium: 2,
            Advance: 3,
        };

        const competencyLevels = {};
        
        // Tính toán tổng trọng số và số lượng cho mỗi danh mục
        courses.forEach(course => {
            const { courseDetail, completed } = course;
            const { _id, category, courseLevel } = courseDetail;

            if (!competencyLevels[category]) {
                competencyLevels[category] = {
                    totalWeight: 0,
                    count: 0,
                    _id: 0,
                };
            }

            competencyLevels[category].totalWeight += levelWeights[courseLevel];
            competencyLevels[category].count += 1;
            competencyLevels[category]._id = _id;
        });

        // Tính toán cấp độ trung bình cho mỗi danh mục
        const recommendations = [];        

        const command = `python ai-model/predict.py "${course.courseTitle}" "${course.description}" "${course.courseLevel}"`;
        const keywords = await new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing script: ${error}`);
                    return reject(`Error: ${stderr}`);
                }
                try {
                    // Chuyển đổi kết quả JSON về đối tượng JavaScript
                    const result = JSON.parse(stdout);
                    resolve(result);
                } catch (parseError) {
                    reject(`Error parsing JSON: ${parseError}`);
                }
            });
        });

        recommendations.push({
            category: course.category,
            level: course.courseLevel,
            keywords: keywords
        });

        for (const category in competencyLevels) {
            const courseCate = await Course.findById(competencyLevels[category]._id);
            const { totalWeight, count } = competencyLevels[category];
            const averageWeight = totalWeight / count;

            const averageLevel = getLevelFromWeight(averageWeight);

            // Gọi Python script để dự đoán từ khóa
            const command = `python ai-model/predict.py "${courseCate.courseTitle}" "${courseCate.description}" "${averageLevel}"`;
            const keywords = await new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing script: ${error}`);
                        return reject(`Error: ${stderr}`);
                    }
                    try {
                        // Chuyển đổi kết quả JSON về đối tượng JavaScript
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (parseError) {
                        reject(`Error parsing JSON: ${parseError}`);
                    }
                });
            });

            recommendations.push({
                category,
                level: averageLevel,
                keywords: keywords
            });
        }


        return res.status(200).json({
            success: true,
            recommendations: mergeKeyword(recommendations)
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Failed to recommend courses"
        });
    }
};

const getLevelFromWeight = (weight) => {
    if (weight < 1.5) return "Beginner";
    if (weight < 2.5) return "Medium";
    return "Advance";
};

const mergeKeyword = (recommendations) => {
    const merged = {};
    recommendations.forEach(course => {
        const key = `${course.category}-${course.level}`;

        if (!merged[key]) {
            merged[key] = {
                category: course.category,
                level: course.level,
                keywords: []
            };
        }
        merged[key].keywords.push(...course.keywords.flat());
    });

    return Object.values(merged).map(item => ({
        category: item.category,
        level: item.level,
        keywords: Array.from(new Set(item.keywords)) 
    }));
};

// // Hàm giả định để gọi mô hình AI
// const getKeywordsFromAIModel = async (category, level, courseTitle) => {
//     // Đây là nơi bạn sẽ gọi mô hình AI và lấy từ khóa
//     // Ví dụ, trả về một mảng từ khóa giả định
//     return ["backend", "nodejs", "mongodb"]; // Thay thế bằng logic gọi AI thực tế
// };
