import classNames from "classnames-ts";
import { uris } from "../../constants";
import { DirContentDescription } from "../../types/ServerMessage";
import { vscodeClient } from "../../vscode-api/client/client";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const PathString = (props: {path: string, goToDirResponseCallback: (data: DirContentDescription) => void}) => {
    const { path, goToDirResponseCallback } = props;
    const directoriesList = path === '/' ? ['/'] : path.split('/').map(dir => dir || '/');

    const goToDir = (index: number) => {
        const path = '/' + directoriesList.slice(1, index + 1).join('/');
        vscodeClient.sendRequest(uris.goToDirAbs, "POST", path, goToDirResponseCallback);
    };

    return (
        <div className={classNames("currentDir")}>
            {directoriesList.map((dir: string, ind: number) => (<button
                key={ind}
                className={classNames("path-button")}
                onClick={() => goToDir(ind)}>
                    {dir}
                </button>))}
        </div>
    );
};
