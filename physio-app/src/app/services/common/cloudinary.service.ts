import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class CloudinaryService {
    private cloudName = environment.CLOUDINARY.NAME;
    private uploadPreset = environment.CLOUDINARY.PRESET;

    constructor(private http: HttpClient) { }

    uploadImage(file: File, folder: string): Observable<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', folder);
        formData.append('tags', 'temporary');

        return this.http.post(
            `https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`,
            formData
        );
    }
}