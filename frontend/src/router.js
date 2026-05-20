import {SignUp} from "./components/sign-up.js";
import {Login} from "./components/login.js";
import {Dashboard} from "./components/dashboard.js";
import {Logout} from "./components/logout.js";
import {IncomeGroups} from "./components/income-groups.js";
import {Transactions} from "./components/transactions.js";
import {OutlayGroups} from "./components/outlay-groups.js";
import {Layout} from "./components/layout.js";
import {EditTransaction} from "./components/edit-transaction.js";
import {CreatIncomeGroup} from "./components/create-income-group.js";
import {EditIncomeGroups} from "./components/edit-income-group.js";
import {DeleteIncomeCategory} from "./components/delete-income-category.js";
import {DeleteOutlayCategory} from "./components/delete-outlay-category.js";
import {EditOutlayGroups} from "./components/edit-outlay-group.js";
import {CreatOutlayGroup} from "./components/create-outlay-group.js";
import {CreateNewTransaction} from "./components/create-new-transaction.js";
import {DeleteTransaction} from "./components/delete-transaction.js";


export class Router {

    constructor() {

        this.titlePageElement = document.getElementById('title'); // сохраним этот элемент, чтобы каждый раз, когда переходим на страницу не вызывать поиск этого элемента
        this.contentElement = document.getElementById('content'); // сохраним этот элемент - он изначально будет блок div#content - далее будем перенправлять его значение
        this.asideElement = document.getElementById('paste-aside');

        this.initEvents(); // вызываем Ф запуска роутера, которая описана ниже // инициализация events (эвентов)


        // создадим массив всех наших страниц, по которым возможно перемещение, а также начинать с любой страницы вход на сайт
        this.routes = [   // в массиве routes объекты со следующими полями (свойствами)

            {
                route: '#/dashboard',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Главная',  // заголовок страницы dashboard.html // пропишется в URL
                template: '/templates/dashboard.html', // путь до файла html, который мы будем подставлять в файл index.html
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
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
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new IncomeGroups();
                }
            },
            {
                route: '#/income-groups/delete',  // удаляем категорию дохода или расхода
                load: () => { //Ф создаем экземпляр класса
                    new DeleteIncomeCategory();
                }
            },
            {
                route: '#/create-income-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать категорию доходов',  // заголовок страницы // пропишется в URL
                template: '/templates/create-income-group.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new CreatIncomeGroup();
                }
            },
            {
                route: '#/edit-income-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать категорию доходов',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-income-group.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new EditIncomeGroups();
                }
            },
            {
                route: '#/outlay-groups',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Все категории расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/outlay-groups.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new OutlayGroups();
                }
            },
            {
                route: '#/outlay-groups/delete',  // удаляем категорию дохода или расхода
                load: () => { //Ф создаем экземпляр класса
                    new DeleteOutlayCategory();
                }
            },
            {
                route: '#/create-outlay-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать категорию расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/create-outlay-group.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new CreatOutlayGroup();
                }
            },
            {
                route: '#/edit-outlay-group',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать категорию расходов',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-outlay-group.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new EditOutlayGroups();
                }
            },
            {
                route: '#/transactions',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Доходы и расходы',  // заголовок страницы // пропишется в URL
                template: '/templates/transactions.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new Transactions();
                }
            },
            {
                route: '#/transactions/delete',  // удаляем категорию дохода или расхода
                load: () => { //Ф создаем экземпляр класса
                    new DeleteTransaction();
                }
            },
            {
                route: '#/new-transaction',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Создать доход или расход',  // заголовок страницы // пропишется в URL
                template: '/templates/new-transaction.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new CreateNewTransaction();
                }
            },
            {
                route: '#/edit-transaction',  // это сам URL по которому можно перейти и открыть соответствующую страницу, # - исп-ся чтобы не было сразу перехода
                title: 'Редактировать доход или расход',  // заголовок страницы // пропишется в URL
                template: '/templates/edit-transaction.html', // путь до файла html, который мы будем подставлять в файл
                useLayout: '/templates/layout.html', //делаем подключение aside для всех страниц где он нужен
                styles: 'styles/style.css', // путь к стилям
                load: () => { //Ф создаем экземпляр класса
                    new EditTransaction();
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

            if (newRoute.template) { // если есть шаблон у странички на которую перешли
                // document.body.className = ''; // когда перешли на новую страничку очистим сначала все классы у body
                let contentBlock = this.contentElement; // изменяемое значение элемента this.contentElement начальное состояние div#content описано в конструкторе (будет либо div#content-layout или div#content)
                if (newRoute.useLayout) { // если основной шаблон layout.html прописан к страничке в массиве routes
                    this.contentElement.innerHTML = await fetch(newRoute.useLayout).then(response => response.text()); // в div#content-layout запишется html разметка, которая хранится в объекте массива routes, под useLayout:
                    contentBlock = document.getElementById('content-layout'); // перенаправим элемент this.contentElement на div#content-layout
                    new Layout();
                }
                // если нет у странички newRoute.useLayout то в this.contentPageElement для div#content, а если есть то запишется в div#content-layout
                contentBlock.innerHTML = await fetch(newRoute.template).then(response => response.text()); // в div#content запишется html разметка, которая хранится в объекте массива routes, под template
            }

            if (newRoute.load && typeof newRoute.load === 'function') {
                newRoute.load();
            }

        } else {
            console.log('Маршрут не найден');
        }
    }
}