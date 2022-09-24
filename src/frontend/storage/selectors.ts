import { createSelector } from "@reduxjs/toolkit";

const selectSelf = state => state;
export const selectorDataLoaded = createSelector(selectSelf, state => state.directory.currentDir !== undefined);
export const selecorDataLoadingState = createSelector(selectSelf, state => state.directory.loadingState);
export const selectorCurrentDirAndElements = createSelector(selectSelf, state => state.directory);
