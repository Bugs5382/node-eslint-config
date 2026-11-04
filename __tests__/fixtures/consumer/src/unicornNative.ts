import { readFileSync } from "fs";

/** Reads a file through the bare "fs" specifier. */
export const read = (file: string): string => readFileSync(file, "utf8");
