import { ElementType } from "../../types/types";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FolderIcon = () => (<i className="codicon codicon-folder"></i>);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const FileIcon = () => (<i className="codicon codicon-symbol-file"></i>);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SymlinkIcon = () => (<i className="codicon codicon-link-external"></i>);
// eslint-disable-next-line @typescript-eslint/naming-convention
export const UnknownIcon = () => (<i className="codicon codicon-circle-large-outline"></i>);

export const getIcon = (type: ElementType) => {
    switch (type) {
        case "Directory":
            return (<FolderIcon/>);
        case "File":
            return (<FileIcon/>);
        case "Symlink":
            return (<SymlinkIcon/>);
        case "Unknown":
        default:
            return (<UnknownIcon/>);
    }
};
