export type LogArg = unknown;

export interface BufferedLogEntry {
  t: number;
  ns: string;
  msg: LogArg;
  args: LogArg[];
}
