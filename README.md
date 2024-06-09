# 潮汐CSVのダウンロード

* [TidesScrapeArea7](https://docs.google.com/spreadsheets/d/1bvcqXbE-apl_1dp5tXze-TtzQs8qx9bBj2dre2ttA0g/edit#gid=0) でDrive保存されているCSVをダウンロード
* `./data_converter/data` 以下へ解凍

# 作業ディレクトリ移動

```
cd data_converter
```

# 月別のCSVを年間結合

```
python3 merge_csv.py data 2025
```

# 年間のCSVをJSON変換

```
python3 csv2json.py data
```

# 月別のCSV削除

```
find ./data -type f \( ! -name '[0-9][0-9][0-9][0-9].csv' -and ! -name '[0-9][0-9][0-9][0-9].json' \) -exec rm {} +
```

# 年間のJSONを公開用に移動（事前確認）

```
find -E ./data -type f -regex '.*/[0-9]{4}.(json|csv)$' -exec sh -c '
  for file do
    dir=$(dirname "$file")
    dir_name=$(basename "$dir")
    last_two_digits=${dir_name: -2}
    target_dir="../docs/data/47/$last_two_digits"
    echo "Would move $file to $target_dir/"
  done
' sh {} +
```

# 年間のJSONを公開用に移動

```
find -E ./data -type f -regex '.*/[0-9]{4}.(json|csv)$' -exec sh -c '
  for file do
    dir=$(dirname "$file")
    dir_name=$(basename "$dir")
    last_two_digits=${dir_name: -2}
    target_dir="../docs/data/47/$last_two_digits"
    echo "Moving $file to $target_dir/"
    mkdir -p "$target_dir"
    mv "$file" "$target_dir/"
  done
' sh {} +
```

# サーバーの起動

```
cd ../data_converter
npm run server
```

# 動作確認

* [https://127.0.0.1:8080/](https://127.0.0.1:8080/)