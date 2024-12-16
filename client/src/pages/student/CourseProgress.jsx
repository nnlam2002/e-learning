import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  useCompleteCourseMutation,
  useGetCourseProgressQuery,
  useInCompleteCourseMutation,
  useUpdateLectureProgressMutation,
  useSubmitCommentMutation,
  useSubmitFeedbackMutation,
  useGetFeedbackQuery,
} from "@/features/api/courseProgressApi";
import { CheckCircle, CheckCircle2, CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import ReactPlayer from "react-player";
const FeedbackSection = ({ courseId }) => {
  const { data, error, isLoading, refetch } = useGetFeedbackQuery(courseId);
  
  const [submitFeedback] = useSubmitFeedbackMutation();
  const [submitComment] = useSubmitCommentMutation();
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState("feedback"); // 'feedback' | 'comment'
  const [feedback, setFeedback] = useState("");
  const [comment, setComment] = useState("");
  const [filterStar, setFilterStar] = useState(0);
  const handleSubmitFeedback = async () => {
    if (!rating || !feedback) {
      toast.error("Please provide a rating and feedback.");
      return;
    }
    try {
      await submitFeedback({ courseId, rating, feedback });
      toast.success("Thank you for your feedback!");
      setRating(0);
      setFeedback("");
      refetch();
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };
  const handleSubmitComment = async () => {
    
    if (!comment) {
      toast.error("Please provide a comment.");
      return;
    }
    try {
      await submitComment({ courseId, comment });
      toast.success("Thank you for your comment!");
      setComment("");
      refetch();
    } catch (error) {
      toast.error("Failed to submit feedback. Please try again.");
    }
  };
  const handleFilterFeedback = (star) => {
    setFilterStar(star);
    refetch(); // Gọi lại API nếu cần hoặc lọc dữ liệu phía client
  };
  const filteredData =
  activeTab === "feedback"
    ? filterStar > 0
      ? data?.feedback?.filter((feedback) => feedback.star === filterStar)
      : data?.feedback
    : data?.comment;
  if (isLoading) return <p>Loading feedback...</p>;

  return (
    <div className="mt-6 bg-card text-card-foreground p-6 rounded-md shadow-sm">
  
      {/* Form to add feedback */}
      <div className="mb-6">
      <div className="flex border-b border-gray-200 mb-4">
    <button
      className={`px-4 py-2 font-semibold ${
        activeTab === "feedback" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
      }`}
      onClick={() => setActiveTab("feedback")}
    >
      Feedback
    </button>
    <button
      className={`px-4 py-2 font-semibold ${
        activeTab === "comment" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-600"
      }`}
      onClick={() => setActiveTab("comment")}
    >
      Comment
    </button>
  </div>

  {/* Nội dung của Feedback */}
  {activeTab === "feedback" && (
    <div>
      <h4 className="font-semibold text-lg">Write your feedback</h4>
      <div className="flex items-center mt-2">
        {[...Array(5)].map((_, i) => (
          <button
            key={i}
            onClick={() => setRating(i + 1)}
            className={`text-xl ${
              i < rating ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        className="w-full border border-border rounded-md p-2 mt-2 bg-input text-foreground placeholder-muted-foreground"
        placeholder="Write your feedback here..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div className="flex items-center mt-4">
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={handleSubmitFeedback}
        >
          Submit Feedback
        </button>          <select
            className="ml-4 border border-gray-300 dark:text-gray-800 rounded-md p-2"
            value={filterStar}
            onChange={(e) => handleFilterFeedback(Number(e.target.value))}
          >
            <option value={0}>All Stars</option>
            {[...Array(5)].map((_, i) => (
              <option key={i} value={i + 1}>{`${i + 1} Star`}</option>
            ))}
          </select>
      </div>
    </div>
  )}

  {/* Nội dung của Comment */}
  {activeTab === "comment" && (
    <div>
      <h4 className="font-semibold text-lg">Write your comment</h4>
      <textarea
        className="w-full border border-border rounded-md p-2 mt-2 bg-input text-foreground placeholder-muted-foreground"
        placeholder="Write your comment here..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex items-center mt-4">
        <button
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          onClick={handleSubmitComment}
        >
          Submit Comment
        </button>
      </div>
    </div>
  )}
      </div>

        {/* Display feedback */}
        {/* Display data for the active tab */}
        <div>
          <h4 className="font-semibold text-lg mb-4">
            {activeTab === "feedback" ? "Feedbacks" : "Comments"}
          </h4>
          {filteredData?.length > 0 ? (
            filteredData.map((item) => (
              <div key={item._id} className="mb-6 border-b pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      item.userId?.photoUrl ||
                      `https://avatar.iran.liara.run/username?username=${item.userId?.name}`
                    }
                    alt="User Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-sm mt-1"
                  />
                  <div className="flex-1">
                    {activeTab === "feedback" && (
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xl ${
                              i < item.star ? "text-yellow-500" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-gray-800 dark:text-gray-200 text-base mb-2">
                      {item.feedback || item.comment}
                    </p>
                    <p className="text-sm text-gray-500">
                      By <strong>{item.userId?.name || "Anonymous"}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No {activeTab} yet. Be the first to comment!</p>
          )}
        </div>
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
  const [feedback, setFeedback] = useState(""); // Comment text
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
              controls
              className="w-full h-auto md:rounded-lg"
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
