import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Observable, of } from 'rxjs';
import { User } from '../_models/user';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MembersService } from '../_services/members.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  model: any = {};


  constructor(public accountService: AccountService  ,private router: Router, private toastr:ToastrService) { }
  ngOnInit(): void {

 }
// constructor( public membersService: MembersService,public accountService: AccountService , private router: Router, private toastr:ToastrService) {

// }


  login() {
    this.accountService.login(this.model).subscribe({
      next: _ => {
       //const newMemberService = new MembersService();
       this.router.navigateByUrl('/members').then( _ => {
          window.location.reload();
       });
       //this.router.navigate(['/members']);
      }
    })
  }

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
