import { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames-ts";

import { ClientElementInfoMessage, ClientGoToDirMessage, ClientOpenFileMessage, ClientResolveSymlinkType } from "../../types/ClientMessage";
import { Element, ElementInfo, ElementType } from "../../types/types";

import { vscodeClient } from "../../vscode-api/client/client";
import { uris } from "../../constants";
import { DirContentDescription, DirContentExpendedDescription, ElementContentInfo } from "../../types/ServerMessage";

import { FilesList } from "./filesList";
import { Preview } from "./preview";

const EMPTY_ELEMENT_INFO: ElementContentInfo = {
    name: "",
    type: "File",
    content: {
        data: "",
    }
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FilesManager = () => {
    const [dirInfo, setDirInfo] = useState<{
        currentDir: string,
        elementsList: ElementContentInfo[],
        filteredElementList: ElementContentInfo[],
    }>({
        currentDir: undefined,
        elementsList: [],
        filteredElementList: [],
    });
    const { currentDir, elementsList, filteredElementList } = dirInfo;
    const [nextElementInfo, setNextElementInfo] = useState<ElementContentInfo>(EMPTY_ELEMENT_INFO);
    const [selected, setSelected] = useState<number>(0);
    const inputRef = useRef(null);
    const updateNextElement = useCallback((element: ElementContentInfo) => {
        setNextElementInfo(element);
    }, [setNextElementInfo]);

    const goToDir = useCallback((dirName: string) => {
        const goToDirRequest: ClientGoToDirMessage = {
            dir: currentDir,
            name: dirName,
            expended: true
        };
        vscodeClient.sendRequest(uris.goToDir, "POST", goToDirRequest, (data: DirContentDescription) => {
            setDirInfo({
                currentDir: data.currentDir,
                elementsList: data.elementsList,
                filteredElementList: data.elementsList,
            });
            const selected = data.prevDir ? data.elementsList.findIndex(el => el.name === data.prevDir) : 0;
            setSelected(selected);
            updateNextElement(data.elementsList[selected]);
        });

    }, [setSelected, currentDir, updateNextElement]);

    const sendClientOpenFileMessage = useCallback((fileName: string) => {
        const request: ClientOpenFileMessage = {
            dir: currentDir,
            name: fileName,
        };
        vscodeClient.sendRequest(uris.openFile, "POST", request, (_: any) => { });
    }, [currentDir]);

    const processSymlink = useCallback((fileName: string) => {
        const request: ClientResolveSymlinkType = {
            dir: currentDir,
            name: fileName,
        };
        vscodeClient.sendRequest(uris.resolveSymlinkType, "GET", request, (response: ElementType) => {
            switch (response) {
                case "Directory":
                    goToDir(fileName);
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
                goToDir(element.name);
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
    }, [goToDir, sendClientOpenFileMessage]);

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
            data.prevDir && updateNextElement(data.elementsList[selectedIndex]);
        });
    }, []);
    useEffect(() => {
        inputRef.current.focus();
        inputRef.current.value = "";
    }, [currentDir]);

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
