import { ElementInfo, ElementType } from "./types";

export type ServerMessageType = "UpdateCurrentDir" | "GetElementContentInfo";
export type ServerMessagePayloadType = "DirContentDescription" | "ElementContentInfo";

export interface DirectoryInfo {
    elementsList: ElementInfo[];
};

export interface FileInfo {
    data: string;
};

export interface ElementContentInfo extends ElementInfo {
    content: DirectoryInfo | FileInfo;
};

export interface DirContentDescription {
    currentDir: string; // only name, not path
    elementsList: ElementContentInfo[];
    prevDir?: string; // full prev path
};

export interface DirContentExpendedDescription {
    currentDir: string;
    elementsList: ElementContentInfo[];
    prevDir?: string;
};

export interface ServerMessage {
    messageType: ServerMessageType;
    payloadType: ServerMessagePayloadType;
    payload: null | DirContentDescription | ElementContentInfo;
};
