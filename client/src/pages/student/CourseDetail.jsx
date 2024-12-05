import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, Lock, PlayCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] = useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h>Failed to load course details</h>;

  const { course, purchased } = data;

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

  return (
    <div className="space-y-5">
      <div
        className="bg-[#2D2F31] text-white relative"
        style={{
          backgroundImage: `url(${course?.courseThumbnail || "https://github.com/shadcn.png"})`,
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
            </div>

            <img
              src={course?.creator?.photoUrl || "https://github.com/shadcn.png"}
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
            <CardFooter className="flex justify-center p-4">
              {purchased ? (
                <Button onClick={handleContinueCourse} className="w-full">Continue Course</Button>
              ) : (
                <BuyCourseButton courseId={courseId} />
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
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
