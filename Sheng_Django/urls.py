"""Sheng_Django URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from Sheng_APP import views
urlpatterns = [
    # path('admin/', admin.site.urls),
    path("login/",views.login),
    path("addroom/",views.addroom),
    path("requestdata/",views.requestdata),
    path("testhtml/",views.testgamehtml),
    path("ready/",views.ready),
    path("calltrump/",views.calltrump),
    path("reallocate/",views.reallocate),
    path("maidi/",views.maidi),
    path("show_card/",views.show_card),
    path("check_big_mannual/",views.receive_check_big_mannual),
    path("withdraw/",views.withdraw),
    path('requestmodify/',views.requestmodify),
    path('modifydata/',views.modifydata),
]
