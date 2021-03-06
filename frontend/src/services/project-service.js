import { inject } from 'aurelia-framework';
import { ApiService } from './api-service';
import { UserModel } from '~/models/user-model';

@inject(ApiService)
export class ProjectService {

    constructor(api) {
        this.http = api.http;
    }

    createProject(project) {
        return this.http.post('projects', project)
            .then(res => this.toJson(res.response));
    }

    getProjects() {
        return this.http.get('projects')
            .then(res => this.toJson(res.response));
    }

    getProject(id) {
        return this.http.get(`projects/${id}`)
            .then(res => this.toJson(res.response));
    }

    getUsers(projectId) {
        return this.http.get(`projects/${projectId}/users`)
            .then(res => this.toJson(res.response).map(x => new UserModel(x)));
    }

    deleteProject(id) {
        return this.http.delete(`projects/${id}`)
            .then(res => this.toJson(res.response));
    }

    updateProject(project) {
        return this.http.put(`projects/${project._id}`, project);
    }

    toJson(data) {
        return JSON.parse(data);
    }
}
