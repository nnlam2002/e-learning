import BuyCourseButton from "@/components/BuyCourseButton";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useGetFeedbackQuery,
} from "@/features/api/courseProgressApi";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
const renderStarRating = (rating) => {
  const stars = [];
  for (let i = 0; i < 5; i++) {
    stars.push(
      <Star
        key={i}
        className={i < rating ? "text-yellow-500" : "text-gray-400"}
        size={18}
        fill="currentColor"
      />
    );
  }
  return stars;
};
const renderStars = (rating) => {
  const fullStars = Math.round(rating);  // Làm tròn điểm rating
  const emptyStars = 5 - fullStars;  // Tính số sao trống

  const stars = [];
  
  // Vẽ sao đầy đủ
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="text-yellow-500" size={18} fill="currentColor" />);
  }

  // Vẽ sao trống
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<Star key={`empty-${i}`} className="text-gray-400" size={18} fill="currentColor" />);
  }

  return stars;
};
const CourseFeedback = () => {
  const [filterStars, setFilterStars] = useState(0);
  const { courseId } = useParams();
  const { data, error, isLoading } = useGetFeedbackQuery(courseId);
  
  if (isLoading) {
    return <p className="text-gray-500">Loading feedback...</p>;
  }

  if (error) {
    return <p className="text-red-500">Failed to load feedback. Please try again later.</p>;
  }

  const feedbacks = data.feedback || [];
  
  const averageRating =
    feedbacks.reduce((sum, fb) => sum + fb.star, 0) / feedbacks.length || 0;

  const filteredFeedbacks =
    filterStars > 0
      ? feedbacks.filter((fb) => Math.round(fb.star) === filterStars)
      : feedbacks;

  const starCounts = Array(5)
    .fill(0)
    .map(
      (_, index) =>
        feedbacks.filter((fb) => Math.round(fb.star) === 5 - index).length
    );

  return (
<Card className="my-8 mx-auto max-w-4xl">
  <CardHeader>
    <CardTitle>Student Feedback</CardTitle>
  </CardHeader>
  <CardContent className="space-y-6">
    {/* Summary Section: Star Ratings */}
    <div>
      <div className="flex items-center justify-between">
        {/* Average Rating */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">{averageRating.toFixed(1)}</h1>
          <div className="flex justify-center">
            {renderStarRating(Math.round(averageRating))}
          </div>
          <p className="text-sm text-gray-500">Course Rating</p>
        </div>

        {/* Star Counts */}
        <div className="flex-1 space-y-2 ml-8">
          {starCounts.map((count, index) => (
            <div key={index} className="flex items-center">
              <span className="text-sm font-medium">{5 - index} Stars</span>
              <div className="flex-1 mx-2 bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full"
                  style={{
                    width: `${(count / feedbacks.length) * 100}%`,
                  }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <Separator />

    {/* Feedback List */}
            <div>
          <h4 className="font-semibold text-lg mb-4">
            Feedbacks
          </h4>
          {feedbacks?.length > 0 ? (
            feedbacks.map((fb) => (
              <div key={fb._id} className="mb-6 border-b pb-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={
                      fb.userId?.photoUrl ||
                      `https://avatar.iran.liara.run/username?username=${fb.userId?.name}`
                    }
                    alt="User Avatar"
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-300 shadow-sm mt-1"
                  />
                  <div className="flex-1">
                      <div className="flex items-center mb-2">
                        {renderStarRating(fb.star)} {/* Giữ lại phần render ngôi sao */}
                      </div>
                    <p className="text-gray-800 dark:text-gray-200 text-base mb-2">
                      {fb.comment || fb.feedback}
                    </p>
                    <p className="text-sm text-gray-500">
                      By <strong>{fb.userId?.name || "Anonymous"}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No feedback yet. Be the first to comment!</p>
          )}
        </div>
  </CardContent>
</Card>
  );
};
const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data: feedbackData, error: feedbackError, isLoading: isFeedbackLoading } = useGetFeedbackQuery(courseId);
  console.log(feedbackData);
  
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);
  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] = useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h>Failed to load course details</h>;

  const { course, purchased } = data;
  
  const averageRating =
  feedbackData?.feedback?.reduce((sum, fb) => sum + fb.star, 0) /
    (feedbackData?.feedback?.length || 1) || 0;
  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`)
    }
  }

  const getIndexOfFreePreviewUrl =
    course !== null
      ? course?.lectures?.findIndex(
        (item) => item.isPreviewFree
      )
      : -1;

  const handleSetFreePreview = (getCurrentVideoInfo) => {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.
      videoUrl
    )
    setShowFreePreviewDialog(true)
  }
  const handleAddToCart = () =>{
    console.log(course);
    
  }

  return (
    <div className="space-y-5">
      <div
        className="bg-[#2D2F31] text-white relative"
        style={{
          backgroundImage: `url(${course?.courseThumbnail || `https://avatar.iran.liara.run/username?username=${course?.courseTitle}`})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-10 dark:bg-opacity-50"></div>

        <div className="max-w-7xl mx-auto py-8 px-4 md:px-8 flex flex-col gap-2 relative">
          <div className="flex justify-between items-start">
            {/* Left Section */}
            <div className="flex flex-col gap-2">
              <h1 className="font-bold text-2xl md:text-3xl text-white">
                {course?.courseTitle}
              </h1>
              <p className="text-base md:text-lg text-white">{course?.subTitle}</p>
              <p>
                Created By{" "}
                <span className="text-[#C0C4FC] underline italic">{course?.creator.name}</span>
              </p>
              <div className="flex items-center gap-2 text-sm text-white">
                <BadgeInfo size={16} />
                <p>Last updated {course?.createdAt.split("T")[0]}</p>
              </div>
              <p className="text-white">Students enrolled: {course?.enrolledStudents.length}</p>
              <div className="flex items-center gap-1 mt-2">
                {renderStars(averageRating || 0)} {/* Gọi hàm renderStars với dữ liệu mới */}
                <span className="text-white ml-2">
                  ({feedbackData?.feedback?.length || 0} feedbacks)
                </span>
              </div>

            </div>

            <img
              src={course?.creator?.photoUrl || `https://avatar.iran.liara.run/username?username=${course?.creator?.name}`}
              alt={`${course?.creator?.name}'s photo`}
              className="w-40 h-40 object-cover rounded-full border-4 border-white shadow-lg"
            />
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto my-5 px-4 md:px-8 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-1/2 space-y-5">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent><p
              className="text-sm"
              dangerouslySetInnerHTML={{ __html: course.description }}
            /></CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {
                course?.lectures?.map((lecture, index) => (
                  <li
                    className={`${lecture?.isPreviewFree ? 'cursor-pointer' : 'cursor-not-allowed'} flex items-center mb-4`}
                    onClick={lecture?.isPreviewFree ? () => handleSetFreePreview(lecture) : null}
                  >
                    {
                      lecture?.isPreviewFree ?
                        <PlayCircle className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />
                    }
                    <span>{lecture?.lectureTitle}</span>
                  </li>
                ))
              }
            </CardContent>
          </Card>
        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <ReactPlayer
                  width="100%"
                  height={"100%"}
                  url={
                    getIndexOfFreePreviewUrl !== -1 ?
                      course?.lectures[getIndexOfFreePreviewUrl].videoUrl : ''
                  }
                  controls={true}
                />
              </div>
              <h1>{course?.lectures[getIndexOfFreePreviewUrl]?.lectureTitle}</h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">
                {new Intl.NumberFormat('en-EN', {
                  style: 'currency',
                  currency: 'USD',
                }).format(course.coursePrice)}</h1>
            </CardContent>
              <CardFooter className="flex flex-col items-center p-4 space-y-2">
                {purchased ? (
                  <Button onClick={handleContinueCourse} className="w-full">
                    Continue Course
                  </Button>
                ) : (
                  <>
                    <BuyCourseButton courseId={courseId} className="w-full" />
                    <Button onClick={handleAddToCart} className="w-full bg-blue-500 text-white hover:bg-blue-600">
                      Add to Cart
                    </Button>
                  </>
                )}
              </CardFooter>
          </Card>
        </div>
      </div>
            <CourseFeedback 
        feedbacks={course.reviews} 
        averageRating={course.averageRating} 
      />
      <Dialog open={showFreePreviewDialog} onOpenChange={() => {
                setShowFreePreviewDialog(false)
                setDisplayCurrentVideoFreePreview(null)
            }}>
                <DialogContent className="w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Course Preview</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-video rounded-lg flex items-center justify-center">
                        <ReactPlayer
                            url={
                                displayCurrentVideoFreePreview 
                            }
                            width="100%"
                  height={"100%"}
                  controls={true}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        {
                            course?.lectures
                                ?.filter(item=>item.isPreviewFree)
                                .map(filteredItem=> (
                                    <p onClick={()=>handleSetFreePreview(filteredItem)} className="cursor-pointer text-[16px] font-medium">
                                        {filteredItem?.lectureTitle}
                                    </p>
                                ))}
                    </div>
                    <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">
                                Close
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
    </div>
  );
};

export default CourseDetail;
