佐藤医院 Webサイト（静的 HTML / CSS）
====================================

【閲覧方法】
この ZIP を展開し、index.html をブラウザで開いてください。
PC向け幅1440pxのデザインを、添付PDFを基準として再現しています。
レスポンシブ対応は今回の指定に従って実装していません。

【ファイル構成】
index.html                 トップページ
news.html                  お知らせ
about.html                 クリニック概要・施設紹介
staff.html                 スタッフ紹介
treatment.html            診療案内
faq.html                   よくあるご質問
access.html                アクセス
contact.html               お問い合わせ
css/style.css              共通スタイル
assets/                    ご提供の画像素材・logo.png

【HTML / CSS のみで実装した動き】
・当院について / 診療内容: ヘッダーの詳細メニュー（details / summary）
・MENU: ヘッダーの全体メニュー（details / summary）
・スタッフ紹介: 各カードの「+」からプロフィールを表示（CSS :target）
・FAQ: 質問クリックで回答を開閉（details / summary）
・トップ画像: patient_1.jpg → medical_1.jpg → information_2.jpg を無限ループ
  初回12秒間表示した後、12秒ごとに10秒間のフェード切り替え開始
  3枚を固定位置で重ね、ページレイアウトが動かない構造です。
・アクセス: Google Mapsの台東区上野エリアをiframeで表示

【留意事項】
・Noto Sans JP / Zen Old Mincho は Google Fonts を読み込んでいます。
  初回表示やオフライン環境では、代替フォントが使われる場合があります。
・Googleマップの描画はインターネット接続が必要です。
  住所「東京都台東区上野0-0-0」はデザイン内の仮住所なので、
  地図は上野エリアの中心を表示します。実際の所在地が決まったら
  access.html の iframe の検索クエリを更新してください。
・予約・オンライン診療・お問い合わせ送信には、実運用時に
  予約システムやフォーム送信サーバーを接続する必要があります。
  現状のお問い合わせフォームはメールアプリへの受け渡し（mailto）です。
・お知らせ日付・住所・電話番号・氏名等はデザインで提示された内容を
  用いたサンプル表示です。運用前に正しい内容に差し替えてください。

【使用技術】
HTML5 / CSS3 / Google Fonts / Google Maps iframe
JavaScript・フレームワークは使っていません。
