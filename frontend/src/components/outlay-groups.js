import {AuthUtils} from "../utils/auth-utils.js";
import {HttpUtils} from "../utils/http-utils.js";


export class OutlayGroups {

    constructor() {

        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) || !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) { // если в localStorage нет accessToken и нет refreshToken
            window.location.hash = '#/';  // останавливаем Ф и сразу отправляем пользователя на страницу login, чтобы зарегистрировался
            return;
        }

       // this.pendingDeleteId = null; // запишем id карточки на которую кликнули
        this.newOutlayCategoryElement = document.getElementById('new-category');
        this.newOutlayCategoryElement.addEventListener('click', this.handleIncomeListClick.bind(this));

        const confirmDeleteBtn = document.getElementById('delete-input-group');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', this.deleteIncomeGroup.bind(this));
        }

        this.getIncomeGroups().then();
    }

    async getIncomeGroups() {
        const result = await HttpUtils.request('/categories/expense');

        if (result.error || !Array.isArray(result.response)) {
            return alert('Возникла ошибка при запросе категорий расхода. Обратитесь в поддержку');
        }

        this.showOutlayGroups(result.response);
    }

    showOutlayGroups(categories) {
        this.newOutlayCategoryElement.querySelectorAll('.new-outlay').forEach((el) => el.remove());

        for (let i = 0; i < categories.length; i++) {
            const mainElement = document.createElement('div');
            mainElement.setAttribute('data-id', categories[i].id);
            mainElement.className = 'col-12 col-sm-10 col-md-8 col-lg-4 col-xxl-3 d-flex flex-column p-3 border new-outlay';

            const title = document.createElement('h3');
            title.className = 'category-title';
            title.textContent = categories[i].title;

            const buttons = document.createElement('div');
            buttons.className = 'd-flex gap-2 buttons';

            const link = document.createElement('a');
            link.href = `#/edit-outlay-group?id=${categories[i].id}`;

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-primary fs-md edit-outlay-group';
            editBtn.textContent = 'Редактировать';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-danger fs-md outlay-delete-btn';
            deleteBtn.textContent = 'Удалить';
            deleteBtn.setAttribute('data-bs-toggle', 'modal');
            deleteBtn.setAttribute('data-bs-target', '#exampleModal');

            link.appendChild(editBtn);
            buttons.appendChild(link);
            buttons.appendChild(deleteBtn);
            mainElement.appendChild(title);
            mainElement.appendChild(buttons);

            this.newOutlayCategoryElement.appendChild(mainElement);
        }
    }

    // — «Удалить»: запоминаем data-id карточки до открытия модалки (DOM карточек ещё нет в конструкторе)
    // — клик по карточке: выделение и запись выбранного id в localStorage

    handleIncomeListClick(e) {
        const deleteTrigger = e.target.closest('.outlay-delete-btn');
        if (deleteTrigger && this.newOutlayCategoryElement.contains(deleteTrigger)) {
            const card = deleteTrigger.closest('.new-outlay');
            if (card) {
                this.pendingDeleteId = card.getAttribute('data-id');
            }
            return;
        }

        const categoryTarget = e.target.closest('.new-outlay');
        if (!categoryTarget || !this.newOutlayCategoryElement.contains(categoryTarget)) return;

        this.newOutlayCategoryElement.querySelectorAll('.new-outlay.is-active').forEach((c) => {
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

        window.location.hash = '#/outlay-groups/delete?id=' + encodeURIComponent(id); // переход на удаление карточки

        // закрыть модалку после нажатия кнопки "Да,удалить"
        const modalEl = document.getElementById('exampleModal');
        if (modalEl && typeof bootstrap !== 'undefined') {
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.hide();
        }
    }
}