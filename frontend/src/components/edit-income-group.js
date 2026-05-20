import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class EditIncomeGroups {

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

        this.originalTitle = '';

        this.inputGroupElement = document.getElementById('choice-group');
        this.getEditGroup(id).then();
        // this.inputGroupElement = null;

        document.getElementById('update-button').addEventListener('click', this.updateCategory.bind(this));

    }

    getIdFromHash() {
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('id');
    }

    async getEditGroup(id) {
        const result = await HttpUtils.request('/categories/income/' + encodeURIComponent(id), 'GET', true);

        if (result.error) {
            alert('Не удалось отредактировать категорию. Обратитесь в поддержку.');
            window.location.hash = '#/income-groups';
            return;
        }
        const oldTitle = result.response.title;
        this.originalTitle = String(oldTitle ?? '').trim();
        this.inputGroupElement.value = this.originalTitle;
    }

    async updateCategory() {
        const id = this.getIdFromHash();

        if (!id) {
            window.location.hash = '#/income-groups';
            return;
        }

        const newValue = this.inputGroupElement.value.trim();

        if (!newValue) {
            alert('Поле не заполнено');
            return;
        }

        if (newValue === this.originalTitle) {
            window.location.hash = '#/income-groups';
            return;
        }

        const result = await HttpUtils.request('/categories/income/' + encodeURIComponent(id), 'PUT', true, {
            title: newValue
        });

        if (result.error) {
            alert('Не удалось изменить категорию. Обратитесь в поддержку.');
            window.location.hash = '#/income-groups';
            return;
        }
        window.location.hash = '#/income-groups';
    }
}




