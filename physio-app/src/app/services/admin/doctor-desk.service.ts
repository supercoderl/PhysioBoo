import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { delay } from "rxjs/operators";
import { DoctorDeskSnapshot } from "../../shared/types/doctor-desk.types";

/**
 * Placeholder API base — swap for the real endpoint once the backend ships.
 * Keep this as the only place that knows about the wire format.
 */
const DOCTOR_DESK_SNAPSHOT_URL = '/api/doctor-desk/snapshot';

const MOCK_SNAPSHOT: DoctorDeskSnapshot = {
    context: {
        doctorName: 'Sarah Johnson',
        avatarUrl: null,
        department: 'General Practice',
        room: 'Counter 3',
        shift: 'Morning Shift · 08:00–14:00',
        isOnline: true,
    },
    patients: [
        {
            id: '1', queueNumber: 'A025', name: 'John Smith', age: 45, gender: 'Male',
            reason: 'Chest pain and shortness of breath', appointmentTime: '09:15', arrivalTime: '09:11',
            status: 'waiting', priority: 'urgent', allergies: ['Penicillin'],
            vitals: { bloodPressure: '145/92', heartRate: 98, temperature: 37.4, spo2: 96 },
        },
        {
            id: '2', queueNumber: 'A026', name: 'Maria Garcia', age: 32, gender: 'Female',
            reason: 'Regular checkup and blood pressure monitoring', appointmentTime: '09:30', arrivalTime: '09:28',
            status: 'waiting', priority: 'normal', allergies: [],
            vitals: { bloodPressure: '118/76', heartRate: 72, temperature: 36.7, spo2: 99 },
        },
        {
            id: '3', queueNumber: 'A027', name: 'David Lee', age: 28, gender: 'Male',
            reason: 'Persistent cough for 2 weeks', appointmentTime: '09:45', arrivalTime: '09:50',
            status: 'waiting', priority: 'normal', allergies: ['Sulfa drugs'],
        },
        {
            id: '4', queueNumber: 'A028', name: 'Emily Brown', age: 55, gender: 'Female',
            reason: 'Diabetes follow-up consultation', appointmentTime: '10:00', arrivalTime: '09:57',
            status: 'waiting', priority: 'normal', allergies: [],
        },
        {
            id: '5', queueNumber: 'A029', name: 'James Wilson', age: 38, gender: 'Male',
            reason: 'Severe migraine headache', appointmentTime: '10:15', arrivalTime: '10:09',
            status: 'waiting', priority: 'urgent', allergies: [],
        },
        {
            id: '6', queueNumber: 'A023', name: 'Lisa Anderson', age: 42, gender: 'Female',
            reason: 'Annual physical examination', appointmentTime: '08:45', arrivalTime: '08:40',
            status: 'completed', priority: 'normal', allergies: [],
        },
        {
            id: '7', queueNumber: 'A024', name: 'Robert Taylor', age: 50, gender: 'Male',
            reason: 'Back pain treatment', appointmentTime: '09:00', arrivalTime: '08:55',
            status: 'completed', priority: 'normal', allergies: ['Latex'],
        },
    ],
};

@Injectable({ providedIn: 'root' })
export class DoctorDeskService {
    /**
     * Returns the doctor's current desk snapshot (doctor context + queue).
     * Currently backed by mock data; swap the body for a real HTTP call to
     * `DOCTOR_DESK_SNAPSHOT_URL` once the endpoint exists — callers already
     * consume it as an Observable<DoctorDeskSnapshot>, so no UI changes needed.
     */
    getSnapshot(): Observable<DoctorDeskSnapshot> {
        return of(MOCK_SNAPSHOT).pipe(delay(250));
    }
}
