export type { AptabaseOptions, TrackErrorOptions } from "./types";
export { AptabaseProvider, useAptabase } from "./context";
import { init, trackEvent, trackError, dispose } from "./track";
export { init, trackEvent, trackError, dispose };

export default { init, trackEvent, trackError, dispose };
