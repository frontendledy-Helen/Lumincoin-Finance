import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class CreatOutlayGroup {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        this.inputGroupElement = document.getElementById('input-group');
        this.createOutlayGroupElement = document.getElementById('create-input-group');
        this.createOutlayGroupElement.addEventListener('click', this.createOutlayGroup.bind(this));


    }

    async createOutlayGroup() {

        const newValue = this.inputGroupElement.value.trim();

        if (newValue) { //если в инпут введена новая категория

            this.inputGroupElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено
            this.inputGroupElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            return;
        }

        const result = await HttpUtils.request('/categories/expense', 'POST', true, {
            title: this.inputGroupElement.value
        });

        if (!result.response) {
            return alert('Не удалось создать новую категорию');
        }

        if (result.error && result.response.message === 'This record already exists') {
            return alert('Данная категория уже присутствует в вашем списке категорий');
        }

        if (result.response && result.response.id && result.response.title) {
            localStorage.setItem('create-outlay-group', JSON.stringify({
                id: result.response.id,
                title: result.response.title
            }));
            window.location.hash = '#/outlay-groups';
        }
    }
}