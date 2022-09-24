import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ClientGoToDirMessage, ClientMessage, ClientOpenFileMessage } from "../../types/ClientMessage";
import { ElementInfo } from "../../types/ElementInfo";
import { setLoadingState } from "../storage/directorySlice";

import { selecorDataLoadingState, selectorCurrentDirAndElements, selectorDataLoaded } from "../storage/selectors";
import { getElementStyle } from "../utils/stylesSelectors";
import { vscode } from "../../ToolsContext";
import { vscodeClient } from "../../vscode-api/client/client";
import { uris } from "../../constants";
import { DirContentDescription } from "../../types/ServerMessage";
import { ClientInitDirMessage } from "../../types/ClientMessage";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = () => {
  const [{ currentDir, elementsList }, setDirInfo] = useState({
    currentDir: undefined,
    elementsList: []
  });
  const [selected, setSelected] = useState(0);
  useEffect(() => {
    console.debug("use effect called");
    
    vscodeClient.sendRequest(uris.initDir, "POST", {}, (data: DirContentDescription) => {
      setDirInfo({
        currentDir: data.currentDir,
        elementsList: data.elementsList
      });
      data.prevDir && setSelected(data.elementsList.findIndex(el => el.name === data.prevDir));
    });
  }, []);

  function sendClientGoToDirMessage(dirName: string) {
    const request: ClientGoToDirMessage = {
      currentDir: currentDir,
      dirName: dirName,
    };
    vscodeClient.sendRequest(uris.goToDir, "POST", request, (data: DirContentDescription) => {
      setDirInfo({
        currentDir: data.currentDir,
        elementsList: data.elementsList
      });
      setSelected(data.prevDir ? data.elementsList.findIndex(el => el.name === data.prevDir) : 0);
    });
  };

  function sendClientOpenFileMessage(fileName: string) {
    const request: ClientOpenFileMessage = {
      currentDir: currentDir,
      fileName: fileName,
    };
    vscodeClient.sendRequest(uris.openFile, "POST", request, (response) => {});
  };

  function onClickElement(index: number) {
    const element = elementsList[index];
    switch (element.type) {
      case "Directory":
        sendClientGoToDirMessage(element.name);
        break;
      case "File":
        sendClientOpenFileMessage(element.name);
        break;
      default:
        console.error(`Unimplemented behaviour for element type ${element.type}`);
        break;
    }
  }

  function onHoverElement(index) {
    setSelected(index);
  };

  const onKeyPressEvent = (event: KeyboardEvent) => {
    if (event.code === "ArrowDown") {
      elementsList ? setSelected((elementsList.length + selected + 1) % elementsList.length) : undefined;
    }
    if (event.code === "ArrowUp") {
      elementsList ? setSelected((elementsList.length + selected - 1) % elementsList.length) : undefined;
    }
    if (event.code === "Enter") {
      onClickElement(selected);
    }
    if (event.code === "Backspace") {
      if (elementsList[0].name === "..") {
        onClickElement(0);
      }
    }
  };
  useEffect(() => {
    window.addEventListener("keydown", onKeyPressEvent);

    return () => {
      window.removeEventListener('keydown', onKeyPressEvent);
    };
  }, [selected, setSelected, currentDir, elementsList]);

  return (
    <div>
      { currentDir ? (<h1>{currentDir}</h1>) : (<h1>Loading...</h1>) }
      <ul>
        {elementsList && elementsList.length > 0 && elementsList.map(
          (elementInfo, index) => {
            const className = getElementStyle(
              elementInfo,
              {
                selected: selected === index,
              }
            );
            return <li
                key={elementInfo.name}
                className={className}
                onClick={() => {
                  onClickElement(index);
                }}
                onMouseEnter={() => {
                  onHoverElement(index);
                }}
              >{elementInfo.name}</li>;
            }
        )}
      </ul>
    </div>
  );
};