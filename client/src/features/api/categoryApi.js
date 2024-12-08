import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const CATEGORY_API = "http://localhost:8080/api/v1/category";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  tagTypes: ["Category"],
  baseQuery: fetchBaseQuery({
    baseUrl: CATEGORY_API,
    credentials: "include",
  }),
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: ({ categoryName, isActive }) => ({
        url: '',
        method: "POST",
        body: { categoryName, isActive },
      }),
      invalidatesTags: ["Category"],
    }),

    getAllCategories: builder.query({
      query: () => ({
        url: '',
        method: "GET",
      }),
      providesTags: ["Category"],
    }),

    getCategoryById: builder.query({
      query: (categoryId) => ({
        url: `/${categoryId}`,
        method: "GET",
      }),
    }),

    editCategory: builder.mutation({
      query: ({ categoryId, categoryName, isActive }) => ({
        url: `/${categoryId}`,
        method: "PUT",
        body: { categoryName, isActive },
      }),
      invalidatesTags: ["Category"],
    }),

    deleteCategory: builder.mutation({
      query: (categoryId) => ({
        url: `/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Category"],
    }),
  }),
});

export const {
  useCreateCategoryMutation,
  useGetAllCategoriesQuery,
  useGetCategoryByIdQuery,
  useEditCategoryMutation,
  useDeleteCategoryMutation,
} = categoryApi;
