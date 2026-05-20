import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";

export class EditTransaction {
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

       document.getElementById('saveButton').addEventListener('click', this.saveEditTransactions.bind(this)); //на кнопку навешан обработчик события клика и сработает метод saveNewCategoryCell

        const idFromUrl = this.getIdFromUrlHash(); // достанем тип из URL (доход или расход)
        if (!idFromUrl) {
            window.location.hash = '#/transactions';
            return;
        }

        this.getEditTransaction(idFromUrl).then(); // запрос данных с бекенда по id из url

    }

    getIdFromUrlHash() { // найдем id из url
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('id');
    }

    async getEditTransaction(id) {
        this.operationId = id; // сохраним для PUT

        const result = await HttpUtils.request('/operations/' + encodeURIComponent(id), 'GET', true);

        if (result.error || !result.response) {
            alert('Не удалось получить данные по операции. Обратитесь в поддержку.');
            window.location.hash = '#/transactions';
            return;
        }

        const op = result.response;
        this.operationType = op.type; // 'income' | 'expense' — для сохранения при отправке PUT (income или expense)

        // Тип (только показ)
        this.typeNewElement.value = op.type === 'income' ? 'Доход' : 'Расход';

        // Остальные поля
        this.amountNewElement.value = op.amount;
        this.dateNewElement.value = op.date;
        this.commentNewElement.value = op.comment || '';

        await this.loadCategories(op.type); // загрузить список категорий по типу операции
        this.setSelectedCategory(op.category); // выбрать старую категорию в селекте

        // исходные значения для сравнения, отправка PUT только то, что изменилось
        this.originalData = {
            category_id: this.categoryNewElement.value
                ? Number(this.categoryNewElement.value)
                : null,
            amount: Number(op.amount),
            date: op.date,
            comment: (op.comment || '').trim(),
        };
    }

    setSelectedCategory(categoryTitle) { // постаить старую категорию в опцию
        const options = this.categoryNewElement.options;
        for (let i = 0; i < options.length; i++) {
            if (options[i].textContent === categoryTitle) {
                this.categoryNewElement.value = options[i].value; // id
                break;
            }
        }

        if (!categoryTitle) { // если категория удалена — остаётся «Выберите категорию...»
            this.categoryNewElement.disabled = false;
            return;
        }
        const optionsCategory = this.categoryNewElement.options;
        for (let i = 0; i < optionsCategory.length; i++) {
            if (optionsCategory[i].textContent === categoryTitle) {
                this.categoryNewElement.value = optionsCategory[i].value;
                break;
            }
        }
        this.categoryNewElement.disabled = false; // селект можно менять
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


    getFormData() { // соберем значения формы, после редактирования
        const categoryId = Number(this.categoryNewElement.value);
        const amount = Number(this.amountNewElement.value.trim().replace(',', '.'));
        const date = this.dateNewElement.value.trim();
        const comment = (this.commentNewElement.value || '').trim();

        return {
            type: this.operationType,
            category_id: categoryId,
            amount: amount,
            date: date,
            comment: comment,
        };
    }

    hasChanges(formData) { // проверка - есть ли изменения
        return formData.category_id !== this.originalData.category_id
            || formData.amount !== this.originalData.amount
            || formData.date !== this.originalData.date
            || formData.comment !== this.originalData.comment;
    }

    validateForm() {  // метод для проверки полей
        let isValid = true;  // по умолчанию форма наша валидна

        // сделаем однотипную проверку всех полей с помощью перебора массива ячеек
        let requiredFields = [this.categoryNewElement, this.amountNewElement, this.dateNewElement, this.commentNewElement]; // массив текстовых инпутов, по которым будем проходиться во время валидации

        for (let i = 0; i < requiredFields.length; i++) {  // пройдемся циклом по массиву
            if (requiredFields[i].value) { // если поле валидно
                requiredFields[i].classList.remove('is-invalid'); // если пользователь исправил ошибку удалим красное поле
            } else { // если поле не заполнено и не прошло требование регулярки
                requiredFields[i].classList.add('is-invalid'); // добавим класс который выводит сообщение об ошибке и краснит инпут
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
    async saveEditTransactions(e) {   // Ф принимает объект event
        e.preventDefault(); //предотвращаем дефолтное действие браузера

        const formData = this.getFormData() // старые значения инпутов - formData это массив

        if (!this.hasChanges(formData)) {  // если при сравнении старых значений - изменения не найдены
            window.location.hash = '#/transactions';
            return;
        }

        if (!this.validateForm()) {
            return alert('Проверьте заполнение полей');
        }

        if (this.validateForm()) { // если форма валидна отправляем все заполненные поля на бэкенд

            // если форма валидна отправляем все заполненные поля на бэкенд
            const result = await HttpUtils.request('/operations/' + encodeURIComponent(this.operationId), 'PUT', true, formData);

            if (result.error || !result.response) {
                return alert('Не удалось сохранить изменения!');
            }
            console.log(result.response)
            window.location.hash = '#/transactions';
        }
    }
}