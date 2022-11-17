import { ElementInfo } from "../../types/types";

export interface ElementStyleAttrs {
    selected?: boolean;
}

export function getElementStyle(info: ElementInfo, attrs?: ElementStyleAttrs): string {
    let classes = ["element"];
    switch (info.type) {
        case "File":
            classes.push("element-t-file");
            break;
        case "Directory":
            classes.push("element-t-dir");
            break;
        case "Symlink":
            classes.push("element-t-symlink");
            break;
        default:
            break;
    }
    if (attrs?.selected) {
        classes.push("element-selected");
    }

    return classes.join(' ');
}
