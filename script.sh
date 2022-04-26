properties=( \"name\" \"content\" \"label\")

for i in "${properties[@]}"
do
  if [ -z "$1" ]; then
    count=`grep -ro --include \*.json "$i" ./ | wc -l`
  else
    count=`grep -ro --include $1 "$i" ./ | wc -l`
  fi
  echo "$i: $count"
done
