import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
  useSubmitFeedbackMutation,
  useGetFeedbackQuery,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
const FeedbackSection = ({ courseId }) => {
  const { data, error, isLoading, refetch } = useGetFeedbackQuery(courseId);
  const [submitFeedback] = useSubmitFeedbackMutation();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmitFeedback = async () => {
    if (!rating || !comment) {
      toast.error("Please provide a rating and comment.");
      return;
    }
    try {
      await submitFeedback({ courseId, rating, comment });
      toast.success("Thank you for your feedback!");
      setRating(0);
      setComment("");
      refetch();
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };

  if (isLoading) return <p>Loading feedback...</p>;

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">Comments</h3>
      {data?.feedback?.length > 0 ? (
        data.feedback.map((feedback) => (
          <div key={feedback._id} className="mb-4 border-b pb-2">
            <div className="flex items-start mb-1">
              {/* User Avatar */}
              <img
                src={feedback.userId?.photoUrl} // URL avatar hoặc hình mặc định
                alt="User Avatar"
                className="w-10 h-10 rounded-full mr-3"
              />
              {/* User Feedback */}
              <div className="flex flex-col">
                <div className="flex items-center mb-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < feedback.star ? "text-yellow-500" : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700">{feedback.comment}</p>
                <p className="text-sm text-gray-500">
                  By {feedback.userId?.name || "Anonymous"}
                </p>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      )}
    </div>
  );
};


const CourseProgress = () => {
  const params = useParams();
  const navigate = useNavigate();

  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [submitFeedback] = useSubmitFeedbackMutation();
  const [rating, setRating] = useState(0); // Rating from 1-5
  const [comment, setComment] = useState(""); // Comment text
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentLecture, setCurrentLecture] = useState(null);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Failed to load course details</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle } = courseDetails;

  // initialze the first lecture is not exist
  const initialLecture =
    currentLecture || (courseDetails.lectures && courseDetails.lectures[0]);

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    await updateLectureProgress({ courseId, lectureId });
    refetch();
  };
  const handleSubmitFeedback = async () => {
    if (!rating || !comment) {
      toast.error("Please provide a rating and comment.");
      return;
    }
  
    try {
      await submitFeedback({ courseId, rating, comment });
      toast.success("Thank you for your feedback!");
      setRating(0);
      setComment("");
      refetch(); // Gọi lại API để cập nhật feedback
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };  
  // Handle select a specific lecture to watch
  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
    // handleLectureProgress(lecture._id);
  };


  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };
  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Display course name  */}
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate(`/course-detail/${courseId}`)}
        >{courseTitle}</h1>
        <Button
          onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
          variant={completed ? "outline" : "default"}
        >
          {completed ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" /> <span>Completed</span>{" "}
            </div>
          ) : (
            "Mark as completed"
          )}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Video section  */}
        <div className="flex-1 md:w-3/5 h-fit rounded-lg shadow-lg p-4">
          <div>
            <ReactPlayer
              url={currentLecture?.videoUrl || initialLecture.videoUrl}
              width="100%"
              height={"100%"}
              controls={true}
              className="w-full h-auto md:rounded-lg"
              // onPlay={() =>
              //   handleLectureProgress(currentLecture?._id || initialLecture._id)
              // }
              onEnded={() =>
                handleLectureProgress(currentLecture?._id || initialLecture._id)
              }
              onProgressUpdate={setCurrentLecture}
              progressData={currentLecture}
            />
          </div>
          {/* Display current watching lecture title */}
          <div className="mt-2 ">
            <h3 className="font-medium text-lg">
              {`Lecture ${
                courseDetails.lectures.findIndex(
                  (lec) =>
                    lec._id === (currentLecture?._id || initialLecture._id)
                ) + 1
              } : ${
                currentLecture?.lectureTitle || initialLecture.lectureTitle
              }`}
            </h3>
          </div>
                  {/* Rating and Comments Section */}
                  <FeedbackSection courseId={courseId} />

        </div>
        {/* Lecture Sidebar  */}
        <div className="flex flex-col w-full md:w-2/5 border-t md:border-t-0 md:border-l border-gray-200 md:pl-4 pt-4 md:pt-0">
          <h2 className="font-semibold text-xl mb-4">Course Lecture</h2>
          <div className="flex-1 overflow-y-auto">
            {courseDetails?.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`mb-3 hover:cursor-pointer transition transform ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-200 dark:dark:bg-gray-800"
                    : ""
                } `}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2 size={24} className="text-green-500 mr-2" />
                    ) : (
                      <CirclePlay size={24} className="text-gray-500 mr-2" />
                    )}
                    <div>
                      <CardTitle className="text-lg font-medium">
                        {lecture.lectureTitle}
                      </CardTitle>
                    </div>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant={"outline"}
                      className="bg-green-200 text-green-600"
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
