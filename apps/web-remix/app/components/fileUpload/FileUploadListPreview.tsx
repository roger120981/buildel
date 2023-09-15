import React, { useCallback } from "react";
import { ItemList } from "~/components/list/ItemList";
import { IFileUpload, IPreviewProps, isUploadError } from "./fileUpload.types";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";

interface FileUploadListPreviewProps extends Omit<IPreviewProps, "remove"> {
  remove?: (id: number) => Promise<void>;
}
export function FileUploadListPreview({
  fileList = [],
  remove,
}: FileUploadListPreviewProps) {
  return (
    <ItemList
      className="flex flex-col items-center gap-1 max-h-[85px] overflow-y-auto"
      itemClassName="w-full"
      items={fileList}
      renderItem={(file) => (
        <FileUploadListItem file={file} onRemove={remove} />
      )}
    />
  );
}

interface FileUploadListItemProps {
  file: IFileUpload;
  onRemove?: (id: number) => Promise<void>;
}
export function FileUploadListItem({
  file,
  onRemove,
}: FileUploadListItemProps) {
  const handleRemove = useCallback(() => {
    onRemove?.(file.id);
  }, [onRemove]);

  return (
    <article
      className={classNames(
        "flex justify-between gap-2 w-full pl-1 pr-2 text-sm hover:bg-neutral-600 transition rounded-sm",
        {
          "text-white": !isUploadError(file),
          "text-red-500": isUploadError(file),
        }
      )}
    >
      <div className="flex items-center gap-1">
        <Icon size="xs" iconName="file" className="mt-0.5" />
        <h6 className="line-clamp-1">{file.file_name}</h6>
      </div>
      {onRemove && <button onClick={handleRemove}>x</button>}
    </article>
  );
}
