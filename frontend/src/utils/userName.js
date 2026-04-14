import {AuthUtils} from "./auth-utils.js";
import {Logout} from "../components/logout.js";


export class UserName {


    static getUserName() {
        const authorizedUserElement = document.getElementById('user');
        if (!authorizedUserElement) return;

        const raw = AuthUtils.getAuthInfo(AuthUtils.userTokenKey);
        const user = raw ? JSON.parse(raw) : null;
        const name = user?.name;
        const lastName = user?.lastName;
        authorizedUserElement.innerText = `${name} ${lastName}`;
    }

    static logoutInPage() {
        const logoutElement = document.getElementById('logout');
        if (!logoutElement) return;

        logoutElement.addEventListener('click', this.logoutInPage.bind(this));
        const logout = new Logout();
        logout.logout().then();
        window.location.href = ('#/');
    }

}