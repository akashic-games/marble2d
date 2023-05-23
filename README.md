<p align="center">
<img src="img/akashic.png"/>
</p>

# Marble2D

Marble2D はシンプルな物理エンジンです。[Akashic Engine](https://akashic-games.github.io/)上での利用を念頭に開発されていますが、単体での利用も可能となっています。

円と多角形の剛体の運動を扱うことができます。機能豊富ではありませんが、ファイルサイズが小さいためちょっとした演出などに気軽に物理シミュレーションを導入できます。

## 利用方法

[Akashic Engine](https://akashic-games.github.io/)で利用する手順を説明します。

[akashic-cli](https://github.com/akashic-games/akashic-cli)をインストールした後、

```sh
akashic install @akashic-extension/marble2d
```

でインストールできます。コンテンツからは、

```javascript
var m2d = require("@akashic-extension/marble2d");
```

で利用してください。

Akashic Engineの詳細な利用方法については、 [公式ページ](https://akashic-games.github.io/) を参照してください。

## サンプル

`sample` ディレクトリにサンプルが用意されています。詳細はサンプルの `README.md` を参照してください。

## APIリファレンス

https://akashic-games.github.io/reference/marble2d/index.html

## ビルド方法

Marble2D は TypeScript で書かれたライブラリであるため、ビルドには Node.js が必要です。

```sh
npm install
npm run build
```

## ライセンス

本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE.txt) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
