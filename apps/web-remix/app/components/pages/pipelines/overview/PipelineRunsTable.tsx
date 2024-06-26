import React, { useMemo } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  IPipelineRun,
  IPipelineRuns,
} from "~/components/pages/pipelines/pipeline.types";
import { Indicator } from "@elpassion/taco";
import { dayjs } from "~/utils/Dayjs";
import { EmptyMessage } from "~/components/list/ItemList";
import { StopRunForm } from "~/components/pages/pipelines/overview/StopRunForm";
import { routes } from "~/utils/routes.utils";
import { IconButton } from "~/components/iconButton";
import { Link } from "@remix-run/react";
import { Tooltip } from "~/components/tooltip/Tooltip";

interface PipelineRunsTableProps {
  data: IPipelineRuns;
  pipelineId: string;
  organizationId: string;
}

const columnHelper = createColumnHelper<IPipelineRun>();

export const PipelineRunsTable: React.FC<PipelineRunsTableProps> = ({
  data,
  pipelineId,
  organizationId,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("created_at", {
        header: "Date",
        id: "created_at",
        cell: (info) => dayjs(info.getValue()).format("DD MMM HH:mm"),
      }),
      columnHelper.accessor("status", {
        id: "status",
        cell: (info) => (
          <Indicator
            type={info.getValue() !== "finished" ? "warning" : "success"}
            variant="badge"
            text={info.getValue()}
          />
        ),
        header: "Status",
      }),
      columnHelper.accessor("costs", {
        header: "Run costs ($)",
        id: "costs",
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.amount), 0)
            .toFixed(10),
      }),
      columnHelper.accessor("costs", {
        header: "Input tokens",
        id: "input_tokens",
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.input_tokens), 0),
      }),
      columnHelper.accessor("costs", {
        header: "Output tokens",
        id: "output_tokens",
        cell: (info) =>
          info
            .getValue()
            .reduce((acc, curr) => acc + Number(curr.data.output_tokens), 0),
      }),

      columnHelper.accessor("status", {
        header: "",
        id: "action",
        maxSize: 20,
        cell: (info) => {
          const id = info.row.original.id;
          return (
            <div className="flex gap-3 items-center justify-end">
              {info.getValue() === "running" ? <StopRunForm id={id} /> : null}

              <Link
                id={`run-link-${id}`}
                to={routes.pipelineRun(organizationId, pipelineId, id)}
              >
                <IconButton
                  tabIndex={-1}
                  aria-label="Go to run overview"
                  iconName="external-link"
                  size="xs"
                  onlyIcon
                />
              </Link>

              <Tooltip
                offset={17}
                anchorSelect={`#run-link-${id}`}
                content="Go to run overview"
                place="top"
              />
            </div>
          );
        },
      }),
    ],
    []
  );

  const tableData = useMemo(() => {
    return data;
  }, [data]);

  const table = useReactTable({
    columns,
    data: tableData,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full">
      <thead className="text-left text-white text-xs bg-neutral-800">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="rounded-xl overflow-hidden">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="py-3 px-5 first:rounded-tl-lg first:rounded-bl-lg last:rounded-tr-lg last:rounded-br-lg"
              >
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
              </th>
            ))}
          </tr>
        ))}
      </thead>

      <tbody>
        {data.length === 0 ? (
          <tr>
            <td className="py-2 mx-auto">
              <EmptyMessage>There are no pipeline runs...</EmptyMessage>
            </td>
          </tr>
        ) : null}
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className="[&:not(:first-child)]:border-t border-neutral-800"
            aria-label="pipeline run"
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="py-3 px-5 text-neutral-100 text-sm">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
