import React, { useCallback, useEffect, useRef, useState } from "react";
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
    onClickElement: (element: ElementInfo) => void;
    updateNextList: (nextElement: ElementInfo) => void;
    selected: number;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = ({elementsList, active}: Props) => {
  const [selected, setSelected] = useState(active ? active.selected : undefined);
  const [filteredElementList, setFilteredElementList] = useState(elementsList);

  const setSelectedWithUpdate = useCallback((index: number, newElementsList?: ElementInfo[]) => {
    const usingElementsList = newElementsList || filteredElementList;
    active.updateNextList(usingElementsList[index]);
    setSelected(index);
  }, [setSelected, filteredElementList]);
  const inputRef = useRef(null);

  function onHoverElement(index) {
    setSelectedWithUpdate(index);
  };

  if (active !== undefined) {
    const onKeyPressEvent = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {        
        filteredElementList && setSelectedWithUpdate((filteredElementList.length + selected + 1) % filteredElementList.length);
      }
      if (event.code === "ArrowUp") {
        filteredElementList && setSelectedWithUpdate((filteredElementList.length + selected - 1) % filteredElementList.length);
      }
      if (event.code === "ArrowLeft") {
        if (filteredElementList[0].name === LVL_UP_DIR) {
          active.onClickElement(filteredElementList[0]);
        }
      }
      if (event.code === "ArrowRight" && filteredElementList[selected].name !== LVL_UP_DIR ||
          event.code === "Enter") {
        active.onClickElement(filteredElementList[selected]);
      }
    };

    useEffect(() => {
      window.addEventListener("keydown", onKeyPressEvent);
      // console.log(elementsList, filteredElementList[selected], selected, filteredElementList, Boolean(filteredElementList));
      
      // filteredElementList && filteredElementList.length > 0 && active.updateNextList(filteredElementList[selected]);
      inputRef.current.focus();
      return () => {
        window.removeEventListener('keydown', onKeyPressEvent);
      };
    });
  }

  const getElementProps = (element : ElementInfo, index: number) => {
    return active ? {
      onClick: () => {
        active.onClickElement(element);
      },
      onMouseEnter: () => {
        onHoverElement(index);
      },
    } : {};
  };

  const onInputChangeCallback = (prefix: string) => {
    console.log(`onInputChange called ${active}`);
    const newElementsList = elementsList.filter((value: ElementInfo) => value.name.startsWith(prefix));
    setFilteredElementList(newElementsList);
    setSelectedWithUpdate(0, newElementsList);
  };

  // TODO: BUG?
  const filesToDraw = active ? filteredElementList : elementsList;
  
  return (
    <div className={classNames("filesList", "col-2")}>
      <input
        className={classNames()}
        type="text"
        placeholder={active ? "Find file..." : ""}
        onChange={(event) => {
            onInputChangeCallback(event.target.value);
        }}
        readOnly={!Boolean(active)}
        ref={inputRef}
      />
      <ul>
        {filesToDraw && filesToDraw.length > 0 && filesToDraw.map(
          (element, index) => {
            const className = getElementStyle(
              element,
              active && {
                selected: selected === index,
              }
            );
            return <li
                key={element.name}
                className={className}
                {...getElementProps(element, index)}
              >{element.name}</li>;
            }
        )}
      </ul>
    </div>
  );
};