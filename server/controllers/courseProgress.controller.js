import { CourseProgress } from "../models/courseProgress.js";
import { Course } from "../models/course.model.js";
import { Review } from "../models/review.model.js";
import { Comment } from "../models/comment.model.js";
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;
    // console.log(req.id);

    // step-1 fetch the user course progress
    let courseProgress = await CourseProgress.findOne({
      courseId,
      userId,
    }).populate("courseId");

    const courseDetails = await Course.findById(courseId).populate("lectures");

    if (!courseDetails) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    // Step-2 If no progress found, return course details with an empty progress
    if (!courseProgress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [],
          completed: false,
        },
      });
    }

    // Step-3 Return the user's course progress alog with course details
    return res.status(200).json({
      data: {
        courseDetails,
        progress: courseProgress.lectureProgress,
        completed: courseProgress.completed,
      },
    });
  } catch (error) {
    console.log(error);
  }
};
export const getCoursesProgress = async (req, res) => {
  try {
    const userId = req.id;

    let coursesProgress = await CourseProgress.find({ userId: userId }).populate("courseId");

    const coursesDetails = [];
    for (const courseProgress of coursesProgress) {
      const course = await Course.findById(courseProgress.courseId);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
        });
      }

      coursesDetails.push(course);
    }

    if (!coursesProgress) {
      return res.status(200).json({
        data: {
          progress: [],
          completed: false,
        },
      });
    }

    return res.status(200).json({
      data: {
        coursesDetails,
        coursesProgress
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateLectureProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.id;

    // fetch or create course progress
    let courseProgress = await CourseProgress.findOne({ courseId, userId });

    if (!courseProgress) {
      // If no progress exist, create a new record
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    // find the lecture progress in the course progress
    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lecture) => lecture.lectureId === lectureId
    );

    if (lectureIndex !== -1) {
      // if lecture already exist, update its status
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    } else {
      // Add new lecture progress
      courseProgress.lectureProgress.push({
        lectureId,
        viewed: true,
      });
    }

    // if all lecture is complete
    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course.lectures.length === lectureProgressLength)
      courseProgress.completed = true;

    await courseProgress.save();

    return res.status(200).json({
      message: "Lecture progress updated successfully.",
    });
  } catch (error) {
    console.log(error);
  }
};
export const submitComment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {comment} = req.body;
    const userId = req.id;
    console.log("haha");
    
    // const userName = req.nameUser
    console.log(comment);
    
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const newComment = new Comment({
      courseId, // Dùng đúng tên trường trong schema
      userId,
      comment,
    });
    await newComment.save(); // Lưu review vào database
    res.status(201).json({ message: "Feedback saved successfully", newComment });
  }catch(error){
    console.log(error);
  }
};
export const submitFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, feedback} = req.body;
    const userId = req.id;
    // const userName = req.nameUser
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    let existingReview = await Review.findOne({ courseId, userId });
    if (existingReview) {
      // Nếu đã có review, cập nhật review hiện tại
      existingReview.feedback = feedback;
      existingReview.star = rating;

      await existingReview.save(); // Lưu lại review đã cập nhật

      res.status(200).json({ message: "Feedback updated successfully", review: existingReview });
    } else {
    const review = new Review({
      courseId, // Dùng đúng tên trường trong schema
      userId,
      feedback,
      star: rating, // Dùng đúng tên trường trong schema
    });

    await review.save(); // Lưu review vào database
    // Tính lại tổng số sao và số lượng feedback cho khóa học
    const reviews = await Review.find({ courseId }); // Lấy tất cả reviews của khóa học
    const totalStars = reviews.reduce((acc, review) => acc + review.star, 0);
    const totalReviews = reviews.length;
    const averageRating = (totalStars / totalReviews).toFixed(1);
    
    await Course.findByIdAndUpdate(courseId, {
      averageRating: averageRating,
      totalReviews: totalReviews,
    });
    res.status(201).json({ message: "Feedback saved successfully", review });
  }
  }catch(error){

    console.log(error);

  }
};
export const getFeedback = async (req, res) => {
  try {
    const { courseId } = req.params;

    const feedbackList = await Review.find({ courseId })
      .populate("userId", "name photoUrl") // Thêm trường profilePicture
      .sort({ createdAt: -1 });
    const commentList = await Comment.find({ courseId })
      .populate("userId", "name photoUrl") // Thêm trường profilePicture
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      feedback: feedbackList || [],
      comment: commentList || [],
      message: feedbackList.length
        ? "Feedback fetched successfully"
        : "No feedback found for this course",
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedback. Please try again later.",
    });
  }
};



export const markAsCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress)
      return res.status(404).json({ message: "Course progress not found" });

    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = true)
    );
    courseProgress.completed = true;
    await courseProgress.save();
    return res.status(200).json({ message: "Course marked as completed." });
  } catch (error) {
    console.log(error);
  }
};

export const markAsInCompleted = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.id;

    const courseProgress = await CourseProgress.findOne({ courseId, userId });
    if (!courseProgress)
      return res.status(404).json({ message: "Course progress not found" });

    courseProgress.lectureProgress.map(
      (lectureProgress) => (lectureProgress.viewed = false)
    );
    courseProgress.completed = false;
    await courseProgress.save();
    return res.status(200).json({ message: "Course marked as incompleted." });
  } catch (error) {
    console.log(error);
  }
};
