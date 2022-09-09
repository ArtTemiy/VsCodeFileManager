import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { ClientMessage } from "../types/ClientMessage";
import { ElementInfo } from "../types/ElementInfo";

import { selectorCurrentDirAndElements } from "../storage/selectors";
import { getElementStyle } from "../utils/stylesSelectors";
import { vscode } from "./ToolsContext";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = () => {
  const { currentDir, elementsList } = useSelector(selectorCurrentDirAndElements);
  const [selected, setSelected] = useState(0);

  function sendClientGoToDirMessage(dirName: string) {
    const message: ClientMessage = {
      type: "GoToDir",
      payload: {
        currentDir: currentDir,
        dirName: dirName,
      }
    };
    vscode.postMessage(message);
  };

  function sendClientOpenFileMessage(fileName: string) {
    const message: ClientMessage = {
      type: "OpenFile",
      payload: {
        currentDir: currentDir,
        fileName: fileName,
      }
    };
    vscode.postMessage(message);
  };


  function onClickElement(index: number) {
    const element = elementsList[index];
    switch (element.type) {
      case "Directory":
        sendClientGoToDirMessage(element.name);
        setSelected(0);
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
      elementsList ? setSelected(Math.min(selected + 1, elementsList.length)) : undefined;
    }
    if (event.code === "ArrowUp") {
      elementsList ? setSelected(Math.max(selected - 1, 0)) : undefined;
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