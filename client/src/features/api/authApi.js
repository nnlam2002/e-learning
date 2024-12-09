import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import { userLoggedIn, userLoggedOut } from "../authSlice";

const USER_API = "http://localhost:8080/api/v1/user/"

export const authApi = createApi({
    reducerPath:"authApi",
    baseQuery:fetchBaseQuery({
        baseUrl:USER_API,
        credentials:'include'
    }),
    endpoints: (builder) => ({
        registerUser: builder.mutation({
            query: (inputData) => ({
                url:"register",
                method:"POST",
                body:inputData
            })
        }),
        registerInstructor: builder.mutation({
            query: (inputData) => ({
                url:"register-instructor",
                method:"POST",
                body:inputData
            })
        }),
        loginUser: builder.mutation({
            query: (inputData) => ({
                url:"login",
                method:"POST",
                body:inputData
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        forgotPassword: builder.mutation({
            query: (inputData) => ({
                url:"forgot",
                method:"POST",
                body:inputData
            }),
        }),
        logoutUser: builder.mutation({
            query: () => ({
                url:"logout",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try { 
                    dispatch(userLoggedOut());
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUser: builder.query({
            query: () => ({
                url:"profile",
                method:"GET"
            }),
            async onQueryStarted(_, {queryFulfilled, dispatch}) {
                try {
                    const result = await queryFulfilled;
                    dispatch(userLoggedIn({user:result.data.user}));
                } catch (error) {
                    console.log(error);
                }
            }
        }),
        loadUserById: builder.query({
            query: (userId) => ({
                url:`profile/${userId}`,
                method:"GET"
            }),
        }),
        updateUser: builder.mutation({
            query: (formData) => ({
                url:"profile/update",
                method:"PUT",
                body:formData,
                credentials:"include"
            })
        }),
        updatePassword: builder.mutation({
            query: (inputData) => ({
                url: "password/update",
                method: "PUT",
                body: inputData,
            }),
        }),
        getAllUsers: builder.query({
            query: () => ({
                url: "user",
                method: "GET",
            }),
        }),
    })
});
export const {
    useRegisterUserMutation,
    useRegisterInstructorMutation,
    useLoginUserMutation,
    useForgotPasswordMutation,
    useLogoutUserMutation,
    useLoadUserQuery,
    useLoadUserByIdQuery,
    useUpdateUserMutation,
    useUpdatePasswordMutation,
    useGetAllUsersQuery,
} = authApi;
