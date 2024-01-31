import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Member } from '../_models/member';
import { map, of, take } from 'rxjs';
import { PaginatedResult } from '../_models/pagination';
import { UserParams } from '../_models/userParams';
import { AccountService } from './account.service';
import { User } from '../_models/user';

@Injectable({
  providedIn: 'root'
})
export class MembersService {
 baseUrl = environment.apiUrl;
 members: Member[] = [];
 memberCache = new Map();
 user: User | undefined;
 userParams: UserParams | undefined;

  constructor(private http: HttpClient, private accountService: AccountService) {
   this.accountService.currentUser$.pipe(take(1)).subscribe({
      next: user =>{
        if(user){
          console.log(this.userParams)
          this.userParams = new UserParams(user)
          this.user = user
        }
      }
    })
    // this.accountService.logoutEvent$.subscribe(() => {
    //       this.clearCaches(); // Clear caches on logout
    //   });
  }

  // clearCaches() {
  //   this.memberCache.clear();
  //   this.userParams = undefined;
  //   console.log(this.memberCache)
  //   // You can add more cache clearing logic here if needed
  // }

  getUserParams(){
    return this.userParams;
  }

  setUserParams(params: UserParams){
    this.userParams = params;
  }

  resetUserParams(){
    if(this.user){
     this.userParams = new UserParams(this.user);
     return this.userParams;
    }
    return;
  }

 getMembers(userParams: UserParams){
  const response = this.memberCache.get(Object.values(userParams).join('-'));

  if(response) return of(response);

  let params = this.getPaginationHeaders(userParams.pageNumber, userParams.pageSize);
   params = params.append('minAge', userParams.minAge);
   params = params.append('maxAge', userParams.maxAge);
   params = params.append('gender', userParams.gender);
   params = params.append('orderBy', userParams.orderBy);

  return this.getPaginatedResult<Member[]>(this.baseUrl + 'users', params).pipe(
   map(response => {
     this.memberCache.set(Object.values(userParams).join('-'), response);
     return response;
   })
  );
 }

 getMember(username: string){
  const member = [...this.memberCache.values()]
  .reduce((arr,elem) => arr.concat(elem.result),[])
  .find((member: Member) => member.userName === username);

  if(member) return of(member);
  return this.http.get<Member>(this.baseUrl + 'users/' + username);
}

 updateMember(member: Member){
    return this.http.put(this.baseUrl + 'users', member).pipe(
     map(_ => {
        const index = this.members.indexOf(member);
        this.members[index] = {...this.members[index], ...this.members[index]};
     })
   );
 }

 setMainPhoto(photoId: number){
   return this.http.put(this.baseUrl + 'users/set-main-photo/' + photoId, {});
 }

 deletePhoto(photoId: number){
   return this.http.delete(this.baseUrl + 'users/delete-photo/' + photoId);
 }

 addLike(username: string){
  return this.http.post(this.baseUrl + 'likes/' + username,{})
}

 getLikes(predicate: string, pageNumber: number, pageSize: number){
   let params = this.getPaginationHeaders(pageNumber, pageSize);

   params = params.append('predicate', predicate);

   return this.getPaginatedResult<Member[]>(this.baseUrl + 'likes', params);
 }

private getPaginatedResult<T>(url: string, params: HttpParams) {
    const paginatedResult: PaginatedResult<T> = new PaginatedResult<T>;
    return this.http.get<T>(url, { observe: 'response', params }).pipe(
      map(response => {
        if (response.body) {
          paginatedResult.result = response.body;
        }
        const pagination = response.headers.get('pagination');
        if (pagination) {
          paginatedResult.pagination = JSON.parse(pagination);
        }
        return paginatedResult;
      })
    );
  }

  private getPaginationHeaders(pageNumber: number, pageSize: number) {
    let params = new HttpParams();

      params = params.append('pageNumber', pageNumber);
      params = params.append('pageSize', pageSize);

    return params;
  }
}
