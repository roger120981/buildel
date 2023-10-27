import { useMemo } from "react";
import startCase from "lodash.startcase";
import { Handle, Position } from "reactflow";
import { IHandle } from "../pipeline.types";
import classNames from "classnames";

interface HandleProps {
  handle: IHandle;
  index: number;
  isConnectable?: boolean;
}

export function InputHandle({
  handle,
  index,
  isConnectable = true,
}: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-[1px] !bg-primary-500";
      case "audio":
      case "file":
        return "!rounded-full !bg-primary-500";
    }
  }, [handle.data.type]);

  return (
    <>
      <span
        className="absolute right-full -translate-y-[15%] -translate-x-[12px] text-[10px] text-white"
        style={{ top: (index + 1) * 25 }}
      >
        {startCase(handle.data.name.replace(/_input/g, " "))}
      </span>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Left}
        style={{ top: (index + 1) * 25 }}
        isConnectable={isConnectable}
        id={handle.id}
        className={classNames(
          "!border-1 !border-primary-500 !w-[10px] !h-[10px] !-translate-x-[50%]",
          handleTypeClassName
        )}
      />
    </>
  );
}

export function OutputHandle({ handle, index, isConnectable }: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case "text":
        return "!rounded-[1px] !bg-secondary-500";
      case "audio":
      case "file":
        return "!rounded-full !bg-secondary-500";
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className="absolute left-full -translate-y-[15%] translate-x-[12px] text-xxs text-white"
        style={{ top: (index + 1) * 25 }}
      >
        {startCase(handle.data.name.replace(/_output/g, " "))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ top: (index + 1) * 25 }}
        id={handle.id}
        data-name={handle.data.name}
        className={classNames(
          "!border-1 !border-secondary-500 !w-[10px] !h-[10px] !translate-x-[40%]",
          handleTypeClassName
        )}
      />
    </>
  );
}