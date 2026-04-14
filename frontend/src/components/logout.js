import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";
import config from "../config/config.js";

export class Logout {
    constructor() {
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;
        }
        this.logout().then(); // вызов Ф logout(), !!! срабатывает Promis без .then(), в .then() ничего не передаем, просто чтобы убрать уведомление
    }

    async logout() {
        await HttpUtils.request('/logout', 'POST', false, {
            refreshToken: AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey), // отправляем на бекенд refreshToken который у нас сохранен в localStorage
        });

        AuthUtils.removeAuthInfo(); // разлогинем пользователя
    }
}