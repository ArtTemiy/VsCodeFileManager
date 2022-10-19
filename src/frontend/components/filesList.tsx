import React, { useCallback, useEffect, useState } from "react";

import { ElementInfo } from "../../types/ElementInfo";

import { getElementStyle } from "../utils/stylesSelectors";
import { LVL_UP_DIR } from "../../constants";

import classNames from "classnames-ts";

interface Props {
  elementsList: ElementInfo[];
  active?: {
    onClickElement: (element: ElementInfo) => void;
    updateNextElement: (nextElement: ElementInfo) => void;
    onFilterUpdateObj: { func: (prefix: string) => void };
    selected: number;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = ({elementsList, active}: Props) => {
  const [selected, setSelected] = useState(active ? active.selected : undefined);
  const [filteredElementList, setFilteredElementList] = useState(elementsList);

  const setSelectedWithUpdate = useCallback((index: number, newElementsList?: ElementInfo[]) => {
    const usingElementsList = newElementsList || filteredElementList;
    active.updateNextElement(usingElementsList[index]);
    setSelected(index);
  }, [setSelected, filteredElementList]);

  function onHoverElement(index) {
    setSelectedWithUpdate(index);
  };

  if (active !== undefined) {
    const onKeyPressEvent = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {     
        event.preventDefault();   
        filteredElementList && setSelectedWithUpdate((filteredElementList.length + selected + 1) % filteredElementList.length);
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
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
      return () => {
        window.removeEventListener('keydown', onKeyPressEvent);
      };
    });

    const onInputChangeCallback = (prefix: string) => {
      const newElementsList = elementsList.filter((value: ElementInfo) => value.name.startsWith(prefix));
      setFilteredElementList(newElementsList);
      setSelectedWithUpdate(0, newElementsList);
    };
    active.onFilterUpdateObj.func = onInputChangeCallback;
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

  const filesToDraw = active ? filteredElementList : elementsList;
  
  return (
    <div className={classNames("filesList", "col-2")}>
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