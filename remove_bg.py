from PIL import Image

def remove_bg(img_path):
    img = Image.open(img_path).convert("RGBA")
    datas = img.getdata()
    newData = []
    for item in datas:
        # If the pixel is very dark, make it transparent
        if item[0] < 15 and item[1] < 15 and item[2] < 15:
            newData.append((0, 0, 0, 0))
        else:
            newData.append(item)
    img.putdata(newData)
    img.save(img_path, "PNG")
    print("Background removed successfully.")

remove_bg("public/exismic-app-icon.png")
