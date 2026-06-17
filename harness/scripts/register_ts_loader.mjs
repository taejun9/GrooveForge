import { register } from "node:module";

register(new URL("./ts_extension_loader.mjs", import.meta.url));
