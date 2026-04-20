import {AuthUtils} from "../utils/auth-utils.js";
import {Logout} from "./logout.js";


export class Layout {

    constructor() {

        this.authorizedUserElement = document.getElementById('user');
        this.getUserName();

        this.dashboardElement = document.getElementById('dashboard');
        this.transactionsElement = document.getElementById('transactions');



        this.logoutElement = document.getElementById('logout');
        this.logoutElement.addEventListener('click', this.logoutInPage.bind(this));

        this.incomeGroups = document.getElementById('income-groups');
        this.outlayGroups = document.getElementById('outlay-groups');

        this.setActiveMenuByRoute();
        this.changeColor();
        this.getBorder();
        this.changeImage();
    }

    setActiveMenuByRoute() {
        const currentRoute = window.location.hash.split('?')[0]; // определим на какой странице мы находимся (#/login, /#dashboard, /#signup)/
        const menuItems = document.querySelectorAll('[data-routes]'); // и сравнивает маршрут с data-route каждой кнопки
        menuItems.forEach(item => {
            const routes = item.dataset.routes.split(',').map(r => r.trim());
            const isActive = routes.includes(currentRoute);
            item.classList.toggle('active', isActive);
            item.classList.toggle('link-dark', !isActive);

        });
        const categoriesBtn = document.getElementById('dropdownMenuClickableInside');
        if (categoriesBtn) {
            const inCategories = [
                '#/income-groups', '#/outlay-groups', '#/create-income-group',
                '#/create-outlay-group', '#/edit-income-group', '#/edit-outlay-group',
            ].includes(currentRoute);
            categoriesBtn.classList.toggle('active', inCategories);
            categoriesBtn.classList.toggle('link-dark', !inCategories);
            const ulElement = document.getElementById('ul-show');
            ulElement.classList.toggle('show', inCategories);
        }

        if (this.transactionsElement) {
            const inTransactions = ['#/transactions', '#/edit-transaction', '#/new-transaction'].includes(currentRoute);
            this.transactionsElement.classList.toggle('active', inTransactions);
            this.transactionsElement.classList.toggle('link-dark', !inTransactions);
        }

    }


    getUserName() {
        const raw = AuthUtils.getAuthInfo(AuthUtils.userTokenKey);
        const user = raw ? JSON.parse(raw) : null;
        const name = user?.name;
        const lastName = user?.lastName;
        this.authorizedUserElement.innerText = `${name} ${lastName}`;
    }

    logoutInPage() {
        const logout = new Logout();
        logout.logout().then();
        window.location.hash = '#/';
    }

    changeColor() {
        if (this.incomeGroups.classList.contains('active')) {
            this.outlayGroups.classList.remove('link-dark');
            this.outlayGroups.classList.add('text-color');
        } else if (this.outlayGroups.classList.contains('active')) {
            this.incomeGroups.classList.remove('link-dark');
            this.incomeGroups.classList.add('text-color');
        }
    }

    getBorder() {
        if (this.incomeGroups.classList.contains('active') || this.outlayGroups.classList.contains('active')) {
            this.incomeGroups.classList.add('border-category');
            this.outlayGroups.classList.add('border-category');

            const image = document.getElementById('icon-arrow');
            const imgHover = document.getElementById('img-hover');
            image.src = "../images/icon-arrow-white.png";
           // imgHover.classList.remove('img-hover');
        }
    }

    changeImage() {
        if (this.dashboardElement.classList.contains('active')) {
            const image = document.getElementById('img-home');
            image.src = "../images/icon-home.png";
        }

        if (this.transactionsElement.classList.contains('active')) {
            const image = document.getElementById('img-budget');
            image.src = "../images/icon-budget-white.png";
        }


    }


}