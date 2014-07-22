YEAR_AGO=$(date --date="1 year ago" +"%Y%m%d")
DATE="$YEAR_AGO"

while [ "$DATE" != "$(date +'%Y%m%d')" ]
do
  DATE=$(date --date="$DATE + 1 day" +"%Y%m%d")
  echo $DATE

  for i in {1..30}
  do
    echo "$DATE $i" > past_commit
    git commit -am "$DATE $i" --date="$(date --date=$DATE)" > /dev/null 2>&1
  done
  
  git push
done

