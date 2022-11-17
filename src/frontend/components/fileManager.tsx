import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames-ts";

import { ClientElementInfoMessage, ClientGoToDirMessage, ClientOpenFileMessage, ClientResolveSymlinkType } from "../../types/ClientMessage";
import { ElementInfo, ElementType } from "../../types/ElementInfo";

import { vscodeClient } from "../../vscode-api/client/client";
import { uris } from "../../constants";
import { DirContentDescription, ElementContentInfo } from "../../types/ServerMessage";

import { FilesList } from "./filesList";
import { Preview } from "./preview";


// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesManager = () => {
    const [dirInfo, setDirInfo] = useState<{
        currentDir: string,
        elementsList: ElementInfo[],
        filteredElementList: ElementInfo[],
    }>({
        currentDir: undefined,
        elementsList: [],
        filteredElementList: [],
    });
    const { currentDir, elementsList, filteredElementList } = dirInfo;
    const [nextElementInfo, setNextElementInfo] = useState<ElementContentInfo>({
        type: "Directory",
        content: {
            elementsList: [],
        }
    });
    const [selected, setSelected] = useState<number>(0);
    const inputRef = useRef(null);

    const updateNextElement = useCallback((nextElement: ElementInfo, customCurrentDir?: string) => {
        const usingCurrentDir = customCurrentDir || currentDir;
        if (nextElement === undefined) {
            setNextElementInfo({
                type: "File",
                content: {
                    data: "",
                }
            });
            return;
        }
        const request: ClientElementInfoMessage = {
            currentDir: usingCurrentDir,
            elementName: nextElement.name,
        };
        vscodeClient.sendRequest(uris.elementInfo, "GET", request, (response: ElementContentInfo) => {
            setNextElementInfo(response);
        });
    }, [elementsList, setNextElementInfo, currentDir]);

    const sendClientGoToDirMessage = useCallback((dirName: string) => {
        const request: ClientGoToDirMessage = {
            currentDir: currentDir,
            dirName: dirName,
        };
        vscodeClient.sendRequest(uris.goToDir, "POST", request, (data: DirContentDescription) => {
            setDirInfo({
                currentDir: data.currentDir,
                elementsList: data.elementsList,
                filteredElementList: data.elementsList,
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
        vscodeClient.sendRequest(uris.openFile, "POST", request, (response: any) => { });
    }, [currentDir]);

    const processSymlink = useCallback((fileName: string) => {
        const request: ClientResolveSymlinkType = {
            currentDir: currentDir,
            fileName: fileName,
        };
        vscodeClient.sendRequest(uris.resolveSymlinkType, "GET", request, (response: ElementType) => {
            switch (response) {
                case "Directory":
                    sendClientGoToDirMessage(fileName);
                    break;
                case "File":
                    sendClientOpenFileMessage(fileName);
                    break;
                default:
                    console.error("Could't resolve symlink for file", {fileName, currentDir, response});
                    break;
            }
        });
    }, [currentDir]);

    const onClickElement = useCallback((element: ElementInfo) => {
        switch (element.type) {
            case "Directory":
                sendClientGoToDirMessage(element.name);
                break;
            case "File":
                sendClientOpenFileMessage(element.name);
                break;
            case "Symlink":
                processSymlink(element.name);
            default:
                console.error(`Unimplemented behaviour for element type ${element.type}`);
                break;
        }
    }, [sendClientGoToDirMessage, sendClientOpenFileMessage]);

    useEffect(() => {
        console.debug("use effect called");

        vscodeClient.sendRequest(uris.initDir, "POST", {}, (data: DirContentDescription) => {
            setDirInfo({
                currentDir: data.currentDir,
                elementsList: data.elementsList,
                filteredElementList: data.elementsList,
            });
            const selectedIndex = data.elementsList.findIndex(el => el.name === data.prevDir);
            data.prevDir && setSelected(selectedIndex);
            data.prevDir && updateNextElement(data.elementsList[selectedIndex], data.currentDir);
        });
    }, []);
    useEffect(() => {
        inputRef.current.focus();
        inputRef.current.value = "";
    }, [currentDir]);

    const onFilterUpdateObj = {
        func: (prefix: string) => {}
    };
    const onFilterUpdate = useCallback((prefix: string) => {
        const newFilteredElementList = elementsList.filter((value: ElementInfo) => value.name.toLowerCase().startsWith(prefix.toLowerCase()));
        console.log(prefix, newFilteredElementList);
        setDirInfo({
            ...dirInfo,
            filteredElementList: newFilteredElementList,
        });
        setSelected(0);
    }, [elementsList, setSelected, setDirInfo, dirInfo]);
    
    return (
        <>
            {currentDir ? (<h1 className={classNames("currentDir")}>{currentDir}</h1>) : (<h1>Loading...</h1>)}
            <input
                    className={classNames()}
                    type="text"
                    placeholder="Find file..."
                    onChange={(event) => {
                        onFilterUpdate(event.target.value);
                    }}
                    ref={inputRef}
                />
            <div
                className={classNames("fileManager")}
            >
                <FilesList
                    key={currentDir}
                    elementsList={filteredElementList}
                    active={{
                        onClickElement: onClickElement,
                        updateNextElement: updateNextElement,
                        selected: selected
                    }}
                />
                <Preview
                    {...nextElementInfo}
                />
            </div>
        </>
    );
};
