import config from "../config/config.js";
import {AuthUtils} from "./auth-utils.js";


export class HttpUtils {

    // если у нас GET запрос, то заполнять body нам не надо и в Ф request сделаем по умолчанию body = null
    // передаем нужный URL в виде /login или /sign-up + по умолчанию метод GET
    static async request(url, method = "GET", useAuth = true, body = null) { // асинхронная Ф - запрос данных
        const result = {  // создадим объект result, для обработки ошибки
            error: false, // по умолчанию ошибки нет
            response: null, // сообщения об ошибке нет
            // redirect: null, // по умолчанию перенаправление на другую страницу, но будем его использовать если нет токена
        }

        const params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        let token = null; // вначале по умолчанию token = null

        if (useAuth) { // если useAuth = true // если нужна авторизация
            token = AuthUtils.getAuthInfo(AuthUtils.accessTokenKey); // получим токен из localStorage
            if (token) {
                params.headers['authorization'] = token; // присвоим в headers авторизацию по токену, чтобы получить данные по запросу
            }
        }

        if (body) { // если в request пришло body
            params.body = JSON.stringify(body); // то в объект params под наименование body: запишем объекты в виде .json файла

        }

        // обезопасим себя от ошибок при получении запроса
        let response = null;  // чтобы const response была видна вне try-catch создадим ее здесь со значением по умолчанию null

        try {
            response = await fetch(config.host + url, params);  // получаем ответ на запрос в переменную response
            result.response = await response.json(); // в объект result (кот создали выше) будем размещать ответ в виде строки .json

        } catch (e) { // если произошла какая-то ошибка
            result.error = true; // в объекте result и свойстве error устанавливаем true - произошла ошибка
            return result; // по факту там будет только флаг error: со значением - true
        }

        // если запрос у нас прошел успешно, но меньше 200 и больше 300,то это все-таки ошибка
        if (response.status < 200 || response.status >= 300) {
            result.error = true; // в объекте result и свойстве error устанавливаем true - произошла ошибка
            if (useAuth && response.status === 401) { // если с бэкенд вернулась ошибка 401 === если нет токена или токен старый
                if (!token) {
                    //если токена нет
                    result.redirect = '#/'; // переводим пользователя на страницу login
                } else {
                    //если токен устарел/невалидный, у нас есть спец запрос на POST Refresh
                    // т.к. async updateRefreshToken() то обязательно надо поставить await AuthUtils.updateRefreshToken();
                    const updateTokenResult = await AuthUtils.updateRefreshToken(); // вызовем Ф для обновления токена - получим false или true

                    if (updateTokenResult) { //если true
                        // запрос повторно
                        // вернуть результат потому что у нас будет двойной вызов Ф request в Ф request
                        return this.request(url, method, useAuth, body);
                    } else {
                        result.redirect = '#/'; // если не получилось обновить токен, то также переводим пользователя на страницу login
                    }
                }
            }
        }

        return result;
    }
}