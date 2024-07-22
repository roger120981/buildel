import { Download } from 'lucide-react';

import { ItemList } from '~/components/list/ItemList';

interface FileOutputProps {
  files: Blob[];
}

export const FileOutput: React.FC<FileOutputProps> = ({ files }) => {
  return (
    <ItemList
      className="flex flex-col items-center gap-1 overflow-y-auto"
      itemClassName="w-full"
      items={files.map((file, index) => ({ id: index, file }))}
      renderItem={(file) => <FileOutputListItem file={file} />}
    />
  );
};

interface FileOutputListItemProps {
  file: { id: number; file: Blob };
}
export function FileOutputListItem({ file }: FileOutputListItemProps) {
  return (
    <article
      data-tooltip-id={`${file.id}`}
      className="flex justify-between gap-2 w-full py-1 px-2 bg-muted transition rounded-md cursor-default text-foreground items-center"
    >
      <div className="flex gap-1 grow max-w-[90%]">
        <div className="flex flex-col w-full max-w-[95%]">
          <h6 className="whitespace-nowrap text-xs truncate">
            {'foo file name'}
          </h6>
        </div>
      </div>
      <DownloadButton blob={file.file} />
    </article>
  );
}

function DownloadButton({ blob }: { blob: Blob }) {
  const downloadFile = () => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={downloadFile}>
      <Download className="w-3.5 h-3.5" />
    </button>
  );
}
