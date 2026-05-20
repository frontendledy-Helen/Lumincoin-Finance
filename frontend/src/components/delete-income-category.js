import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class DeleteIncomeCategory {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        const id = this.getIdFromHash()
        if (!id) {
            window.location.hash = '#/income-groups';
            return;
        }

        this.deleteIncomeGroup(id).then();

    }

    getIdFromHash() {
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('id');
    }

    async deleteIncomeGroup(id) {
        const result = await HttpUtils.request('/categories/income/' + encodeURIComponent(id), 'DELETE', true);

        if (result.error) {
            alert('Не удалось удалить категорию. Обратитесь в поддержку.');
            window.location.hash = '#/income-groups';
            return;
        }

        window.location.hash = '#/income-groups';
    }
}




