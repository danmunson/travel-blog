
if [[ ! -d .blogdata && -d blogdata-template ]]
then
    cp -r blogdata-template .blogdata
    mkdir .blogdata/content
    mkdir .blogdata/media
    mkdir .blogdata/compressed-media
    echo "New persistence structure at $PWD/.blogdata"
else
    echo ".blogdata exists OR blogdata-template not found in $PWD"
fi

