import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import Course from "./Course";
import {
  useLoadUserQuery,
  useUpdateUserMutation,
  useUpdatePasswordMutation
} from "@/features/api/authApi";
import { toast } from "sonner";
import { current } from "@reduxjs/toolkit";
const Profile = () => {
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [secondPassword, setSecondPassword] = useState("");

  const [profilePhoto, setProfilePhoto] = useState("");

  const [isEditProfileDialogOpen, setIsEditProfileDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);

  const { data, isLoading, refetch } = useLoadUserQuery();
  const [updatePassword] = useUpdatePasswordMutation();

  const [
    updateUser,
    { isLoading: updateUserIsLoading, isError, error, isSuccess },
  ] = useUpdateUserMutation();

  const onChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setProfilePhoto(file);
  };

  const updateUserHandler = async () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("profilePhoto", profilePhoto);
    await updateUser(formData);
  };

  const updatePasswordHandler = async () => {
    if (currentPassword.trim().length < 1) {
        toast.error("Please enter your current password");
        return;
    }

    if (password.length < 8) {
        toast.error("Password must be at least 8 characters long.");
        return;
    }

    if (password !== secondPassword) {
        toast.error("Passwords do not match.");
        return;
    }

    try {
        await updatePassword({
            userId: user?._id,
            currentPassword: currentPassword,
            newPassword: password,
        }).unwrap();

        toast.success("Password updated successfully.");
    } catch (error) {
        toast.error(error?.data?.message || "Failed to update password.");
    }
};

const validatePassword = (password) => {
  if (/\s/.test(password)) {
      toast.error("Password cannot contain spaces.");
      return false;
  }
  return true;
};

  useEffect(() => {
    refetch();
  }, []);

  useEffect(() => {
    if (isSuccess) {
      refetch();
      toast.success("Profile updated.");
    }
    if (isError) {
      toast.error("Failed to update profile");
    }
  }, [isSuccess, isError]);

  if (isLoading) return <h1>Profile Loading...</h1>;

  const user = data && data.user;

  useEffect(() => {
    if (user) {
      setName(user?.name || ""); 
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4 my-10">
      <h1 className="font-bold text-2xl text-center md:text-left">PROFILE</h1>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 my-5">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 mb-4">
            <AvatarImage
              src={user?.photoUrl || `https://avatar.iran.liara.run/username?username=${user?.name}`}
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

          {/* Button to open Edit Profile Dialog */}
          <Button
            size="sm"
            className="mt-2"
            onClick={() => setIsEditProfileDialogOpen(true)}
          >
            Edit Profile
          </Button>

          {/* Button to open Change Password Dialog */}
          <Button
            size="sm"
            className="mt-2 ml-3"
            onClick={() => setIsChangePasswordDialogOpen(true)}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        open={isEditProfileDialogOpen}
        onOpenChange={setIsEditProfileDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Profile Photo</Label>
              <Input
                onChange={onChangeHandler}
                type="file"
                accept="image/*"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={updateUserIsLoading}
              onClick={updateUserHandler}
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

      {/* Change Password Dialog */}
      <Dialog 
      open={isChangePasswordDialogOpen}
      onOpenChange={setIsChangePasswordDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Make changes to your password here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                }}
                placeholder="Current Password"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>New Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                placeholder="New Password"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label>Re-type Password</Label>
              <Input
                type="password"
                value={secondPassword}
                onChange={(e) => {
                  setSecondPassword(e.target.value);
                  }
                }
                placeholder="Re-type Password"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              // disabled={password.length < 8 || password !== secondPassword}
              onClick={updatePasswordHandler}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
