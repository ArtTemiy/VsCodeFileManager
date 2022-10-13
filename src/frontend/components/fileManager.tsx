import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames-ts";

import { ClientElementInfoMessage, ClientGoToDirMessage, ClientMessage, ClientOpenFileMessage } from "../../types/ClientMessage";
import { ElementInfo } from "../../types/ElementInfo";
import { setLoadingState } from "../storage/directorySlice";

import { selecorDataLoadingState, selectorCurrentDirAndElements, selectorDataLoaded } from "../storage/selectors";
import { getElementStyle } from "../utils/stylesSelectors";
import { vscode } from "../../ToolsContext";
import { vscodeClient } from "../../vscode-api/client/client";
import { uris } from "../../constants";
import { DirContentDescription, ElementContentInfo } from "../../types/ServerMessage";
import { ClientInitDirMessage } from "../../types/ClientMessage";

import { FilesList } from "./filesList";
import { Preview } from "./preview";

const defaultNextElementInfo: ElementContentInfo = {
    type: "Directory",
    content: {
        elementsList: [],
    }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesManager = () => {
    const [{ currentDir, elementsList }, setDirInfo] = useState({
        currentDir: undefined,
        elementsList: []
    });
    // const [nextDirElementsList, setNextDirElementsList] = useState([]);
    const [nextElementInfo, setNextElementInfo] = useState(defaultNextElementInfo);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef(null);
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
    useEffect(() => {
        inputRef.current.focus();
        inputRef.current.value = "";
    }, [currentDir]);

    const updateNextElement = useCallback((nextElement: ElementInfo, customCurrentDir?: string) => {
        const usingCurrentDir = customCurrentDir || currentDir;
        if (nextElement === undefined) {
            setNextElementInfo({
                type: "File",
                content: {
                    data: "",
                }
            })
            // setNextDirElementsList([]);
            return;
        }
        const request: ClientElementInfoMessage = {
            currentDir: usingCurrentDir,
            elementName: nextElement.name,
        };
        vscodeClient.sendRequest(uris.elementInfo, "GET", request, (response: ElementContentInfo) => {
            setNextElementInfo(response);
        });
        // if (nextElement.type === "Directory") {
        //     setNextDirElementsList([]);
        // } else {
        //     const request: ClientGoToDirMessage = {
        //         currentDir: usingCurrentDir,
        //         dirName: nextElement.name,
        //     };
        //     vscodeClient.sendRequest(uris.getDirInfo, "GET", request, (response: DirContentDescription) => {
        //         setNextDirElementsList(response.elementsList);
        //     }
        //     );
        // }
    }, [elementsList, setNextElementInfo, currentDir]);

    const sendClientGoToDirMessage = useCallback((dirName: string) => {
        const request: ClientGoToDirMessage = {
            currentDir: currentDir,
            dirName: dirName,
        };
        vscodeClient.sendRequest(uris.goToDir, "POST", request, (data: DirContentDescription) => {
            setDirInfo({
                currentDir: data.currentDir,
                elementsList: data.elementsList
            });
            const selected = data.prevDir ? data.elementsList.findIndex(el => el.name === data.prevDir) : 0;
            setSelected(selected);
            updateNextElement(data.elementsList[selected], data.currentDir);
        });
    }, [setSelected, currentDir, updateNextElement]);

    const sendClientOpenFileMessage = useCallback((fileName: string) => {
        const request: ClientOpenFileMessage = {
            currentDir: currentDir,
            fileName: fileName,
        };
        vscodeClient.sendRequest(uris.openFile, "POST", request, (response) => { });
    }, [currentDir]);

    const onClickElement = useCallback((element: ElementInfo) => {
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
    }, [sendClientGoToDirMessage, sendClientOpenFileMessage]);

    const onFilterUpdateObj = {
        func: (prefix: string) => {}
    };

    return (
        <>
            {currentDir ? (<h1 className={classNames("currentDir")}>{currentDir}</h1>) : (<h1>Loading...</h1>)}
            <input
                    className={classNames()}
                    type="text"
                    placeholder="Find file..."
                    onChange={(event) => {
                        onFilterUpdateObj.func(event.target.value);
                    }}
                    ref={inputRef}
                />
            <div
                className={classNames("fileManager")}
            >
                <FilesList
                    key={currentDir}
                    elementsList={elementsList}
                    active={({
                        onClickElement: onClickElement,
                        updateNextElement: updateNextElement,
                        onFilterUpdateObj: onFilterUpdateObj,
                        selected: selected
                    })}
                />
                {/* <FilesList
                    key={'_' + currentDir}
                    elementsList={nextDirElementsList}
                    active={undefined}
                /> */}
                <Preview
                    {...nextElementInfo}
                />
            </div>
        </>
    );
};
