import { AuthUtils } from "../utils/auth-utils.js";
import { HttpUtils } from "../utils/http-utils.js";

export class DeleteTransaction {

    constructor() {
        if (!AuthUtils.getAuthInfo(AuthUtils.accessTokenKey) ||
            !AuthUtils.getAuthInfo(AuthUtils.refreshTokenKey)) {
            window.location.hash = '#/';
            return;
        }

        const id = this.getIdFromHash();
        if (!id) {
            window.location.hash = '#/transactions';
            return;
        }

        this.deleteOperation(id).then();
    }

    getIdFromHash() {
        const hash = window.location.hash;
        const queryString = hash.includes('?') ? hash.split('?')[1] : '';
        if (!queryString) return null;

        const params = new URLSearchParams(queryString);
        return params.get('id');
    }

    async deleteOperation(id) {
        const result = await HttpUtils.request(
            '/operations/' + encodeURIComponent(id),
            'DELETE',
            true
        );

        if (result.error) {
            alert('Не удалось удалить операцию. Обратитесь в поддержку.');
            window.location.hash = '#/transactions';
            return;
        }

        window.location.hash = '#/transactions';
    }
}