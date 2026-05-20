// здесь класс для странички dashboard.html
// вызывать экземпляр класса будем в router.js в объекте массива routes, под load: () => new Dashboard()
import {Chart} from 'chart.js/auto'; // скачали npm i chart.js и здесь подключили
import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class Dashboard {
    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;

        }

        // начало - графики
        this.incomeChart = null;
        this.expenseChart = null;
        this.chartColors = [
            '#dc3545', // Red
            '#fd7e14', // Orange
            '#ffc107', // Yellow
            '#20c997', // Green
            '#0d6efd', // Blue
        ];

        this.periodButtons = document.querySelectorAll('.period-btn');
        this.intervalBlock = document.getElementById('interval-block');
        this.dateFromElement = document.getElementById('dateFrom');
        this.dateToElement = document.getElementById('dateTo');

        //найдем элементы графиков
        this.incomeCanvas = document.getElementById('incomeChart');
        this.expenseCanvas = document.getElementById('outlayChart');

        this.setActivePeriod('today');
        this.initPeriodFilters();
        this.getOperations().then();

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
    }

    loadIntervalIfReady() {
        const from = this.dateFromElement.value;
        const to = this.dateToElement.value;
        if (from && to) {
            if (from > to) {
                return alert('Дата «с» не может быть позже даты «по»');
            }
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
        this.updateCharts(result.response);
    }

    // Суммы по категориям для одного типа (income / expense)
    aggregateByCategory(operations, type) {
        const map = {};
        for (const op of operations) {
            if (op.type !== type) continue;
            const name = op.category || 'Без категории';
            map[name] = (map[name] || 0) + op.amount;
        }
        return {
            labels: Object.keys(map),
            values: Object.values(map),
        };
    }

    getBackgroundColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(this.chartColors[i % this.chartColors.length]);
        }
        return colors;
    }

    buildPieConfig(labels, values) {
        return {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: this.getBackgroundColors(labels.length),
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false, // легенда у вас в HTML
                    },
                },
            },
        };
    }

    renderOrUpdateChart(canvas, chartRef, labels, values) {
        const config = this.buildPieConfig(labels, values);
        if (!labels.length) {
            labels = ['Нет данных'];
            values = [1];
            config.data.labels = labels;
            config.data.datasets[0].data = values;
            config.data.datasets[0].backgroundColor = ['#dee2e6'];
        }
        const existing = Chart.getChart(canvas);
        if (existing) {
            existing.destroy();
        }
        return new Chart(canvas, config);
    }

    updateCharts(operations) {
        const incomeData = this.aggregateByCategory(operations, 'income');
        const expenseData = this.aggregateByCategory(operations, 'expense');

        const incomeColors = this.getBackgroundColors(incomeData.labels.length);
        const expenseColors = this.getBackgroundColors(expenseData.labels.length);

        this.incomeChart = this.renderOrUpdateChart(
            this.incomeCanvas,
            this.incomeChart,
            incomeData.labels,
            incomeData.values
        );
        this.expenseChart = this.renderOrUpdateChart(
            this.expenseCanvas,
            this.expenseChart,
            expenseData.labels,
            expenseData.values
        );
        this.updateLegend('income', incomeData.labels);
        this.updateLegend('expense', expenseData.labels);
    }

    // Подписи под цветными кнопками
    updateLegend(side, labels, colors = []) {
        const container = document.querySelector(
            side === 'income'
                ? '.my-border-block .color-section'
                : '.col-xxl-6:not(.my-border-block) .color-section'
        );
        if (!container) return;
        const labelElements = container.querySelectorAll('label');
        labelElements.forEach((label, i) => {
            const span = label.querySelector('span');
            const btn = label.querySelector('button');
            if (labels[i]) {
                label.style.display = '';
                span.textContent = labels[i];
                if (btn && colors[i]) {
                    btn.style.backgroundColor = colors[i];
                    btn.style.borderColor = colors[i];
                }
            } else {
                label.style.display = 'none'; // нет категории — скрыть пункт
            }
        });
    }
}
