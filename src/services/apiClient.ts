type ApiError = {
    error?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, '');

const toAbsoluteUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(toAbsoluteUrl(path), {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const data = (await response.json()) as ApiError;
            if (data?.error) message = data.error;
        } catch {
            // Ignore JSON parse errors
        }
        throw new Error(message);
    }

    return (await response.json()) as T;
};

export const apiPost = async <T, B = unknown>(path: string, body: B): Promise<T> => {
    return apiFetch<T>(path, {
        method: "POST",
        body: JSON.stringify(body),
    });
};
