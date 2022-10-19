import { useContext } from "react";
import { FilesList } from "../frontend/components/filesList";
import { vscode } from "../ToolsContext";
import { ClientMessage } from "../types/ClientMessage";
import { storeDirAndElements } from '../frontend/storage/directorySlice';
import { ServerMessage } from "../types/ServerMessage";
import { DirContentDescription } from "../types/ServerMessage";
import { useDispatch, useSelector } from "react-redux";
import { selectorDataLoaded } from "../frontend/storage/selectors";
import { FilesManager } from "./components/fileManager";
import React from 'react';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const App = () => {
  return (
    <>
      <style>
      @import url('https://fonts.googleapis.com/css2?family=Inconsolata:wght@300&family=Roboto+Mono:wght@300&display=swap');
      </style>
      <FilesManager/>
    </>
  );
};

export default App;
