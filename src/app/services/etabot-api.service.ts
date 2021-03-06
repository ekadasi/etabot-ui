import { Injectable, Output, EventEmitter } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { map } from 'rxjs/operators';
// import {Observable} from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { AuthService } from './auth-service.service';

@Injectable()
export class EtabotApiService {

  public loginCheck = false;
  private token: string;
  @Output() projects: EventEmitter<any> = new EventEmitter();
  @Output() projectsReceived: EventEmitter<boolean> = new EventEmitter();

  constructor(
      private http: Http,
      private authService: AuthService) {
    // depending on the environment (e.g. production or local) api end point could be different
    // this.service_api_end_point = environment.apiUrl;

    authService.getLoggedIn.subscribe(
        response => this.logInChange(response));
   }

   logInChange(response) {
     this.loginCheck = true;
     console.log('logInChange response: ' + response);
     console.log('authService.token: ' + this.authService.token);
   }


   get_real_projects() {

     return this.http.get(environment.apiUrl + 'projects/', this.authService.construct_options())
       .subscribe((response: Response) => {
         if (response.status === 200) {
           const res = response.json();
          // Object.entries(res).forEach(
          //     ([key, value]) => {
          //         // value['velocities'] = value['velocities']['mean'];
          //         console.log(typeof(value['velocities']) + value['velocities']);
          //         console.log(typeof(value['work_hours']) + value['work_hours']);
          //         // console.log(key + typeof(JSON.parse(value['velocities'].replace("'","\""))));
          //     });
           console.log(
               'get_real_projects 200 response status: '
               + response.status
               + 'json: '
               + JSON.stringify(res));
           this.projects.emit(res);
           this.projectsReceived.emit(true);
           return true;
         } else {
           console.log('get_real_projects non-200 response status ' + response.status);
           return false;
         }
       });
   }

  estimate(project) {
    let url = environment.apiUrl + 'estimate/';
    if (project.project_tms_id != null) {
        url = url + '?tms=' + project.project_tms_id;
        if (project.id != null) {
            url = url + '&project_id=' + project.id;
        }
    }
    console.log('url: ' + url);
    const json_params = JSON.stringify(
        {params:
            {
                include_active_sprints: project.include_active_sprints,
                include_future_sprints: project.include_future_sprints,
                include_backlog: project.include_backlog
            }
        });
    console.log('json_params: ' + json_params);
    return this.http.post(
        url,
        json_params,
        this.authService.construct_options()).pipe(
            map((response: Response) => {
              console.log('Response: ' + Response);
              project['eta_in_progress'] = false;
              if (String(response.status) === '201') {
                  console.log('estimate get returns 201');
                  return true;
              } else {
                console.log('estimate get returns not 201');
                return false;
              }

             })).subscribe(
                success => {
                    console.log('estimate success');
                    project['error_message'] = null;
                    project['last_updated'] = Date.now();
                    project['result_message'] = 'ETAs update started!';
                },
                error => {
                    console.log('estimate error' + error);
                    project['error_message'] = error;
                    project['eta_in_progress'] = false;
                    project['result_message'] = null;
                }
            );
  }

}

