import React, { useCallback } from "react";
import { Button, Textarea } from "@elpassion/taco";
import { IBlockConfig, IField } from "../pipeline.types";
import {
  FileListResponse,
  FileResponse,
} from "~/components/pages/pipelines/contracts";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from "../RunPipelineProvider";

interface NodeFieldsProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsForm({ fields, block }: NodeFieldsProps) {
  const blockName = block.name;
  const { status, organizationId, pipelineId } = useRunPipeline();
  const { push, clearEvents } = useRunPipelineNode(block);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearEvents(blockName);

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};

      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }

      Object.keys(fieldsData).forEach((key) => {
        const topic = `${blockName}:${key}`;
        if (Array.isArray(fieldsData[key])) {
          fieldsData[key].forEach((value: any) => {
            push(topic, value);
          });
        } else {
          push(topic, fieldsData[key]);
        }
      });
    },
    [blockName, clearEvents, push]
  );

  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", `${pipelineId}_${blockName}`);

    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories`,
      {
        body: formData,
        method: "POST",
      }
    ).then((res) => res.json());

    return FileResponse.parse(response);
  }, []);

  const removeField = useCallback(async (id: number) => {
    return fetch(`/super-api/organizations/${organizationId}/memories/${id}`, {
      method: "DELETE",
    });
  }, []);

  const fetchFiles = useCallback(async () => {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories?collection_name=${pipelineId}_${blockName}`
    ).then((res) => res.json());

    return FileListResponse.parse(response);
  }, []);

  const renderInput = useCallback(
    (field: IField) => {
      const { type, name } = field.data;

      if (type === "text") {
        return (
          <Textarea
            label=""
            id={name}
            name={name}
            placeholder="Start writing..."
          />
        );
      } else if (type === "file") {
        return (
          <FileUpload
            name={name}
            onUpload={uploadFile}
            onFetch={fetchFiles}
            onRemove={removeField}
            preview={(props) => <FileUploadListPreview {...props} />}
          />
        );
      } else if (field.data.type === "audio") {
        return (
          <>
            <p>Audio input</p>
            {/*<AudioInput name={name} />*/}
          </>
        );
      }

      return <span>Unsupported input type - {type}</span>;
    },
    [fetchFiles, removeField, uploadFile]
  );

  return (
    <form onSubmit={onSubmit}>
      {fields.map((field) => (
        <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
      ))}

      <Button
        type="submit"
        size="xs"
        disabled={status !== "running"}
        className="mt-2"
        isFluid
      >
        {status === "running" ? "Send" : "Start pipeline"}
      </Button>
    </form>
  );
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === "text") {
        return (
          <Textarea
            key={field.data.name}
            id={field.data.name}
            label=""
            value={getTextFieldsMessages(events, field.data.name)}
            className="w-full"
            rows={5}
            disabled
          />
        );
      } else if (type === "audio") {
        return (
          <>
            <p>Audio output</p>
          </>
        );
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events]
  );

  return <div>{fields.map((field) => renderOutput(field))}</div>;
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
