import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API = "http://localhost:8080/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  tagTypes: ["Refetch_Purchased_Course"],
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-checkout-session",
        method: "POST",
        body: { courseId },
      }),
      invalidatesTags: ["Refetch_Purchased_Course"],
    }),
    createCartCheckoutSession: builder.mutation({
      query: (courseIds) => ({
        url: "/checkout/create-cart-checkout-session",
        method: "POST",
        body: { courseIds },
      }),
      invalidatesTags: ["Refetch_Purchased_Course"],
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
      providesTags: ["Refetch_Purchased_Course"],
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
      providesTags: ["Refetch_Purchased_Course"],
    }),
    addCourseToCart: builder.mutation({
      query: (courseId) => ({
        url: `/add-to-cart`,
        method: "POST",
        body: { courseId }
      }),
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useCreateCartCheckoutSessionMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
  useAddCourseToCartMutation,

} = purchaseApi;
