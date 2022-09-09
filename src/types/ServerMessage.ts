import { ElementInfo } from "./ElementInfo";

export type ServerMessageType = "UpdateCurrentDir";
export type ServerMessagePayloadType = "DirContentDescription";

export interface DirContentDescription {
    currentDir: string;
    elementsList: ElementInfo[];
}

export interface ServerMessage {
    messageType: ServerMessageType;
    payloadType: ServerMessagePayloadType;
    payload: null | DirContentDescription;
}