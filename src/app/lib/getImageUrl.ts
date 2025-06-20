import { BASE_URL, UPLOADS_URL } from "./config";

export function getImageUrl(path?: string): string {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) {
        return `${BASE_URL}${path}`;
    }
    return `${UPLOADS_URL}/${path}`;
}
