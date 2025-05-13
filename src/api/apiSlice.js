import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3001/api" }),
  tagTypes: ["Items", "State"],
  endpoints: (builder) => ({
    getItems: builder.query({
      query: ({ search, offset }) => ({
        url: "/items",
        params: { search, offset },
      }),
      providesTags: ["Items"],
    }),
    getState: builder.query({
      query: () => "/state",
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
