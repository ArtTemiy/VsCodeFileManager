import classnames from "classnames-ts/src/classNames";

interface Props {
    content: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const FileContent = ({ content }: Props) => {
    return (
        <div className={classnames("file-content-holder", "col-2")}>
            <span className={classnames("file-content")}>
                {content}
            </span>
        </div>
    );
};
