import React, { useCallback, useEffect, useState } from "react";

import { ElementInfo } from "../../types/types";

import { getElementStyle } from "../utils/stylesSelectors";
import { LVL_UP_DIR } from "../../constants";

import classNames from "classnames-ts";
import { getIcon } from "../icons/icons";

interface Props {
  elementsList: ElementInfo[];
  active?: {
    onClickElement: (element: ElementInfo) => void;
    updateNextElement: (nextElement: ElementInfo) => void;
    selected: number;
  }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesList = ({elementsList, active}: Props) => {
  const [selected, setSelected] = useState<number | undefined>(active?.selected);

  const setSelectedWithUpdate = useCallback((index: number, newElementsList?: ElementInfo[]) => {
    const usingElementsList = newElementsList || elementsList;
    active.updateNextElement(usingElementsList[index]);
    setSelected(index);
  }, [setSelected, elementsList]);

  function onHoverElement(index) {
    setSelectedWithUpdate(index);
  };

  if (active !== undefined) {
    const onKeyPressEvent = (event: KeyboardEvent) => {
      if (event.code === "ArrowDown") {     
        event.preventDefault();   
        elementsList && setSelectedWithUpdate((elementsList.length + selected + 1) % elementsList.length);
      }
      if (event.code === "ArrowUp") {
        event.preventDefault();
        elementsList && setSelectedWithUpdate((elementsList.length + selected - 1) % elementsList.length);
      }
      if (event.code === "ArrowLeft") {
        if (elementsList[0].name === LVL_UP_DIR) {
          active.onClickElement(elementsList[0]);
        }
      }
      if (event.code === "ArrowRight" && elementsList[selected].name !== LVL_UP_DIR ||
          event.code === "Enter") {
        active.onClickElement(elementsList[selected]);
      }
    };

    useEffect(() => {
      window.addEventListener("keydown", onKeyPressEvent);
      return () => {
        window.removeEventListener('keydown', onKeyPressEvent);
      };
    });
    useEffect(() => {
      setSelected(0);
    }, [elementsList]);
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
  
  return (
    <div className={classNames("filesList", "col-2")}>
      <ul>
        {elementsList && elementsList.length > 0 && elementsList.map(
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
              >{getIcon(element.type)} {element.name}</li>;
            }
        )}
      </ul>
    </div>
  );
};