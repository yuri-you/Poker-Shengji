import pymysql,datetime
conn=pymysql.connect(user="root",charset="utf8")
cursor=conn.cursor(cursor=pymysql.cursors.DictCursor)
sql="insert into poker_record(time,card) values( %(n1)s, %(n2)s)"
cursor.execute(sql,{'n1':datetime.datetime.now(),'n2':"abcdefg"})
conn.commit()