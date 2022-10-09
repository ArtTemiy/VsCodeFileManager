import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { ClientGoToDirMessage, ClientMessage, ClientOpenFileMessage } from "../../types/ClientMessage";
import { ElementInfo } from "../../types/ElementInfo";
import { setLoadingState } from "../storage/directorySlice";

import { selecorDataLoadingState, selectorCurrentDirAndElements, selectorDataLoaded } from "../storage/selectors";
import { getElementStyle } from "../utils/stylesSelectors";
import { vscode } from "../../ToolsContext";
import { vscodeClient } from "../../vscode-api/client/client";
import { LVL_UP_DIR, uris } from "../../constants";
import { DirContentDescription } from "../../types/ServerMessage";
import { ClientInitDirMessage } from "../../types/ClientMessage";

import classNames from "classnames-ts";

interface Props {
  elementsList: ElementInfo[];
  active?: {
    onClickElement: (index: number) => void;
    updateNextList: (index: number) => void;
    selected: number;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = ({elementsList, active}: Props) => {
  const [selected, setSelected] = useState(active ? active.selected : undefined);
  
  const setSelectedWithUpdate = useCallback((index: number) => {
    active.updateNextList(index);
    setSelected(index);
  }, [setSelected]);

  function onHoverElement(index) {
    setSelectedWithUpdate(index);
  };
  if (active !== undefined) {

    const onKeyPressEvent = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {        
        elementsList && setSelectedWithUpdate((elementsList.length + selected + 1) % elementsList.length);
      }
      if (event.code === "ArrowUp") {
        elementsList && setSelectedWithUpdate((elementsList.length + selected - 1) % elementsList.length);
      }
      if (event.code === "Enter") {
        active.onClickElement(selected);
      }
      if (event.code === "Backspace") {
        if (elementsList[0].name === LVL_UP_DIR) {
          active.onClickElement(0);
        }
      }
    };
    useEffect(() => {
      window.addEventListener("keydown", onKeyPressEvent);

      return () => {
        window.removeEventListener('keydown', onKeyPressEvent);
      };
    });
  }

  const getElementProps = (elementInfo : ElementInfo, index: number) => {
    return active ? {
      onClick: () => {
        active.onClickElement(index);
      },
      onMouseEnter: () => {
        onHoverElement(index);
      },
    } : {};
  };

  return (
    <div className={classNames("filesList", "col-2")}>
      <ul>
        {elementsList && elementsList.length > 0 && elementsList.map(
          (elementInfo, index) => {
            const className = getElementStyle(
              elementInfo,
              active && {
                selected: selected === index,
              }
            );
            return <li
                key={elementInfo.name}
                className={className}
                {...getElementProps(elementInfo, index)}
              >{elementInfo.name}</li>;
            }
        )}
      </ul>
    </div>
  );
};