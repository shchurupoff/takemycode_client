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
      query: ({ search, offset }) => ({
        url: "/items",
        params: { search, offset },
      }),
      keepUnusedDataFor: 1,
      providesTags: ["Items"],
    }),
    getState: builder.query({
      query: ({ search, offset }) => ({
        url: "/state",
        params: { search, offset },
    }),
      providesTags: ["State"],
      keepUnusedDataFor: 1,

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
