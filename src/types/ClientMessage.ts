import { Element } from "./types";

export type ClientMessageType = "InitDir" | "GoToDir" | "OpenFile";

export interface ClientInitDirMessage {}

export interface ClientGoToDirMessage extends Element {
    expended?: boolean;
};

export interface ClientOpenFileMessage extends Element {};

export interface ClientResolveSymlinkType extends Element {};

export interface ClientMessage {
    type: ClientMessageType;
    payload: null | ClientInitDirMessage | ClientGoToDirMessage | ClientOpenFileMessage;
};

export interface ClientElementInfoMessage extends Element {};
