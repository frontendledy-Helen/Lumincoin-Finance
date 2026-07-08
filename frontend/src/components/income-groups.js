import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class IncomeGroups {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            window.location.hash = '#/';
            return;
        }

        this.pendingDeleteId = null; // запишем id карточки на которую кликнули
        this.newIncomeCategoryElement = document.getElementById('new-category');
        this.newIncomeCategoryElement.addEventListener('click', this.handleIncomeListClick.bind(this));

        const confirmDeleteBtn = document.getElementById('delete-input-group');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', this.deleteIncomeGroup.bind(this));
        }

        this.getIncomeGroups().then();
    }

    async getIncomeGroups() {
        const result = await HttpUtils.request('/categories/income');

        if (result.error || !Array.isArray(result.response)) {
            return alert('Возникла ошибка при запросе категорий дохода. Обратитесь в поддержку');
        }

        this.showIncomeGroups(result.response);
    }

    showIncomeGroups(categories) {
        this.newIncomeCategoryElement.querySelectorAll('.new-income').forEach((el) => el.remove());

        for (let i = 0; i < categories.length; i++) {
            const mainElement = document.createElement('div');
            mainElement.setAttribute('data-id', categories[i].id);
            mainElement.className = 'col-12 col-sm-10 col-md-8 col-lg-4 col-xxl-3 d-flex flex-column p-3 border new-income';

            const title = document.createElement('h3');
            title.className = 'category-title';
            title.textContent = categories[i].title;

            const buttons = document.createElement('div');
            buttons.className = 'd-flex gap-2 buttons';

            const link = document.createElement('a');
            link.href = `#/edit-income-group?id=${categories[i].id}`;

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-primary fs-md edit-input-group';
            editBtn.textContent = 'Редактировать';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-danger fs-md income-delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.setAttribute('data-bs-toggle', 'modal');
            deleteBtn.setAttribute('data-bs-target', '#exampleModal');

            link.appendChild(editBtn);
            buttons.appendChild(link);
            buttons.appendChild(deleteBtn);
            mainElement.appendChild(title);
            mainElement.appendChild(buttons);

            this.newIncomeCategoryElement.appendChild(mainElement);
        }
    }


     // — «Удалить»: запоминаем data-id карточки до открытия модалки (DOM карточек ещё нет в конструкторе)
     // — клик по карточке: выделение и запись выбранного id в localStorage

    handleIncomeListClick(e) {
        const deleteTrigger = e.target.closest('.income-delete-btn');
        if (deleteTrigger && this.newIncomeCategoryElement.contains(deleteTrigger)) {
            const card = deleteTrigger.closest('.new-income');
            if (card) {
                this.pendingDeleteId = card.getAttribute('data-id');
            }
            return;
        }

        const categoryTarget = e.target.closest('.new-income');
        if (!categoryTarget || !this.newIncomeCategoryElement.contains(categoryTarget)) return;

        this.newIncomeCategoryElement.querySelectorAll('.new-income.is-active').forEach((c) => {
            if (c !== categoryTarget) {
                c.classList.remove('is-active');
            }
        });

        categoryTarget.classList.toggle('is-active');
        const idGroup = categoryTarget.getAttribute('data-id');
        localStorage.setItem('data-id', idGroup);
    }

    deleteIncomeGroup() {
        const id = this.pendingDeleteId; // номер id по которому кликнули для удаления
        if (!id) return;

        // localStorage.setItem('data-id', id); // записали в localStorage id, не нужно, передаем через url

        window.location.hash = '#/income-groups/delete?id=' + encodeURIComponent(id); // переход на удаление карточки

        // закрыть модалку после нажатия кнопки "Да,удалить"
        const modalEl = document.getElementById('exampleModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
        }
    }
}
