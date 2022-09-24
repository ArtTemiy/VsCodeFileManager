import { useContext } from "react";
import { FilesList } from "../frontend/components/filesList";
import { vscode } from "../ToolsContext";
import { ClientMessage } from "../types/ClientMessage";
import { storeDirAndElements } from '../frontend/storage/directorySlice';
import { ServerMessage } from "../types/ServerMessage";
import { DirContentDescription } from "../types/ServerMessage";
import { useDispatch, useSelector } from "react-redux";
import { selectorDataLoaded } from "../frontend/storage/selectors";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const App = () => {
  return (
    <>
      <FilesList/>
    </>
  );
};

export default App;
