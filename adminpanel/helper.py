from django.shortcuts import render
from .constantvariables import *
import random
import time
from cryptography.fernet import Fernet
from datetime import datetime
import pdb
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import padding
from base64 import b64encode, b64decode

def renderfile(request,foldername=None,pagename=None,variableobj=None):
	if foldername:
		if variableobj:
			return render(request,APPFOLDERNAME+'/'+foldername+'/'+pagename+'.html',variableobj)
		else:
			return render(request,APPFOLDERNAME+'/'+foldername+'/'+pagename+'.html',{})
	else:
		if variableobj:
			return render(request,APPFOLDERNAME+'/'+pagename+'.html',variableobj)
		else:
			return render(request,APPFOLDERNAME+'/'+pagename+'.html',{})


def is_ajax(request):
    return request.META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
