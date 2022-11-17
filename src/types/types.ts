export type ElementType = "File" | "Directory" | "Symlink" | "Unknown";

export interface ElementInfo {
    name: string;
    type: ElementType;
};

export interface Element {
    dir: string;
    name: string;
}