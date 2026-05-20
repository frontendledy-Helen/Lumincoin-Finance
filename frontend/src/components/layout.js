import {AuthUtils} from "../utils/auth-utils.js";
import {Logout} from "./logout.js";
import {HttpUtils} from "../utils/http-utils.js";


export class Layout {

    constructor() {

        this.authorizedUserElement = document.getElementById('user');
        this.getUserName();

        this.dashboardElement = document.getElementById('dashboard');
        this.transactionsElement = document.getElementById('transactions');

        this.toggleUserElement = document.getElementById('dropdown-toggle');
        this.toggleUserElement.addEventListener('click', this.openMenu.bind(this));
        this.logoutElement = document.getElementById('logout');
        this.logoutElement.addEventListener('click', this.logoutInPage.bind(this));

        this.incomeGroups = document.getElementById('income-groups');
        this.outlayGroups = document.getElementById('outlay-groups');

        this.balanceElement = document.getElementById('balance');
        this.balanceElement.addEventListener('click', this.inputBalance.bind(this));
        this.balanceInputElement = document.getElementById('balance-input');

        this.updateBalanceButton = document.getElementById('update-balance-button');
        this.updateBalanceButton.addEventListener('click', this.updateBalance.bind(this));

        this.getBalance().then();
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
        const userRaw = AuthUtils.getAuthInfo(AuthUtils.userTokenKey);
        const user = userRaw ? JSON.parse(userRaw) : null;
        const name = user?.name;
        const lastName = user?.lastName;
        this.authorizedUserElement.innerText = `${name} ${lastName}`;
    }

    async getBalance() {
        const accessTokenKeyElement = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey);
        if (!accessTokenKeyElement) return;
        if (!this.balanceElement) return;
        const result = await HttpUtils.request('/balance'); // запрос баланса

        if (result.error || !result.response) {
            console.log('Не получилось получить баланс');
            return;
        }
        this.balanceElement.innerText = result.response.balance;
    }

    openMenu() {
        const isOpen = this.toggleUserElement.classList.toggle('open');
        this.toggleUserElement.setAttribute('aria-expanded', 'true');
        this.toggleUserElement.setAttribute(String(isOpen), '');

        document.addEventListener('click', (e) => { //клик в любое место закроет меню
            if (!this.toggleUserElement.contains(e.target)) {
                this.toggleUserElement.classList.remove('open');
                this.toggleUserElement.setAttribute('aria-expanded', 'false');
            }
        });
    }

    async logoutInPage() {
        const logout = new Logout();
        await logout.logout();
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

    async inputBalance() {
        const result = await HttpUtils.request('/balance'); // запрос баланса

        if (result.error || !result.response) {
            console.log('Не получилось получить баланс');
            return;
        }

        this.balanceInputElement.value = result.response.balance; //записали в модальное окно баланс с бэкенда
    }

    async updateBalance() {
        const response = await HttpUtils.request('/balance');

        if (response.error || !response.response) return;

        const newBalance = this.balanceInputElement.value; //запишем баланс бэкенда в модалку

        if (newBalance !== response.response.balance) { //если новый баланс, отправим на бэкенд новый баланс
            const result = await HttpUtils.request('/balance', 'PUT', true, {
                newBalance: newBalance
            });

            if (result.error || !result.response) return;

            // обновляем отображение баланса
            this.balanceElement.innerText = result.response.balance;

            // закрываем модалку
            const modalEl = document.getElementById('exampleModalAside');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
            // вернуть фокус на "Баланс", чтобы не было a11y warning
            this.balanceElement.focus?.();
        }
    }


}