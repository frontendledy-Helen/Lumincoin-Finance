// в этом классе будем хранить названия ключей полученных с backend, чтобы в коде js не ошибиться в написании
// но ниже создадим Ф по работе с обновлением токена для запроса данных залогиненного пользователя

import config from "../config/config.js";

export class AuthUtils {
    static accessTokenKey = 'accessToken'; // свойства доступны без создания экземпляров
    static refreshTokenKey = 'refreshToken'; // свойства доступны без создания экземпляров
    static userTokenKey = 'user'; // свойства доступны без создания экземпляров

    // можем использовать на любой странице в таком виде: AuthUtils.accessTokenKey , но лучше создать Ф


    // используем на странице login.html и sign-up.html
    // метод setAuthInfo устанавливает значения
    static setAuthInfo(accessToken, refreshToken, user = null) { // записать в localStorage полученные токены с бэкенд, userInfo не обязательный
        localStorage.setItem(this.accessTokenKey, accessToken);
        localStorage.setItem(this.refreshTokenKey, refreshToken);
        // в случае ошибки, пришедшей с бэкенда, там не будет userInfo, то после обновления токенов, userInfo не обновится, останется прежним правильным
        if (user) {  // обезопасим, в случае ошибки с бэкенда
            localStorage.setItem(this.userTokenKey, JSON.stringify(user));
        }

    }

    // используем на странице logout.html
    // метод removeAuthInfo удаляет значения
    static removeAuthInfo() {  // удалить из localStorage полученные токены с бэкенд
        localStorage.removeItem(this.accessTokenKey);
        localStorage.removeItem(this.refreshTokenKey);
        localStorage.removeItem(this.userTokenKey);
    }

    // метод getAuthInfo получает значения и отдает их нам
    // т.к. нам иногда нужны разные значения ключа - key, мы используем if
    static getAuthInfo(key = null) { //по умолчанию key равно null

        if (key && [this.accessTokenKey, this.refreshTokenKey, this.userTokenKey].includes(key)) { // если ключ не null и имеет какое-либо значение из массива

            return localStorage.getItem(key); // то получим этот ключ который есть


// выше сделали оптимизацию этого кода
            // if (key === this.accessTokenKey) { // если нужно получить только accessToken
            //     return localStorage.getItem(this.accessTokenKey);
            // } else if (key === this.refreshTokenKey) {
            //     return localStorage.getItem(this.refreshTokenKey);
            // } else if (key === this.userInfoTokenKey) {
            //     return localStorage.getItem(this.userInfoTokenKey);
            // } else { // если запросили ключ, которого в перечне у нас нет
            //     return null; // возвращаем null
            // }

        } else { // если ключа нет, выводим все данные по всем токенам, которые пришли с бэкенд
            return {
                [this.accessTokenKey]: localStorage.getItem(this.accessTokenKey),
                [this.refreshTokenKey]: localStorage.getItem(this.refreshTokenKey),
                [this.userTokenKey]: JSON.parse(localStorage.getItem(this.userTokenKey))
            }
        }
    }

    // запрос на обновлние токена
    // Ф по запросу request не будем использовать, чтобы не зациклить функции, сделаем отдельный запрос
    static async updateRefreshToken() {  // Ф вернет false или true , получилось обновить токен ли нет
        let result = false; // по умолчанию токен не найден, такую фишку можем использовать, когда результат Ф false или true
        const refreshToken = this.getAuthInfo(this.refreshTokenKey); // получим из localStorage refreshToken
        if (refreshToken) {
            const response = await fetch(config.host + '/refresh', { // в переменную получили результат запроса с бэкенд
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({refreshToken: refreshToken}),
            });
            if (response && response.status === 200) { // если ответ успешный
                const tokens = await response.json(); // преобразуем полученный объект из accessToken, refreshToken и userId в .json
                if (tokens && !tokens.error) { // если ответ есть и там нет свойства error
                    this.setAuthInfo(tokens.accessToken, tokens.refreshToken) // получим в localStorage только accessToken и refreshToken, userId не меняем
                    result = true; // токены успешно обновились
                }
            }
        }
        if (!result) { // если не получилось обновить токены
            this.removeAuthInfo(); // удаляем все старые токены, чтобы пользователь залогинился заново
        }

        return result; // если не нашли refreshToken то вернется false, если токены успешно обновились то вернется true
    }
}




