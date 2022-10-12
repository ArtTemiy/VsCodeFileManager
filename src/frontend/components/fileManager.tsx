import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames-ts";

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

import { FilesList } from "./filesList";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesManager = () => {
    const [{ currentDir, elementsList }, setDirInfo] = useState({
        currentDir: undefined,
        elementsList: []
    });
    const [nextDirElementsList, setNextDirElementsList] = useState([]);
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

    const updateNextList = useCallback((nextElement: ElementInfo, customCurrentDir?: string) => {
        const usingCurrentDir = customCurrentDir || currentDir;
        if (nextElement === undefined) {
            setNextDirElementsList([]);
            return;
        }
        if (nextElement.type !== "Directory") {
            setNextDirElementsList([]);
        } else {
            const request: ClientGoToDirMessage = {
                currentDir: usingCurrentDir,
                dirName: nextElement.name,
            };
            vscodeClient.sendRequest(uris.getDirInfo, "GET", request, (response: DirContentDescription) => {
                setNextDirElementsList(response.elementsList);
            }
            );
        }
    }, [elementsList, setNextDirElementsList, currentDir]);

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
            updateNextList(data.elementsList[selected], data.currentDir);
        });
    }, [setSelected, currentDir, updateNextList]);

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

    return (
        <>
            {currentDir ? (<h1 className={classNames("currentDir")}>{currentDir}</h1>) : (<h1>Loading...</h1>)}
            <div
                className={classNames("fileManager")}
            >
                <FilesList
                    key={currentDir}
                    elementsList={elementsList}
                    active={({
                        onClickElement: onClickElement,
                        updateNextList: updateNextList,
                        selected: selected
                    })}
                />
                <FilesList
                    key={'_' + currentDir}
                    elementsList={nextDirElementsList}
                    active={undefined}
                />
            </div>
        </>
    );
};
