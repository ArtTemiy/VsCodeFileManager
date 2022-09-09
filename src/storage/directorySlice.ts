import { createSlice } from "@reduxjs/toolkit";

export const directorySlice = createSlice({
    name: "tickets",
    initialState: {
        currentDir: undefined,
        elementsList: undefined
    },
    reducers: {
        storeDirAndElements: (state, action) => {
            state.currentDir = action.payload.currentDir;
            state.elementsList = action.payload.elementsList;
        },
    },
});

export const {
    storeDirAndElements
} = directorySlice.actions;
export const directoryReducer = directorySlice.reducer;
