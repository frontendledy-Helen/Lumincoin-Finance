import {SignUp} from "./components/sign-up.js";
import {Login} from "./components/login.js";
import {AuthUtils} from "./utils/auth-utils.js";
import {Dashboard} from "./components/dashboard.js";
import {Logout} from "./components/logout.js";
import {IncomeGroups} from "./components/income-groups.js";
import {UserName} from "./utils/userName.js";
import {Transactions} from "./components/transactions.js";
import {OutlayGroups} from "./components/outlay-groups.js";


export class Router {

    constructor() {

        this.titlePageElement = document.getElementById('title'); // сохраним этот элемент, чтобы каждый раз, когда переходим на страницу не вызывать поиск этого элемента
        this.contentElement = document.getElementById('content'); // сохраним этот элемент - он изначально будет блок div#content - далее будем перенправлять его значение


        this.initEvents(); // вызываем Ф запуска роутера, которая описана ниже // инициализация events (эвентов)


        // создадим массив всех наших страниц, по которым возможно перемещение, а также начинать с любой страницы вход на сайт
        this.routes = [   // в массиве routes объекты со следующими полями (свойствами)

            {
                route: '#/dashboard',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Главная',  // заголовок страницы dashboard.html // пропишется в URL
                template: '/templates/dashboard.html', // путь до файла html, который мы будем подставлять в файл index.html
                styles: 'styles/style.css', // путь к стилям
                load: () => {
                    new Dashboard();
                }
            },
            {
                route: '#/signup',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Регистрация',  // заголовок страницы // пропишется в URL
                template: '/templates/sign-up.html', // путь до файла html,
                styles: 'styles/style.css', // путь к стилям form.css
                load: () => { //Ф создаем экземпляр класса SignUp
                    new SignUp(); // создаем экземпляр класса SignUp из файла signUp.js, сделать экспорт и ипорт
                }
            },
            {
                route: '#/',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Вход в систему',  // заголовок страницы // пропишется в URL
                template: '/templates/login.html', // путь до файла html,
                styles: 'styles/style.css', // путь к стилям form.css
                load: () => { //Ф создаем экземпляр класса Login
                    new Login(); // создаем экземпляр класса Login из файла login.js, сделать экспорт и ипорт
                }
            },
            {
                route: '#/logout', // роут для выхода из авторизации и переход на страничку /login
                load: () => {
                    new Logout();
                }

            },
            {
                route: '#/income-groups',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Все категории доходов',  // заголовок страницы // пропишется в URL
                template: '/templates/income-groups.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new IncomeGroups();
                }
            },
            {
                route: '#/create-income-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать категорию доходов',  // заголовок страницы // пропишется в URL
                template: '/templates/create-income-group.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            },
            {
                route: '#/edit-income-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать категорию доходов',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-income-group.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            },
            {
                route: '#/outlay-groups',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Все категории расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/outlay-groups.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new OutlayGroups();
                }
            },
            {
                route: '#/create-outlay-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать категорию расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/create-outlay-group.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            },
            {
                route: '#/edit-outlay-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать категорию расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-outlay-group.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            },
            {
                route: '#/transactions',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Доходы и расходы',  // заголовок страницы // пропишется в URL
                template: '/templates/transactions.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new Transactions();
                }
            },
            {
                route: '#/new-transaction',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать доход или расход',  // заголовок страницы // пропишется в URL
                template: '/templates/new-transaction.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            },
            {
                route: '#/edit-transaction',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать доход или расход',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-transaction.html', // путь до файла html, который мы будем подставлять в файл
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса

                }
            }
        ]


    }

    initEvents() { // Ф запуска роутера
        window.addEventListener('DOMContentLoaded', this.activateRoute.bind(this)); // запустить роутер в правильный момент, после первой загрузки html элементов, после перезагрузки
        window.addEventListener('hashchange', this.activateRoute.bind(this)); // запустить роутер при переходе по страницам, вперед, назад, поменялся URL
    }

    async activateRoute() {

        // для опеределения, какой сейчас открыт роут, сначала проверим, что у нас сейчас находится в url адресе
        // нужно найти часть url, которая идет после домена, для этого используем location.pathname
        const urlRoute = window.location.hash.split('?')[0];// определим на какой странице мы находимся
        const newRoute = this.routes.find(item => item.route === urlRoute); // определение страницы на которой сейчас находимся (найдем объект в массиве), пройдемся по массиву routes

        if (!newRoute) { // если роут не подгрузился из URL
            window.location.hash = '#/'; //отправляем пользователя на главную страницу
            return; //и останавливаем работу Ф
        }

        if (newRoute) {
            if (newRoute.title) {
                this.titlePageElement.innerHTML = newRoute.title + ' | Lumincoin Finance';
            }

            if (newRoute.template) {
                this.contentElement.innerHTML = await fetch(newRoute.template).then(response => response.text());
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('Маршрут не найден');
        }

    }


}