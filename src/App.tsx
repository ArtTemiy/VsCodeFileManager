import { useContext } from "react";
import { FilesList } from "./components/filesList";
import { vscode } from "./components/ToolsContext";
import { ClientMessage } from "./types/ClientMessage";
import { storeDirAndElements } from './storage/directorySlice';
import { ServerMessage } from "./types/ServerMessage";
import { DirContentDescription } from "./types/ServerMessage";
import { useDispatch, useSelector } from "react-redux";
import { selectorDataLoaded } from "./storage/selectors";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const App = () => {
  const initDirMessage: ClientMessage = {
    type: "InitDir",
    payload: {},
  };
  const dispatch = useDispatch();

  window.addEventListener(
    "message",
    event => {
      const message = event.data as ServerMessage;

      switch(message.messageType) {
        case "UpdateCurrentDir":
          (() => {
            const payload = message.payload as DirContentDescription;
            dispatch(storeDirAndElements(payload));
          })();
          break;
        default:
          console.error(`unknown message type: ${message.payloadType}`);
      }
    }
  );


  const dataLoaded = useSelector(selectorDataLoaded);
  if (!dataLoaded) {vscode.postMessage(initDirMessage);}

  return (
    <>
      {dataLoaded ?
          <FilesList/> :
          <h1>Data Loading...</h1>
      }
    </>
  );
};

export default App;
