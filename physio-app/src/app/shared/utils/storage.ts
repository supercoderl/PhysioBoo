export class LocalStorage {
    static save(key: string, value: any): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(
                key,
                typeof value === "string" ? value : JSON.stringify(value)
            );
        }
    }

    static load<T>(key: string): T | null {
        if (typeof window !== 'undefined' && window.localStorage) {
            const value = window.localStorage.getItem(key);
            if (!value) return null;
        
            try {
                return JSON.parse(value);
            } catch {
                return value as unknown as T;
            }
        }
        return null;
    }

    static remove(key: string): void {
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
        }
    }
}