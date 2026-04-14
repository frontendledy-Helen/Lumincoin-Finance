// здесь класс для странички dashboard.html
// вызывать экземпляр класса будем в router.js в объекте массива routes, под load: () => new Dashboard()

import {AuthUtils} from "../utils/auth-utils.js";
import {UserName} from "../utils/userName.js";

export class Dashboard {
    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        this.logoutElement = document.getElementById('logout');
        this.logoutElement.addEventListener('click', this.goOutside.bind(this));

        UserName.getUserName()

    }

    goOutside() {
        UserName.logoutInPage()
    }

}
