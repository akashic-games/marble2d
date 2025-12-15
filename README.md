<p align="center">
<img src="https://raw.githubusercontent.com/akashic-games/marble2d/main/img/akashic.png"/>
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

https://akashic-games.github.io/marble2d/api/index.html

## ビルド方法

Marble2D は TypeScript で書かれたライブラリであるため、ビルドには Node.js が必要です。

```sh
npm install
npm run build
```

## 開発者向け

### 本ツールの publish について
* 以下の手順を踏むことで publish が行われます。
  1. package.json の version を更新したコミットを作成
  2. 1 のコミットで master ブランチを更新する
  3. GitHub Actions のリリースワークフローが実行される
* package-lock.json が原因で publish に失敗した場合は、`npm i --before <実行時の7日前の日付(yyyy-mm-dd)>` を実行して package-lock.json を更新し、再度 publish 処理を行なってください。

## ライセンス

本リポジトリは MIT License の元で公開されています。
詳しくは [LICENSE](./LICENSE.txt) をご覧ください。

ただし、画像ファイルおよび音声ファイルは
[CC BY 2.1 JP](https://creativecommons.org/licenses/by/2.1/jp/) の元で公開されています。
