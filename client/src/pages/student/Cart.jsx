import React, { useState, useEffect } from "react";
import { useGetCourseInCartQuery, useRemoveCourseFromCartMutation } from "@/features/api/courseApi";
import { useCreateCartCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BuyCourseButton from "@/components/BuyCourseButton";
const CourseCart = () => {
  const location = useLocation(); // Theo dõi route hiện tại
  const { data, isLoading, isError, refetch } = useGetCourseInCartQuery();
  const [removeCourseFromCart] = useRemoveCourseFromCartMutation();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (data?.cartCourses) {
      setCourses(data.cartCourses); // Cập nhật danh sách courses khi dữ liệu thay đổi
    }
  }, [data]);

  useEffect(() => {
    refetch(); // Làm mới dữ liệu khi route thay đổi
  }, [location, refetch]);

  const handleRemove = async (courseId) => {
    try {
      await removeCourseFromCart(courseId).unwrap();
      setCourses((prevCourses) => prevCourses.filter((course) => course.courseId !== courseId));
      toast.success("Course removed from cart!");
    } catch (error) {
      console.error("Failed to remove course:", error);
      toast.error("Failed to remove course. Please try again.");
    }
  };

  const handleCheckout = async () => {
    const courseIds = courses.map((course) => course.courseId);

    if (courseIds.length === 0) {
      toast.error("Your cart is empty! Please add courses before checking out.");
      return;
    }

    try {
      const [createCartCheckoutSession] = useCreateCartCheckoutSessionMutation();
      const response = await createCartCheckoutSession({ courseIds }).unwrap();

      if (response?.success && response?.url) {
        window.location.href = response.url; // Chuyển hướng đến Stripe Checkout
      } else {
        toast.error(response.message || "Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An unexpected error occurred during checkout. Please try again.");
    }
  };

  const totalPrice = courses.reduce((acc, course) => acc + course.price, 0);

  if (isLoading) return <p className="text-center text-gray-600">Loading your cart...</p>;
  if (isError || !courses) return <p className="text-center text-red-500">Failed to load cart. Please try again later.</p>;

  return (
    <div className="max-w-6xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-3xl mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="col-span-2 space-y-6">
          {courses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">Your cart is currently empty.</p>
          ) : (
            courses.map((course) => (
              <CourseCard key={course.courseId} course={course} onRemove={handleRemove} />
            ))
          )}
        </div>

        {/* Summary Section */}
        <div className="p-6 bg-white dark:bg-gray-800 shadow-sm rounded-lg">
          <h2 className="font-semibold text-xl mb-4">Order Summary</h2>
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>Total Price:</span>
            <span className="font-bold text-lg">${totalPrice.toFixed(2)}</span>
          </div>
          {/* <button
            className="w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            onClick={handleCheckout}
          >
            Checkout
          </button> */}
        </div>
      </div>
    </div>
  );
};

// CourseCard Component
const CourseCard = ({ course, onRemove }) => {
  const { courseId, thumbnail, title, subTitle, price, rating, reviews } = course;

  return (
    <div className="relative">
      <Link to={`/course-detail/${courseId}`} className="absolute inset-0 z-0" />
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 shadow-sm rounded-lg hover:shadow-md transition relative z-10">
        {/* Course Thumbnail */}
        <div className="w-32 h-20 flex-shrink-0">
          <img
            src={thumbnail || "https://via.placeholder.com/150"}
            alt={title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Course Info */}
        <div className="flex-grow ml-4">
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {subTitle || "No description available for this course."}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">Rating: {rating}</span>
            <span>({reviews} reviews)</span>
          </div>
        </div>

        {/* Course Price, Remove Button, and Purchase Button */}
        <div className="ml-4 flex flex-col items-end">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">${price.toFixed(2)}</span>
          <div className="mt-2 flex space-x-2">
            {/* Remove Button */}
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(courseId);
              }}
            >
              Remove
            </button>
            {/* Purchase Button */}
            <BuyCourseButton courseId={courseId} onSuccess={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};


export default CourseCart;
