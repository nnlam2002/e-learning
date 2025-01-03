import React, { useEffect } from "react";
import { Button } from "./ui/button";
import { useCreateCheckoutSessionMutation } from "@/features/api/purchaseApi";
import { useRemoveCourseFromCartMutation } from "@/features/api/courseApi"; // Import API xóa khóa học khỏi giỏ
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyCourseButton = ({ courseId, onSuccess }) => {
  const [createCheckoutSession, { data, isLoading, isSuccess, isError, error }] =
    useCreateCheckoutSessionMutation();
  const [removeCourseFromCart] = useRemoveCourseFromCartMutation(); // Mutation xóa khóa học khỏi giỏ hàng

  const purchaseCourseHandler = async () => {
    localStorage.removeItem("recommendedCourses");
    await createCheckoutSession(courseId);
  };

  useEffect(() => {
    const handleSuccess = async () => {
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast.error("Invalid response from server.");
      }
    };

    if (isSuccess) {
      handleSuccess();
    }

    if (isError) {
      toast.error(error?.data?.message || "Failed to create checkout session");
    }
  }, [data, isSuccess, isError, error]);

  // Khi giao dịch thành công và khóa học đã được mua
  useEffect(() => {
    const handlePostPurchase = async () => {
      if (isSuccess) {
        try {
          await removeCourseFromCart(courseId); // Xóa khóa học khỏi giỏ
          if (onSuccess) onSuccess(courseId); // Gọi callback để cập nhật giao diện
        } catch (removeError) {
          console.error("Failed to remove course from cart:", removeError);
          toast.error("Failed to remove course from cart after purchase.");
        }
      }
    };

    handlePostPurchase();
  }, [isSuccess, removeCourseFromCart, courseId, onSuccess]);

  return (
    <Button
      disabled={isLoading}
      onClick={purchaseCourseHandler}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </>
      ) : (
        "Purchase Course"
      )}
    </Button>
  );
};

export default BuyCourseButton;
