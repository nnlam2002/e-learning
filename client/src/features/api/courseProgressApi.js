import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PROGRESS_API = "http://localhost:8080/api/v1/progress";

export const courseProgressApi = createApi({
  reducerPath: "courseProgressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PROGRESS_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    getFeedback: builder.query({
      query: (courseId) => ({
        url: `/${courseId}/feedback`,
        method: "GET",
      }),
    }),
    getCourseProgress: builder.query({
      query: (courseId) => ({
        url: `/${courseId}`,
        method: "GET",
      }),
    }),
    getCoursesProgress: builder.query({
      query: () => ({
        url: "/",
        method: "GET",
      }),
    }),
    updateLectureProgress: builder.mutation({
      query: ({ courseId, lectureId }) => ({
        url: `/${courseId}/lecture/${lectureId}/view`,
        method:"POST"
      }),
    }),
    submitFeedback: builder.mutation({
      query: ({ courseId, rating, feedback }) => ({
          url: `/${courseId}/feedback`,
          method: "POST",
          body: {courseId, rating, feedback },
      })
    }),
    submitComment: builder.mutation({
      query: ({ courseId, comment }) => ({
          url: `/${courseId}/comment`,
          method: "POST",
          body: {courseId, comment },
      })
    }),
    completeCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/complete`,
            method:"POST"
        })
    }),
    inCompleteCourse: builder.mutation({
        query:(courseId) => ({
            url:`/${courseId}/incomplete`,
            method:"POST"
        })
    }),
    
  }),
});
export const {
useGetCourseProgressQuery,
useGetCoursesProgressQuery,
useUpdateLectureProgressMutation,
useCompleteCourseMutation,
useInCompleteCourseMutation,
useSubmitFeedbackMutation,
useSubmitCommentMutation,
useGetFeedbackQuery,
} = courseProgressApi;
