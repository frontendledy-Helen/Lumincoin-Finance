import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class CreateNewTransaction {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        this.typeNewElement = document.getElementById('type');
        this.categoryNewElement = document.getElementById('category');
        this.amountNewElement = document.getElementById('amount');
        this.dateNewElement = document.getElementById('date');
        this.commentNewElement = document.getElementById('comment');

        document.getElementById('saveButton').addEventListener('click', this.saveNewCategoryCell.bind(this)); //на кнопку навешан обработчик события клика и сработает метод saveNewCategoryCell

        // при смене типа — новый список категорий
        this.typeNewElement.addEventListener('change', () => {
            this.loadCategories(this.typeNewElement.value).then();
        });

        const typeFromUrl = this.getTypeFromHash(); // достанем тип из URL (доход или расход)
        if (!typeFromUrl) {
            window.location.hash = '#/transactions';
            return;
        }

        // выставить тип из URL (?type=income)
        this.typeNewElement.value = typeFromUrl; //подставляет его в селект (в constructor);
        this.loadCategories(typeFromUrl).then();  // по найденному типу тянет категории с API.

    }

    getTypeFromHash() {
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('type');
    }

    async loadCategories(type) {  // запрашивает нужный список с бэкенда и передаёт его в fillCategorySelect, который рисует <option> в селекте.

        //опередлим адрес запроса на бекенд, всех категорий дохода или расхода, в зависимости от того какая категория попала в url
        const url = type === 'income' // если тип - доход
            ? '/categories/income' // то запишем в адрес запроса на бэкенд /categories/income
            : '/categories/expense'; // иначе запишем в адрес запроса на бэкенд /categories/expense

        const result = await HttpUtils.request(url); //запрос с бэкенда категорий по нужному url
        if (result.error || !Array.isArray(result.response)) {
            return alert('Ошибка загрузки категорий');
        }

        console.log(result.response)
        this.fillCategorySelect(result.response); // заполнение селекта с полученными категориями с бэкенда
    }

    fillCategorySelect(categories) { // categories = result.response (id и title)
        this.categoryNewElement.innerHTML =
            '<option value="" disabled selected>Выберите категорию...</option>'; //удаляем старые категории
        for (const cat of categories) { // цикл - для каждой категории создаем свой <option>
            const option = document.createElement('option');
            option.value = cat.id;           // id для бэкенда
            option.textContent = cat.title;  // название в списке
            this.categoryNewElement.appendChild(option);
        }
        this.categoryNewElement.disabled = categories.length === 0;
    }


    validateForm() {  // метод для проверки полей
        let isValid = true;  // по умолчанию форма наша валидна

        // сделаем однотипную проверку всех полей с помощью перебора массива ячеек
        let arrayOfCells = [this.typeNewElement, this.categoryNewElement, this.dateNewElement, this.commentNewElement]; // массив текстовых инпутов, по которым будем проходиться во время валидации

        for (let i = 0; i < arrayOfCells.length; i++) {  // пройдемся циклом по массиву
            if (arrayOfCells[i].value) { // если поле валидно
                arrayOfCells[i].classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
            } else { // если поле не заполнено и не прошло требование регулярки
                arrayOfCells[i].classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
                isValid = false; // меняем состояние переменной на false, если после проверки оказались в этом месте
            }
        }

        const amountStr = this.amountNewElement.value.trim().replace(',', '.');
        const amountRegex = /^\d+([.,]\d{1,2})?$/;
        if (amountStr && amountRegex.test(amountStr) && Number(amountStr) > 0) {
            this.amountNewElement.classList.remove('is-invalid');
        } else {
            this.amountNewElement.classList.add('is-invalid');
            isValid = false;
        }


        return isValid; // после проверок переменная isValid примет на себя состояние false или true и вернет это состояние в функцию login() {}
    }


    // Ф обработчик события по клику "Создать" и сразу включать в себя валидацию
    async saveNewCategoryCell(e) {   // Ф принимает объект event
        e.preventDefault(); //предотвращаем дефолтное действие браузера

        if (this.validateForm()) { // если форма валидна отправляем все заполненные поля на бэкенд

            // опеределим элемент, кот будем отправлять на бэкенд
            const createData = {
                type: this.typeNewElement.value,
                amount: this.amountNewElement.value,
                date: this.dateNewElement.value,
                comment: this.commentNewElement.value,
                category_id: Number(this.categoryNewElement.value) // id из option.value

            };


            // если форма валидна отправляем все заполненные поля на бэкенд, все поля + input с картинкой
            const result = await HttpUtils.request('/operations', 'POST', true, createData);

            if (result.error || !result.response) {
                return alert('Не удалось создать операцию!');
            }
            console.log(result.response)
            window.location.hash = '#/transactions';
        }
    }
}