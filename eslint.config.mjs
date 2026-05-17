import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [{ ignores: ["hologram-pdf-extension/lib/**"] }, ...nextCoreWebVitals, ...nextTypescript];

export default eslintConfig;
