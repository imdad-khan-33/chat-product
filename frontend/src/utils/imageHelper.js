export const getProfileImage = (user, defaultImage) => {
    if (!user?.userImage) return defaultImage;

    const imgPath = user.userImage;

    // Handle external URLs (Google Auth, etc.)
    if (imgPath.startsWith("http") || imgPath.startsWith("https")) {
        return imgPath;
    }

    // Handle local paths
    // 1. Normalize slashes
    let cleanPath = imgPath.replace(/\\/g, "/");

    // 2. Remove "public" prefix if it still exists (legacy data)
    //    Matches "public/", "./public/" at the start, case-insensitive
    cleanPath = cleanPath.replace(/^(\.?\/)?public\//i, "");

    // 3. Ensure leading slash
    if (!cleanPath.startsWith("/")) {
        cleanPath = "/" + cleanPath;
    }

    // 4. Construct Full URL
    // Get Origin from env or fallback
    let baseUrl = import.meta.env.VITE_API_BASE_URL;
    if (!baseUrl) {
        baseUrl = "http://localhost:8000";
    } else {
        try {
            const urlObj = new URL(baseUrl);
            baseUrl = urlObj.origin;
        } catch (e) {
            console.warn("Invalid API Base URL", e);
        }
    }

    return `${baseUrl}${cleanPath}`;
};
