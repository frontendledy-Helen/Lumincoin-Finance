import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class EditOutlayGroups {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        const id = this.getIdFromHash()
        if (!id) {
            window.location.hash = '#/outlay-groups';
            return;
        }

        this.originalTitle = '';

        this.inputGroupElement = document.getElementById('choice-group');
        this.getEditGroup(id).then();


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
        const result = await HttpUtils.request('/categories/expense/' + encodeURIComponent(id), 'GET', true);

        if (result.error) {
            alert('Не удалось отредактировать категорию. Обратитесь в поддержку.');
            window.location.hash = '#/outlay-groups';
            return;
        }
        const oldTitle = result.response.title;
        this.originalTitle = String(oldTitle ?? '').trim();
        this.inputGroupElement.value = this.originalTitle;
    }

    async updateCategory() {
        const id = this.getIdFromHash();

        if (!id) {
            window.location.hash = '#/outlay-groups';
            return;
        }

        const newValue = this.inputGroupElement.value.trim();

        if (newValue) { // если поле не путое
            this.inputGroupElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено
            this.inputGroupElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            return; // isValid = false; // меняем состояние переменной на false, если после проверки оказались в этом месте
        }

        if (newValue === this.originalTitle) {
            window.location.hash = '#/outlay-groups';
            return;
        }

        const result = await HttpUtils.request('/categories/expense/' + encodeURIComponent(id), 'PUT', true, {
            title: newValue
        });

        if (result.error) {
            alert('Не удалось изменить категорию. Обратитесь в поддержку.');
            window.location.hash = '#/outlay-groups';
            return;
        }
        window.location.hash = '#/outlay-groups';
    }
}





