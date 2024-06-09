#
# python3 merge_csv.py data 2024
# ./data/1234/*.csv -> ./data/1234/2024.csv
# 

import sys
import pathlib
import pandas
import os
import re

def prepare_save_path(p, year):
    savepath = None
    for f in p.glob("**/" + year + "*.csv"):
        if savepath == None:
            filename = os.path.basename(str(f))
            dirname = os.path.dirname(str(f))
            savepath = "{0}/{1}.csv".format(dirname, filename[0:4])
    if os.path.exists(savepath): os.remove(savepath)
    return savepath

def merge_csv(p, year):
    data = []
    savepath = prepare_save_path(p, year)
    for f in sorted(p.glob("**/" + year + "*.csv")):
        data.append(pandas.read_csv(f))
        df = pandas.concat(data, axis=0, sort=False)
    df.to_csv(savepath, index=False)
    return savepath

def main():
    if len(sys.argv) <= 2:
        print("missing parameter path of csv directory or year")
        exit()

    p = pathlib.Path(sys.argv[1])
    if not p.is_dir():
        print("parameter must be a directory")
        exit()

    year = sys.argv[2]
    if not re.match("202\d", str(year)):
        print("parameter must be a greater than 2020")
        exit()

    for f in sorted(p.iterdir()):
        if not f.is_dir(): continue
        savepath = merge_csv(f, year)
        print(savepath)


if __name__ == "__main__":
    main()