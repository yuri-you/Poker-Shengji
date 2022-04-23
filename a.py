import pymysql,datetime,json
conn = pymysql.connect(user='debian-sys-maint',charset='utf8',password="lPVVX9pMskl6Vzoj",database="shengji")
cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
instruction="select card_information from shengji where time=%(n1)s;"
cardtime="2022-04-23 02:49:00"
cursor.execute(instruction,{"n1":cardtime})
fetch_card=cursor.fetchall()
poker=json.loads(fetch_card[0]['card_information'])
xf=2
# sql="insert into poker_record(time,card) values( %(n1)s, %(n2)s)"
# cursor.execute(sql,{'n1':datetime.datetime.now(),'n2':"abcdefg"})
# conn.commit()