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
import { useLoadUserByIdQuery, useLoadUserQuery, useUpdateUserMutation, useUpdateUserRoleMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import Course from "@/pages/student/Course";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const EditUser = () => {
  const [isChangeRoleDialogOpen, setIsChangeRoleDialogOpen] = useState(false);
  const [role, setRole] = useState("");

  const params = useParams();
  const userId = params.userId;

  const { data, isLoading, refetch } = useLoadUserByIdQuery(userId);

  const [
    updateUserRole,
    { isLoading: updateUserIsLoading, isError, error, isSuccess },
  ] = useUpdateUserRoleMutation();

  const user = data && data.user;

  const updateRoleHandler = async () => {    
    await updateUserRole({
      userId: userId,
      newRole: role
    });
  };

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success("User's role updated successfully.");      
    }
    if (isError) {
      toast.error("Failed to update user's role");
    }    
  }, [isSuccess, isError]);

  if (isLoading) return <h1>Profile Loading...</h1>;

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

          <Button
            size="sm"
            className="mt-2 ml-3"
            onClick={() => setIsChangeRoleDialogOpen(true)}
          >
            Change Role
          </Button>
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
                  <Course key={index} course={course} />
                </li>
              ))
            ) : (
              <p className="font-normal text-gray-700 dark:text-gray-300">No courses enrolled.</p>
            )}
          </ul>
        </div>
      </div>

      <Dialog
        open={isChangeRoleDialogOpen}
        onOpenChange={setIsChangeRoleDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change user's role</DialogTitle>
            <DialogDescription>
              Make changes to user's role here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Label>Role</Label>
          <Select
            defaultValue={user?.role}
            onValueChange={setRole}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="instructor">Instructor</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button
              disabled={updateUserIsLoading}
              onClick={updateRoleHandler}
            >
              {updateUserIsLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EditUser;
