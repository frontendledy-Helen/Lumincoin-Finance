import {HttpUtils} from "../utils/http-utils.js";
import {AuthUtils} from "../utils/auth-utils.js";
import config from "../config/config.js";

export class Login {

    constructor() {

        this.emailElement = document.getElementById('email'); // найдем инпут email
        this.passwordElement = document.getElementById('password'); // найдем инпут password
        this.rememberMeElement = document.getElementById('inlineFormCheck'); // найдем чекбокс "запомнить меня"
        this.commonErrorElement = document.getElementById('common-error'); // найдем элемент - сообщение об ошибке

        document.getElementById('process-button').addEventListener('click', this.login.bind(this)); // создадим обработчик события по клику, который вызывает метод login

       document.getElementById('in-signup').addEventListener('click', () => {
           window.location.hash = '#/signup';
       })
    }

    validateForm() {  // метод для проверки полей
        let isValid = true;  // по умолчанию форма наша валидна


        if (this.emailElement.value && this.emailElement.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { // если поле валидно
            this.emailElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.emailElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        if (this.passwordElement.value) { // если поле валидно
            this.passwordElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.passwordElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        return isValid; // после проверок переменная isValid примет на себя состояние false или true и вернет это состояние в функцию login() {}
    }

    async login() {

        if (this.validateForm()) {  // если isValid не изменился, а остался true - то значение функции вернулось true

            const result = await HttpUtils.request('/login', 'POST', false, {
                email: this.emailElement.value,
                password: this.passwordElement.value,
                rememberMe: false
            });

           // если у нас пришла с бэкенд ошибка, либо нет response:, либо есть response: но там нет accessToken или нет refreshToken или нет id, name
            if (!result.response) { //если в ответе есть ошибка и нет ответа
                this.commonErrorElement.innerText = 'Не удалось получить ответ. Обратитесь в поддержку.'
                return;
            }

            if (result.error || (result.response && (!result.response.tokens.accessToken || !result.response.tokens.refreshToken || !result.response.user.id || !result.response.user.name))) {
                this.commonErrorElement.innerText = 'Неправильный E-mail или пароль.'
                return;
            }

            AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
                id: result.response.user.id,
                name: result.response.user.name,
                lastName: result.response.user.lastName
            })

            // если пользователь найден сохраняем его данные с бэкенда сюда
            // это обрабатываем в файле utils/auth-utils.js
            // localStorage.setItem('accessToken', result.response.tokens.accessToken);
            // localStorage.setItem('refreshToken', result.response.tokens.refreshToken);
            //localStorage.setItem('userInfo', JSON.stringify({name: result.response.user.name, lastName: result.response.user.lastName}));

            //переводим пользователя на главную страницу
            window.location.hash = '#/dashboard'; //

            //this.openRoute('#/'); //унивесальный метод перехода на новую страницу без перезагрузки страницы (метод описан на странице router.js)
        }
    }

}
