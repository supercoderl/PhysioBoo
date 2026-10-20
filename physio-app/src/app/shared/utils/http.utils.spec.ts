import { GENERIC_PUBLIC_FAILURE, describePublicFailure } from './http.utils';

describe('describePublicFailure', () => {
    beforeEach(() => spyOn(console, 'error'));

    it('treats no response as a retryable network failure', () => {
        expect(describePublicFailure({ status: 0 }, 't')).toEqual(jasmine.objectContaining({ kind: 'network', retryable: true }));
    });

    it('treats 503 as a retryable unavailable service without leaking server detail', () => {
        const f = describePublicFailure({ status: 503, error: { errors: ['The public website is not configured yet.'] } }, 't');
        expect(f.kind).toBe('unavailable');
        expect(f.retryable).toBeTrue();
        expect(f.description).not.toContain('configured');
    });

    it('does not offer retry for rejected requests', () => {
        expect(describePublicFailure({ status: 400 }, 't')).toEqual(jasmine.objectContaining({ kind: 'rejected', retryable: false }));
    });

    it('falls back to the generic failure for other statuses', () => {
        expect(describePublicFailure({ status: 500 }, 't')).toBe(GENERIC_PUBLIC_FAILURE);
    });
});
