import { FormGroup } from '@angular/forms';

export const randomText = (length: number = 8): string => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const randomEmail = (): string => {
    return `${randomText(6).toLowerCase()}@example.com`;
};

export const randomPhone = (): string => {
    return `+84${Math.floor(100000000 + Math.random() * 900000000)}`;
};

export const autoFillForm = (form: FormGroup, overrides: Record<string, any> = {}): void => {
    const patchData: Record<string, any> = {};

    Object.keys(form.controls).forEach(key => {
        if (overrides.hasOwnProperty(key)) {
            patchData[key] = overrides[key];
            return;
        }

        const lowerKey = key.toLowerCase();

        if (lowerKey.includes('email')) {
            patchData[key] = randomEmail();
        }
        else if (lowerKey.includes('phone') || lowerKey.includes('mobile')) {
            patchData[key] = randomPhone();
        }
        else if (lowerKey.includes('date') || lowerKey.includes('dob')) {
            patchData[key] = '1990-01-01';
        }
        else if (lowerKey.includes('agree') || lowerKey.includes('accept') || lowerKey.includes('terms')) {
            patchData[key] = true;
        }
        else if (lowerKey.includes('amount') || lowerKey.includes('income') || lowerKey.includes('number')) {
            patchData[key] = Math.floor(Math.random() * 100000);
        }
        else if (lowerKey.includes('id')) {
            patchData[key] = `ID-${randomText(4).toUpperCase()}`;
        }
        else {
            patchData[key] = randomText(7);
        }
    });

    form.patchValue(patchData);
};