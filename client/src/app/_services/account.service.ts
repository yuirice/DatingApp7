import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { User } from '../_models/user';
import { environment } from 'src/environments/environment';
import { MembersService } from './members.service';



@Injectable({
  providedIn: 'root'
})
export class AccountService {
  baseUrl = environment.apiUrl;
  private currentUserSource = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSource.asObservable();

  // private logoutEvent = new EventEmitter<void>();
  // logoutEvent$ = this.logoutEvent.asObservable();

  constructor(private http: HttpClient) { }

  login(model: any) {
    //localStorage.clear();
    return this.http.post<User>(this.baseUrl + 'account/login', model).pipe(
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    )
  }

  register(model: any){


      return this.http.post<User>(this.baseUrl + 'account/register', model).pipe(
         map(user => {
           if(user){
             this.setCurrentUser(user);
           }
         })
      )
  }

  setCurrentUser(user: User) {
    user.roles = [];
    const roles = this.getDecodedToken(user.token).role;
    Array.isArray(roles) ? user.roles = roles : user.roles.push(roles);
    localStorage.setItem('user',JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  logout() {
    //localStorage.clear();
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
    // this.logoutEvent.emit(); // Emit the event
  }

  getDecodedToken(token: string){
    return JSON.parse(atob(token.split('.')[1]));
  }
}
