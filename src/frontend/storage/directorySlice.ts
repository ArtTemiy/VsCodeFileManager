import { createSlice } from "@reduxjs/toolkit";

export const directorySlice = createSlice({
    name: "tickets",
    initialState: {
        loadingState: "loading",
        prevDir: undefined,
        currentDir: undefined,
        elementsList: undefined,
    },
    reducers: {
        storeDirAndElements: (state, action) => {
            state.prevDir = action.payload.prevDir;
            state.currentDir = action.payload.currentDir;
            state.elementsList = action.payload.elementsList;
            state.loadingState = "loaded";
        },
        setLoadingState: (state, action) => {
            state.loadingState = action.payload;
        }
    },
});

export const {
    storeDirAndElements,
    setLoadingState
} = directorySlice.actions;
export const directoryReducer = directorySlice.reducer;
