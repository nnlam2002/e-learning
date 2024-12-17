import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetAllCourseQuery, useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const CourseTable = () => {
  const { user } = useSelector((store) => store.auth);
  const { data, isLoading } = user?.role === 'admin' 
    ? useGetAllCourseQuery() 
    : useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) return <h1>Loading...</h1>;

  // Filter courses based on search query
  const filteredCourses = data.courses.filter(course => {
    const titleMatch = course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = course.category?.categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const authorMatch = course.creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return titleMatch || categoryMatch || authorMatch;
  });

  return (
    <div>
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg overflow-hidden max-w-xl mx-auto mb-6">
        <Input
          type="text"
          placeholder="Search by title, category, or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-grow border-none focus-visible:ring-0 px-6 py-3 text-gray-900 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>
      <Button onClick={() => navigate(`create`)}>Create a new course</Button>
      <Table>
        <TableCaption>A list of your recent courses.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Author</TableHead>
            <TableHead className="w-[100px]">Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCourses.map((course) => (
            <TableRow key={course._id}>
              <TableCell>{course.courseTitle}</TableCell>
              <TableCell>{course.category?.categoryName}</TableCell>
              <TableCell>{course.creator?.name}</TableCell>
              <TableCell className="font-medium">{course?.coursePrice || "NA"}</TableCell>
              <TableCell><Badge>{course.isPublished ? "Published" : "Draft"}</Badge></TableCell>
              <TableCell className="text-right">
                <Button size='sm' variant='ghost' onClick={() => navigate(`${course._id}`)}><Edit /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CourseTable;