import { configureStore } from "@reduxjs/toolkit";
import { directoryReducer } from "./directorySlice";
import { logger } from "redux-logger";

export const store = configureStore({
    reducer: {
        directory: directoryReducer,
    },
    middleware: [logger],
    preloadedState: {
        directory: {
            loadingState: "loading",
            prevDir: undefined,
            currentDir: undefined,
            elementsList: undefined
        },
    }
});
