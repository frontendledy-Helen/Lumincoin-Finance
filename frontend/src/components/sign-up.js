import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";
import config from "../config/config.js";


export class SignUp {
    constructor() {

        //запретим пользователю вернулься на страницу login , если он уже прошел под паролем
        if (AuthUtils.getAuthInfo(AuthUtils.accessTokenKey)) { // если в localStorage уже записаны accessToken
            window.location.hash = '#/dashboard';  // останавливаем Ф и сразу отправляем пользователя на главную страницу
            return;
        }

        this.nameElement = document.getElementById('name'); // найдем инпут email
        this.lastNameElement = document.getElementById('last-name'); // найдем инпут email
        this.emailElement = document.getElementById('email'); // найдем инпут email
        this.passwordElement = document.getElementById('password'); // найдем инпут password
        this.passwordRepeatElement = document.getElementById('password-repeat'); // найдем инпут password
        this.commonErrorElement = document.getElementById('common-error') //сюда вложим message об ошибке


        document.getElementById('process-button').addEventListener('click', this.signUp.bind(this)); // создадим обработчик события по клику, который вызывает метод signUp

    }

    validateForm() {  // метод для проверки полей
        let isValid = true;  // по умолчанию форма наша валидна

        if (this.nameElement.value && this.nameElement.value.match(/^[А-Я][а-я]+\s*$/)) { // если поле не путое
            this.nameElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.nameElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        if (this.lastNameElement.value && this.lastNameElement.value.match(/^[А-Я][а-я]+\s*$/)) { // если поле валидно
            this.lastNameElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.lastNameElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        if (this.emailElement.value && this.emailElement.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { // если поле валидно
            this.emailElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.emailElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        if (this.passwordElement.value && this.passwordElement.value.match(/^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/)) { // если поле валидно
            this.passwordElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.passwordElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        if (this.passwordRepeatElement.value && this.passwordRepeatElement.value === this.passwordElement.value) { // если поле валидно
            this.passwordRepeatElement.classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
        } else { // если поле не заполнено и не прошло требование регулярки
            this.passwordRepeatElement.classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
            isValid = false; // меняем состояние перемнной на false, если после проверки оказались в этом месте
        }

        return isValid; // после проверок переменная isValid примет на себя состояние false или true и вернет это состояние в функцию login() {}
    }


    async signUp() {

        if (this.validateForm()) {  // если isValid не изменился, а остался true - то значение функции вернулось true

            const result = await HttpUtils.request('/signup', 'POST', false, {
                name: this.nameElement.value,
                lastName: this.lastNameElement.value,
                email: this.emailElement.value,
                password: this.passwordElement.value,
                passwordRepeat: this.passwordRepeatElement.value
            });

            // если у нас пришла с бэкенд ошибка, либо нет response:, либо есть response: но там нет accessToken или нет refreshToken или нет id, name
            if (result.error || !result.response) { //если в ответе есть ошибка и нет ответа
                if (result.response && result.response.message === 'User with given email already exist') {
                    this.commonErrorElement.innerText = 'Пользователь с таким E-mail уже зарегистрирован.'
                    return;
                }
                this.commonErrorElement.innerText = 'Не удалось зарегистрировать пользователя. Обратитесь в поддержку.'
                return;
            }


            // AuthUtils.setAuthInfo(result.response.tokens.accessToken, result.response.tokens.refreshToken, {
            //     id: result.response.user.id,
            //     name: result.response.user.name
            // })


            //переводим пользователя на страницу ввода пароля
            window.location.hash = '#/';

        }
    }

}