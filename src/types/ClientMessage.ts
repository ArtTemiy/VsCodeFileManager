export type ClientMessageType = "InitDir" | "GoToDir" | "OpenFile";

export interface ClientInitDirMessage {}

export interface ClientGoToDirMessage {
    currentDir: string;
    dirName: string;
};

export interface ClientOpenFileMessage {
    currentDir: string;
    fileName: string;
};

export interface ClientResolveSymlinkType {
    currentDir: string;
    fileName: string;
};

export interface ClientMessage {
    type: ClientMessageType;
    payload: null | ClientInitDirMessage | ClientGoToDirMessage | ClientOpenFileMessage;
};

export interface ClientElementInfoMessage {
    currentDir: string;
    elementName: string;
};
