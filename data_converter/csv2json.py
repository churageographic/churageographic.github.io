#
# python3 csv2json.py data
# ./data/1234/*.csv -> ./data/1234/2024.json
# 

import sys
import pathlib
import pandas

def csv2json(p_file):
    df = pandas.read_csv(p_file)
    json_file = str(p_file).replace(".csv",".json")
    df.to_json(json_file, orient="records")
    print("done: " + json_file)

def main():
    if len(sys.argv) == 1:
        print("missing parameter csv path or directory")
        exit()

    p = pathlib.Path(sys.argv[1])

    if p.is_dir():
        for f in p.glob("**/*.csv"):
            csv2json(f)
    else:
        if not p.suffix == ".csv":
            print("invalid suffix: '{0}'".format(p.suffix))
            exit()

        csv2json(p)

if __name__ == "__main__":
    main()