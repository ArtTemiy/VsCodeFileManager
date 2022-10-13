import { ElementInfo, ElementType } from "./ElementInfo";

export type ServerMessageType = "UpdateCurrentDir" | "GetElementContentInfo";
export type ServerMessagePayloadType = "DirContentDescription" | "ElementContentInfo";

export interface DirContentDescription {
    currentDir: string;
    elementsList: ElementInfo[];
    prevDir?: string;
};

export interface DirectoryInfo {
    elementsList: ElementInfo[];
};

export interface FileInfo {
    data: string;
};

export interface ElementContentInfo {
    type: ElementType,
    content: DirectoryInfo | FileInfo;
};

export interface ServerMessage {
    messageType: ServerMessageType;
    payloadType: ServerMessagePayloadType;
    payload: null | DirContentDescription | ElementContentInfo;
};
