import { DirectoryInfo, ElementContentInfo, FileInfo } from "../../types/ServerMessage";
import { FileContent } from "./fileContent";
import { FilesList } from "./filesList";

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Preview = ( { type, content }: ElementContentInfo) => {
    return (
        <>
            {type === "Directory" &&
                <FilesList
                    elementsList={(content as DirectoryInfo).elementsList}
                    active={undefined}
                />
            }
            {type === "File" &&
                <FileContent content={(content as FileInfo).data}/>
            }
        </>
    );
};
