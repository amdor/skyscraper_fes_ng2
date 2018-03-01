import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {AppState} from './reducers/index';
import {Store} from '@ngrx/store';
import {AuthLoadedAction, SignInStatusChange} from './actions';

declare const gapi: any;

@Injectable()
export class GoogleAuthResolver implements Resolve<any> {
    clientId = '498731538493-etubco5p4at0chs18tuqmqmm8g3ngtr1.apps.googleusercontent.com';
    auth2: any;

    constructor(private store: Store<AppState>) {
    }

    resolve(route: ActivatedRouteSnapshot,
            state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
        console.log('resolver ' + gapi);
        return gapi.load('auth2', () => {
            gapi.auth2.init({
                client_id: this.clientId,
            }).then(
                (auth2) => {
                    // smaking them global
                    this.auth2 = auth2;
                    this.store.dispatch(new AuthLoadedAction(this.auth2));
                    const currentUser = auth2.currentUser.get();
                    this.store.dispatch(new SignInStatusChange(currentUser.isSignedIn()));
                    this.auth2.isSignedIn.listen((isSignedIn) => {
                        this.store.dispatch(new SignInStatusChange(isSignedIn));
                    });
                },
                (err) => {
                    console.log('Failed to initialize auth object ' + err);
                }
            );
        });
    }
}