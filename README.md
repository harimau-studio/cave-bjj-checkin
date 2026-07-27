# CAVE BJJ チェックインアプリ（自前サーバー版）

Claudeのアーティファクトから独立して、自分たちのサーバーで動かすための一式です。
中身は普通のWebアプリ（Node.js + Express + SQLite）なので、Renderやレンタルサーバーなど
好きなところにデプロイできます。

## 構成

```
cave-bjj-server/
├── server.js       ← サーバー本体（API + 静的ファイル配信）
├── package.json
├── public/
│   └── index.html  ← アプリ本体（会員登録・QRチェックイン・名簿）
└── data/            ← 実行すると自動でここにデータベースファイルができます
```

データ（会員名簿・チェックイン履歴・PIN）は `cave-bjj.sqlite` という1つのファイルに
保存されます。このファイルさえ残っていればデータは消えません。

---

## おすすめの方法：Render.com（一番簡単）

月1,000円弱〜、クレジットカードで契約でき、難しいサーバー管理は不要です。

1. **GitHubにアップロード**
   - GitHub（https://github.com）のアカウントを作る（無料）
   - 新しいリポジトリを作り、このフォルダの中身（server.js, package.json, public/ など）をアップロード
     - GitHubのWeb画面から "Add file → Upload files" でドラッグ＆ドロップでもOKです

2. **Renderでサービスを作る**
   - https://render.com にアクセスしてアカウント作成
   - 「New +」→「Web Service」を選択
   - 先ほどのGitHubリポジトリを選択して接続
   - 設定はそのままで基本OK（Build Command: `npm install` / Start Command: `npm start`）
   - 無料プランだと再起動でデータが消えることがあるので、**「Persistent Disk」を追加できる有料プラン（Starterプラン以上）**を選び、マウントパスを `/data` に設定してください
   - 「Create Web Service」で数分待つとデプロイ完了です

3. **独自ドメインをつなぐ（例：checkin.cave-gym.com）**
   - Renderの「Settings → Custom Domain」で `checkin.cave-gym.com` を追加
   - 表示されたCNAME情報を、cave-gym.comのDNS管理画面（お名前.com やドメインを買った会社の管理画面）に追加
   - 反映まで数十分〜数時間かかることがあります
   - RenderがHTTPS（鍵マーク）も自動で設定してくれます

これで `https://checkin.cave-gym.com` のような自分たちの見やすいURLで、
スタッフ全員がスマホから同じデータにアクセスできるようになります。

---

## 代替案：さくらのVPS・ConoHa VPSなど（自由度は高いが手間もかかる）

Linuxサーバーを直接借りて、自分でNode.jsをインストールし、
`pm2`（常時起動用）や`nginx`（HTTPS対応）を設定する方法です。
サーバー管理の知識がある方向けです。必要であれば手順を追加でご案内できます。

---

## ローカルで動作確認する場合

```
npm install
npm start
```

その後ブラウザで `http://localhost:3000` を開くと動作確認できます。
（同じWi-Fi内のスマホからは `http://（パソコンのIPアドレス）:3000` でアクセス可能）

---

## データのバックアップ

アプリ内の「会員名簿 → データ管理 → バックアップを保存(JSON)」から、いつでも
全データをダウンロードできます。念のため定期的に保存しておくことをおすすめします。

サーバー側でも、`cave-bjj.sqlite` ファイルを定期的にコピーしておくとより安心です。
