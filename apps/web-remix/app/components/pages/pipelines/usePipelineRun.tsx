import { useEffect, useRef, useState } from "react";
import { assert } from "~/utils/assert";
import {
  BuildelRun,
  BuildelRunStatus,
  BuildelSocket,
  BuildelRunStartArgs,
} from "/home/pawel/work/code/buildel/apps/web-remix/node_modules/.pnpm/file+..+..+packages+buildel+dist/node_modules/dist/index";

export function usePipelineRun(
  organizationId: number,
  pipelineId: number,
  onBlockOutput: (
    blockId: string,
    outputName: string,
    payload: unknown
  ) => void = () => { },
  onBlockStatusChange: (blockId: string, isWorking: boolean) => void = () => { },
  onBlockError: (blockId: string, errors: string[]) => void,
  onError: (error: string) => void,
  useAuth: boolean = true
) {
  const buildel = useRef<BuildelSocket>();
  const run = useRef<BuildelRun>();

  const [status, setStatus] = useState<BuildelRunStatus>("idle");

  const startRun = async (args: BuildelRunStartArgs) => {
    assert(run.current);
    await run.current.start(args);
  };
  const stopRun = async () => {
    assert(run.current);
    await run.current.stop();
  };
  const push = (topic: string, payload: any) => {
    assert(run.current);
    run.current.push(topic, payload);
  };

  useEffect(() => {
    buildel.current = new BuildelSocket(organizationId, {
      socketUrl: "/super-api/socket",
      useAuth,
    });
    buildel.current.connect().then((buildel) => {
      run.current = buildel.run(pipelineId, {
        onBlockOutput,
        onBlockStatusChange,
        onStatusChange: setStatus,
        onBlockError: onBlockError,
        onError: onError,
      });
    });
    return () => {
      if (!buildel.current) return;
      buildel.current.disconnect();
    };
  }, []);

  return {
    status,
    startRun,
    stopRun,
    push,
  };
}
