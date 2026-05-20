import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class Transactions {
    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }




        this.createNewIncomeElement = document.getElementById('create-income'); // кнопка создания Дохода
        this.createNewIncomeElement.addEventListener('click', this.createNewIncomeCell.bind(this));
        this.createNewOutlayElement = document.getElementById('create-outlay'); // кнопка создания Расхода
        this.createNewOutlayElement.addEventListener('click', this.createNewOutlayCell.bind(this));

        this.recordsElement = document.getElementById('records'); // сюда вставляем таблицу с операциями, получаем с бэкенд

        this.pendingDeleteId = null;

        this.recordsElement.addEventListener('click', this.handleRecordsClick.bind(this));
        const confirmDeleteBtn = document.getElementById('delete-operation');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', this.confirmDeleteOperation.bind(this));
        }

        this.periodButtons = document.querySelectorAll('.period-btn');
        this.intervalBlock = document.getElementById('interval-block');
        this.dateFromElement = document.getElementById('dateFrom');
        this.dateToElement = document.getElementById('dateTo');

        this.restoreFilterState();   // период и кнопки из localStorage
        this.initPeriodFilters();
        this.getOperations().then();
    }

    createNewIncomeCell() { // передаем в url - доход
        window.location.hash = '#/new-transaction?type=' + 'income'; // переход на создание карточки дохода
    }

    createNewOutlayCell() { // передаем в url - доход
        window.location.hash = '#/new-transaction?type=' + 'expense'; // переход на создание карточки дохода
    }

    initPeriodFilters() {
        this.periodButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const period = btn.getAttribute('data-period');
                this.setActivePeriod(period);
                if (period === 'interval') {
                    this.intervalBlock.classList.remove('d-none');
                    this.intervalBlock.classList.add('d-flex');
                    this.loadIntervalIfReady();
                    return;
                }
                this.intervalBlock.classList.add('d-none');
                this.intervalBlock.classList.remove('d-flex');
                this.getOperations().then();
            });
        });

        const onIntervalChange = () => {
            if (this.currentPeriod === 'interval') {
                this.loadIntervalIfReady();
            }
        };
        this.dateFromElement.addEventListener('change', onIntervalChange);
        this.dateToElement.addEventListener('change', onIntervalChange);
    }

    setActivePeriod(period) {
        this.currentPeriod = period;
        this.periodButtons.forEach((btn) => {
            const isActive = btn.getAttribute('data-period') === period;
            btn.classList.toggle('btn-secondary', isActive);
            btn.classList.toggle('btn-outline-secondary', !isActive);
        });
        this.saveFilterState();
    }

    // сохраним период в локалсторадж, на котором произвели удаление, чтобы после удаления вернуться на этот же период
    saveFilterState() {
        localStorage.setItem('transactions-filter', JSON.stringify({
            period: this.currentPeriod || 'today',
            dateFrom: this.dateFromElement ? this.dateFromElement.value : '',
            dateTo: this.dateToElement ? this.dateToElement.value : '',
        }));
    }

    restoreFilterState() {
        const raw = localStorage.getItem('transactions-filter');

        if (!raw) {
            this.setActivePeriod('today');
            return;
        }

        const data = JSON.parse(raw);
        const period = data.period || 'today';

        this.setActivePeriod(period);

        if (period === 'interval') {
            this.intervalBlock.classList.remove('d-none');
            this.intervalBlock.classList.add('d-flex');
            if (data.dateFrom) this.dateFromElement.value = data.dateFrom;
            if (data.dateTo) this.dateToElement.value = data.dateTo;
        } else {
            this.intervalBlock.classList.add('d-none');
            this.intervalBlock.classList.remove('d-flex');
        }
    }

    loadIntervalIfReady() {
        const from = this.dateFromElement.value;
        const to = this.dateToElement.value;
        if (from && to) {
            if (from > to) {
                return alert('Дата «с» не может быть позже даты «по»');
            }
            this.saveFilterState();
            this.getOperations().then();
        }
    }

    buildOperationsUrl() {
        const params = new URLSearchParams();
        if (this.currentPeriod === 'today') {
            // бэкенд без period = только сегодня
            return '/operations';
        }
        if (this.currentPeriod === 'interval') {
            params.set('period', 'interval');
            params.set('dateFrom', this.dateFromElement.value);
            params.set('dateTo', this.dateToElement.value);
        } else {
            params.set('period', this.currentPeriod); // week | month | year | all
        }
        return `/operations?${params.toString()}`;
    }

    async getOperations() {
        const url = this.buildOperationsUrl();
        const result = await HttpUtils.request(url);
        if (result.error || !Array.isArray(result.response)) {
            return alert('Возникла ошибка при запросе операций. Обратитесь в поддержку');
        }
        this.showOperations(result.response);
    }


    showOperations(operations) {

        this.recordsElement.innerHTML = '';  // очистить старые строки

        if (operations.length === 0) { // если операций нет
            const emptyRow = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 7;
            cell.textContent = 'Операций пока нет';
            emptyRow.appendChild(cell);
            this.recordsElement.appendChild(emptyRow);
            return;
        }

        for (let i = 0; i < operations.length; i++) {
            const op = operations[i];
            const row = document.createElement('tr');
            row.setAttribute('data-id', op.id);

            // № операции
            const thNum = document.createElement('th');
            thNum.className = 'col-xxl-auto align-middle';
            thNum.scope = 'row';
            thNum.textContent = i + 1;  // порядковый номер

            // Тип
            const tdType = document.createElement('td');
            tdType.className = 'align-middle ' +
                (op.type === 'income' ? 'text-success' : 'text-danger');
            tdType.textContent = op.type === 'income' ? 'доход' : 'расход';

            // Категория
            const tdCategory = document.createElement('td');
            tdCategory.className = 'align-middle';
            tdCategory.textContent = op.category || 'Без категории';

            // Сумма
            const tdAmount = document.createElement('td');
            tdAmount.className = 'align-middle';
            tdAmount.textContent = `${op.amount}₽`;

            // Дата
            const tdDate = document.createElement('td');
            tdDate.className = 'align-middle';
            tdDate.textContent = this.formatDate(op.date);

            // Комментарий
            const tdComment = document.createElement('td');
            tdComment.className = 'text-break';
            tdComment.textContent = op.comment || '';

            // Действия (удалить / редактировать)
            const tdActions = document.createElement('td');
            tdActions.className = 'text-center text-nowrap align-middle';
            const actionsWrap = document.createElement('div');
            actionsWrap.className = 'd-inline-flex gap-2 align-items-center';

            const deleteLink = document.createElement('a');
            deleteLink.href = 'javascript:void(0)';
            deleteLink.setAttribute('data-bs-toggle', 'modal');
            deleteLink.setAttribute('data-bs-target', '#exampleModal');
            deleteLink.className = 'operation-delete-btn'; // чтобы сработала кнопка удаление

            const deleteImg = document.createElement('img');
            deleteImg.src = '../images/trash-icon.png';
            deleteImg.alt = 'Trash icon';
            deleteLink.appendChild(deleteImg);

            const editLink = document.createElement('a');
            editLink.href = `#/edit-transaction?id=${op.id}`;
            const editImg = document.createElement('img');
            editImg.src = '../images/pen-icon.png';
            editImg.alt = 'Pen icon';

            editLink.appendChild(editImg);
            actionsWrap.appendChild(deleteLink);
            actionsWrap.appendChild(editLink);
            tdActions.appendChild(actionsWrap);


            row.appendChild(thNum);
            row.appendChild(tdType);
            row.appendChild(tdCategory);
            row.appendChild(tdAmount);
            row.appendChild(tdDate);
            row.appendChild(tdComment);
            row.appendChild(tdActions);

            this.recordsElement.appendChild(row);
        }
    }

    handleRecordsClick(e) {
        const deleteTrigger = e.target.closest('.operation-delete-btn');
        if (!deleteTrigger || !this.recordsElement.contains(deleteTrigger)) {
            return;
        }
        const row = deleteTrigger.closest('tr');
        if (row) {
            this.pendingDeleteId = row.getAttribute('data-id');
        }
    }
    confirmDeleteOperation() {
        const id = this.pendingDeleteId;
        if (!id) return;

        this.saveFilterState();  //запомнить период перед удалением

        window.location.hash = '#/transactions/delete?id=' + encodeURIComponent(id);
        const modalEl = document.getElementById('exampleModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modalInstance = bootstrap.Modal.getInstance(modalEl)
                || bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
        }
    }

    formatDate(dateStr) {
        // "2022-09-11" → "11.09.2022"
        const [year, month, day] = dateStr.split('-');
        if (!year || !month || !day) return dateStr;
        return `${day}.${month}.${year}`;
    }
}