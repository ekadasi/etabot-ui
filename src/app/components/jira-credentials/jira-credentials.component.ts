import { Component, OnInit } from '@angular/core';
import { TermsConditionsFullComponent } from '../register-page/terms-conditions-full/terms-conditions-full.component';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { JiraService } from '../../services/jira.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-jira-credentials',
  templateUrl: './jira-credentials.component.html',
  styleUrls: ['./jira-credentials.component.css']
})

export class JiraCredentialsComponent implements OnInit{
  model: any = {};
    username: string;
    team: string;
  type: 'JIRA';
  error: boolean;
  loading: boolean;
  error_message: string;
  constructor(
    public dialog: MatDialog,
    private titleService: Title,
    private jiraService: JiraService,
    private router: Router) {
    this.team = ".atlassian.net";
    if (localStorage.getItem('username'))
          this.username = localStorage.getItem('username');
  }

  ngOnInit() {
    this.titleService.setTitle('JIRA Credentials');
    this.error = false;
    this.loading = false;
  }

  openDialog(): void {
    let dialogRef = this.dialog.open(TermsConditionsFullComponent, {
      width: '800px',
      height: '500px',
    });
  }

  jira() {
    this.loading = true;
    this.jiraService.jira(this.username, this.model.jira_url, this.model.email, this.model.password)
    .subscribe(
      success => {
        this.loading = false;
        this.router.navigate(['/projects']);
      },
      error => {
        this.error_message = error;
        if (String(error.status) === '400') {
            if (error._body.includes('Unauthorized (401)')) {
                this.error_message = 'Wrong combination of username/email and password. Please correct and try again.';
            } else {
                if (error._body.includes('already exists for this user')) {
                    this.error_message = 'This username and team name already exist in your account. \
Please enter another one or edit your existing one in projects screen.';
                } else {
                    this.error_message = 'Bad request (4xx) - Cannot connnect to https://'
                        + this.model.jira_url + '.atlassian.net - please check\
                        all inputs and try again. If the issue persists, please report the issue to \
                        hello@etabot.ai';
                }
            }
        }
        console.log(error);
        this.loading = false;
        this.error = true;
      }
      );
  }
}
