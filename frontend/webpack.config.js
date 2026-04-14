// этот код берем на сайте webpack в Getting Started / Using a Configuration

import path from "node:path";
import {fileURLToPath} from "node:url";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    entry: "./src/app.js",  //переименовываем файл под нашу точку входа, куда подключаем роуты
    mode: "development",   // требуется вписать самим, чтобы не показывало предупреждение от webpack
    output: {
        filename: "app.js", // это будет создаваться папка dist, там тоже можем создавать такой же файл
        path: path.resolve(__dirname, "dist"),
    },
    devServer: {
        static: 'dist',
        compress: true,
        port: 9000,
        historyApiFallback: true,
    },
    plugins: [
        new HtmlWebpackPlugin(
            {
                template: "./index.html",
            }),
        new CopyPlugin({

            patterns: [
                {from: "./src/templates", to: "templates"},
                {from: "./src/static/images", to: "images"},
                {from: "./src/static/fonts", to: "fonts"},
                {from: "./src/styles", to: "styles"},
            ],
        }),
    ],
}
;