import React from "react";

const CourseCart = ({ courses }) => {
  return (
    <div className="max-w-6xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-3xl mb-6">My Cart</h1>
      <div>
        {courses.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-300">
            You are not enrolled in any course.
          </p>
        ) : (
          <div className="space-y-6">
            {courses.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// CourseCard component
const CourseCard = ({ course }) => {
  const { thumbnail, title, description, progress } = course;

  return (
    <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg hover:shadow-md transition">
      {/* Course Thumbnail */}
      <div className="w-24 h-24 flex-shrink-0">
        <img
          src={thumbnail || "https://via.placeholder.com/150"}
          alt={title}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      {/* Course Info */}
      <div className="flex-grow ml-4">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {description || "No description available for this course."}
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Progress: {progress || 0}%</span>
        </div>
      </div>
      {/* Continue Learning Button */}
      <div className="ml-4">
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          onClick={() => alert(`Continue learning ${title}`)}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default CourseCart;
