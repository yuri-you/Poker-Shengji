f=open("card.css","w")
for i in range(100):
    f.write(".img%(id)d{\n\tposition:absolute;\n\tleft:%(distance)dpx;\n}"%{"id":i,"distance":i*20})
f.close()