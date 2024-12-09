import { ChartNoAxesColumn, SquareLibrary, List, Users } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { Link, Outlet } from "react-router-dom";

const Sidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-8 border-r border-gray-300 dark:border-gray-700 p-5 sticky top-0 h-screen">
        <div className="space-y-4">
          {/* Dashboard Tab */}
          <Link to="dashboard" className="flex items-center gap-2">
            <ChartNoAxesColumn size={22} />
            <h1>Dashboard</h1>
          </Link>
          {/* Courses Tab */}
          <Link to="course" className="flex items-center gap-2">
            <SquareLibrary size={22} />
            <h1>Courses</h1>
          </Link>
          {/* Categories Tab */}
          <Link to="category" className="flex items-center gap-2">
            <List size={22} />
            <h1>Categories</h1>
          </Link>
          {/* User Management Tab - Only for Admin */}
          {user?.role === "admin" && (
            <Link to="user" className="flex items-center gap-2">
              <Users size={22} />
              <h1>User Management</h1>
            </Link>
          )}
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-10">
        <Outlet />
      </div>
    </div>
  );
};

export default Sidebar;
