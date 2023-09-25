import React from "react";
import { Button, Icon } from "@elpassion/taco";
import { useRunPipeline } from "./RunPipelineProvider";
import { PlayFilled } from "~/icons/PlayFilled";
import { errorToast } from "~/components/toasts/errorToast";

interface RunPipelineButtonProps {
  isUpToDate: boolean;
}
export const RunPipelineButton: React.FC<RunPipelineButtonProps> = ({
  isUpToDate,
}) => {
  const { status, stopRun, startRun, isValid } = useRunPipeline();

  const handleRun = () => {
    if (!isValid) {
      errorToast({
        title: "Invalid workflow",
        description:
          "We couldn’t run the workflow due to errors in some of your blocks. Please check the highlighted blocks.",
      });
    } else if (!isUpToDate) {
      errorToast({
        title: "Unsaved changes",
        description:
          "You have unsaved changes in your workflow. Please save them before running the workflow again.",
      });
    } else if (status === "idle") {
      startRun();
    } else {
      stopRun();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleRun}
        size="sm"
        rightIcon={
          status === "idle" ? <PlayFilled /> : <Icon iconName="stop-circle" />
        }
      >
        {status === "idle" ? "Run" : "Stop"}
      </Button>
    </div>
  );
};
