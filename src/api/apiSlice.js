import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://takemycode-server-bmkf.vercel.app/api",
    // baseUrl: "http://localhost:5000/api",
  }),
  tagTypes: ["Items", "State"],
  endpoints: (builder) => ({
    getItems: builder.query({
      query: ({ min, max, offset }) => ({
        url: "/items",
        params: { min, max, offset },
      }),
      providesTags: ["Items"],
    }),
    getState: builder.query({
      query: ({ min, max, offset }) => ({
        url: "/state",
        params: { min, max, offset },
    }),
      providesTags: ["State"],
    }),
    updateState: builder.mutation({
      query: (state) => ({
        url: "/state",
        method: "POST",
        body: state,
      }),
      invalidatesTags: ["State"],
    }),
  }),
});

export const { useGetItemsQuery, useGetStateQuery, useUpdateStateMutation } =
  apiSlice;
