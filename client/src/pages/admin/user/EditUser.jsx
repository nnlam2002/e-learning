import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // For redirection after editing
import { useLoadUserByIdQuery, useLoadUserQuery, useUpdateUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import Course from "@/pages/student/Course";

const EditUser = () => {
    const params = useParams();
    const userId = params.userId;

    const { data, isLoading, refetch } = useLoadUserByIdQuery(userId);    

    if (isLoading) return <h1>Profile Loading...</h1>;

    const user = data && data.user;
    console.log(user.enrolledCourses.length);
    
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || "https://github.com/shadcn.png"}
              alt="@shadcn"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Name:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user?.name}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Email:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user?.email}
              </span>
            </h1>
          </div>
          <div className="mb-2">
            <h1 className="font-semibold text-gray-900 dark:text-gray-100 ">
              Role:
              <span className="font-normal text-gray-700 dark:text-gray-300 ml-2">
                {user?.role.toUpperCase()}
              </span>
            </h1>
          </div>
        </div>
      </div>
      {/* Enrolled Courses Section */}
      <div className="mt-4">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Enrolled Courses:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ul className="mt-2">
              {user?.enrolledCourses && user.enrolledCourses.length > 0 ? (
                user.enrolledCourses.map((course, index) => (
                  <li key={index} className="font-normal text-gray-700 dark:text-gray-300">
                    <Course key={index} course={course}/>
                  </li>
                ))
              ) : (
                <p className="font-normal text-gray-700 dark:text-gray-300">No courses enrolled.</p>
              )}
            </ul>
          </div>
            
          </div>
    </div>
  );
};

export default EditUser;
