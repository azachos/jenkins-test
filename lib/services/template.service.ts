import { Injectable } from '@angular/core';

import { ApiClient } from '../api-client';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {

  constructor(private apiClient: ApiClient) { }

  getSomeData() {
    // return this.apiClient.get<{}>(...);
  }

}
