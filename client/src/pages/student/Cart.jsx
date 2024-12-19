import React, { useState } from "react";
import { useGetCourseInCartQuery, useRemoveCourseFromCartMutation } from "@/features/api/courseApi";
import { useCreateCartCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { toast } from "sonner";
import { Link, useLocation,useNavigate } from "react-router-dom";
const CourseCart = () => {
  const location = useLocation(); // Theo dõi route hiện tại
  const { data, isLoading, isError, refetch } = useGetCourseInCartQuery();
  const [removeCourseFromCart, { isLoading: isRemoving }] = useRemoveCourseFromCartMutation();
  const [courses, setCourses] = useState([]);
  React.useEffect(() => {
    refetch(); // Làm mới dữ liệu giỏ hàng khi người dùng truy cập lại
  }, [location, refetch]);
  // Cập nhật danh sách courses khi nhận dữ liệu
  React.useEffect(() => {
    if (data?.cartCourses) {
      setCourses(data.cartCourses);
    }
  }, [data]);

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading your cart...</p>;
  }

  if (isError || !courses) {
    return (
      <p className="text-center text-red-500">
        Failed to load cart. Please try again later.
      </p>
    );
  }

  const totalPrice = courses.reduce((acc, course) => acc + course.price, 0);

  const handleRemove = async (courseId) => {
    try {
      await removeCourseFromCart(courseId).unwrap();
      // Cập nhật danh sách courses sau khi xóa
      setCourses((prevCourses) => prevCourses.filter((course) => course.courseId !== courseId));
      toast.success("Course removed from cart!");
    } catch (error) {
      console.error("Failed to remove course:", error);
      toast.error("Failed to remove course. Please try again.");
    }
  };
  
  const CheckoutButton = () => {
    const { data, isLoading: isCartLoading } = useGetCourseInCartQuery();
    const [createCartCheckoutSession, { isLoading: isProcessing }] = useCreateCartCheckoutSessionMutation();
    const navigate = useNavigate();
  
    const handleCheckout = async () => {
      try {
        // Tạo danh sách `courseIds` từ các khóa học trong giỏ hàng
        const courseIds = courses.map((course) => course.courseId);
    
        if (courseIds.length === 0) {
          alert("Your cart is empty! Please add courses before checking out.");
          return;
        }
    
        // Gửi yêu cầu tạo phiên thanh toán
        const response = await createCartCheckoutSession({ courseIds });
    
        if (response.success && response.url) {
          // Chuyển hướng tới Stripe Checkout nếu thành công
          window.location.href = response.url;
        } else {
          alert(response.message || "Failed to create checkout session.");
        }
      } catch (error) {
        console.error("Checkout error:", error);
        alert("An unexpected error occurred during checkout. Please try again.");
      }
    };    
    return (
      <button
        className={`w-full mt-6 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg ${
          isProcessing ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleCheckout}
        disabled={isProcessing || isCartLoading}
      >
        {isProcessing ? "Processing..." : "Checkout"}
      </button>
    );
  };
  
  
  return (
    <div className="max-w-6xl mx-auto my-10 px-4 md:px-0">
      <h1 className="font-bold text-3xl mb-6">Shopping Cart</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="col-span-2 space-y-6">
          {courses.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">
              Your cart is currently empty.
            </p>
          ) : (
            courses.map((course) => (
              <CourseCard
                key={course.courseId}
                course={course}
                onRemove={handleRemove}
                isRemoving={isRemoving}
              />
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
          <CheckoutButton />
        </div>
      </div>
    </div>
  );
};

// CourseCard Component
const CourseCard = ({ course, onRemove, isRemoving }) => {
  const { courseId, thumbnail, title, subTitle, price, rating, reviews } = course;

  return (
    <div className="relative">
      {/* Bọc toàn bộ thẻ bằng Link */}
      <Link to={`/course-detail/${courseId}`} className="absolute inset-0 z-0">
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
          <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
            {title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {subTitle || "No description available for this course."}
          </p>
          <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
            <span className="mr-2">Rating: {rating}</span>
            <span>({reviews} reviews)</span>
          </div>
        </div>

        {/* Course Price and Remove Button */}
        <div className="ml-4 flex flex-col items-end">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
            ${price.toFixed(2)}
          </span>
          <button
            className={`mt-2 px-4 py-2 text-sm font-medium text-white ${
              isRemoving ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"
            } rounded-lg`}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn hành động Link khi click vào Remove
              onRemove(courseId);
            }}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
      </Link>
    </div>
  );
};
export default CourseCart;
