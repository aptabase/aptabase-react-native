export type { AptabaseOptions } from "./types";
export { AptabaseProvider, useAptabase } from "./context";
import { init, trackEvent, dispose } from "./track";
export { init, trackEvent, dispose };

export default { init, trackEvent, dispose };
