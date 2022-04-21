def main():    
    room=0
    game_data=[dict()]
    game_data[0]['trump']=0
    game_data[0]['nowlevel']=2
    def sort_card(str1):
        game_data
        if str1=="bigjoker":return 54
        elif str1=="joker":return 53
        color=str1[1]
        if str1[1]=='D':color=1
        elif str1[1]=='C':color=2
        elif str1[1]=='H':color=3
        else: color=0
        if game_data[room]['trump']==9:trumpcolor=0
        else: trumpcolor=game_data[room]['trump']%4
        if str1[0]=='K':number=13
        elif str1[0]=='Q':number=12
        elif str1[0]=='J':number=11
        elif str1[0]=='T':number=10
        elif str1[0]=='A':number=14
        else:number=int(str1[0])
        if number==game_data[room]['nowlevel']:#打的主，如打2的时候的2
            color_level=3-(trumpcolor+4-color)%4
            return 49+color_level
        else:
            color_level=3-(trumpcolor+4-color)%4
            if number>game_data[room]['nowlevel']:card_number=number-2
            else: card_number=number-1
            return color_level*12+card_number
    print(sort_card("8S"))
    print(sort_card("2D"))
    print(sort_card("2H"))
    print(sort_card("joker"))
if __name__=='__main__':
    main()