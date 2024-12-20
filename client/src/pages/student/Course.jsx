import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { Link } from "react-router-dom";

const Course = ({ course }) => {
  
  return (
    <Link to={`/course-detail/${course._id}`}>
      <Card className="overflow-hidden rounded-lg dark:bg-gray-800 bg-white shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
        <div className="relative">
          <img
            src={course.courseThumbnail}
            alt="course"
            className="w-full h-36 object-cover rounded-t-lg"
          />
        </div>
        <CardContent className="px-5 py-4 space-y-3">
          <h1 className="hover:underline font-bold text-lg truncate">
            {course.courseTitle}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={course.creator?.photoUrl || `https://avatar.iran.liara.run/username?username=${course.creator?.name}`} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h1 className="font-medium text-sm">{course.creator?.name}</h1>
            </div>
            <div className="flex flex-col items-end">
              <Badge className="bg-blue-600 text-white px-2 py-1 text-xs rounded-full">
                {course.courseLevel}
              </Badge>
              <div className="flex items-center gap-[2px]">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-lg ${
                    i < Math.round(course.averageRating) ? "text-[#E59819]" : "text-gray-300"
                  }`}
                  style={{ letterSpacing: "-2px" }} // Giảm khoảng cách ngôi sao
                >
                  ★
                </span>
              ))}
              <span className="text-gray-500 text-sm ml-1">({course.totalReviews || 0})</span>
            </div>



            </div>
          </div>
          <div className="text-lg font-bold">
            <span>{new Intl.NumberFormat('en-EN', {
              style: 'currency',
              currency: 'USD',
            }).format(course.coursePrice)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default Course;
