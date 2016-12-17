./a.out
if [ $? -eq 0 ]; then
    for i in $(seq 1 8)
    do
        f=`printf "%02d" ${i}`
        convert image/$f.ppm image/$f.png
    done
    convert image/wall.ppm image/wall.png
    convert image/back.ppm image/back.png
    convert image/net.ppm image/net.png
    convert image/eraser.ppm image/eraser.png
fi
